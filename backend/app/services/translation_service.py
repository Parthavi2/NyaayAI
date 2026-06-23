import json
import requests
from app.core.config import settings

SUPPORTED_LANGUAGES = {
    "en": {"name": "English",  "native_name": "English"},
    "hi": {"name": "Hindi",    "native_name": "हिन्दी"},
    "mr": {"name": "Marathi",  "native_name": "मराठी"},
    "bn": {"name": "Bengali",  "native_name": "বাংলা"},
    "ta": {"name": "Tamil",    "native_name": "தமிழ்"},
    "te": {"name": "Telugu",   "native_name": "తెలుగు"},
    "kn": {"name": "Kannada",  "native_name": "ಕನ್ನಡ"},
    "gu": {"name": "Gujarati", "native_name": "ગુજરાતી"},
    "pa": {"name": "Punjabi",  "native_name": "ਪੰਜਾਬੀ"},
}

LANGUAGE_ALIASES = {
    "english":  "en",
    "hindi":    "hi",
    "marathi":  "mr",
    "bengali":  "bn",
    "bangla":   "bn",
    "tamil":    "ta",
    "telugu":   "te",
    "kannada":  "kn",
    "gujarati": "gu",
    "punjabi":  "pa",
}


def normalize_output_language(value: str | None, fallback: str | None = None) -> str:
    fallback_code = fallback or settings.DEFAULT_OUTPUT_LANGUAGE
    if not settings.ENABLE_REGIONAL_LANGUAGES:
        return fallback_code
    if not value:
        return fallback_code
    normalized = value.strip().lower().replace("_", "-")
    if normalized in SUPPORTED_LANGUAGES:
        return normalized
    if normalized in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[normalized]
    if "-" in normalized:
        base = normalized.split("-", 1)[0]
        if base in SUPPORTED_LANGUAGES:
            return base
    return fallback_code


def get_supported_languages() -> list[dict[str, str]]:
    return [
        {"code": code, "name": meta["name"], "native_name": meta["native_name"]}
        for code, meta in SUPPORTED_LANGUAGES.items()
    ]


def get_language_label(code: str) -> str:
    meta = SUPPORTED_LANGUAGES.get(
        normalize_output_language(code),
        SUPPORTED_LANGUAGES[settings.DEFAULT_OUTPUT_LANGUAGE],
    )
    return f"{meta['name']} ({meta['native_name']})"


def translate_text_via_groq(text: str, target_language: str) -> str:
    """
    Translate a plain string to the target language using Groq.
    Falls back to original text if translation fails.
    """
    if not settings.GROQ_API_KEY:
        return text
    lang_label = get_language_label(target_language)
    if normalize_output_language(target_language) == "en":
        return text  # already English, skip API call

    prompt = (
        f"Translate the following text to {lang_label}. "
        f"Preserve all proper nouns, law names, section numbers, and legal terms in their original form. "
        f"Return only the translated text with no explanation or preamble.\n\n"
        f"TEXT:\n{text}"
    )
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 2000,
            },
            timeout=settings.AI_HTTP_TIMEOUT_SEC,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"Translation error: {exc}")
        return text


def translate_analysis_fields(fields: dict, target_language: str) -> dict:
    """
    Translate the human-readable fields of an analysis result.
    Skips fields that are structured data (lists of dicts, law names, etc.)
    """
    lang = normalize_output_language(target_language)
    if lang == "en":
        return fields

    translated = dict(fields)

    # Translate top-level narrative strings
    for key in ("summary", "explanation", "reply_draft"):
        if fields.get(key) and isinstance(fields[key], str):
            translated[key] = translate_text_via_groq(fields[key], lang)

    # Translate next_steps details
    if isinstance(fields.get("next_steps"), list):
        new_steps = []
        for step in fields["next_steps"]:
            if isinstance(step, dict):
                new_step = dict(step)
                if step.get("details"):
                    new_step["details"] = translate_text_via_groq(step["details"], lang)
                new_steps.append(new_step)
        translated["next_steps"] = new_steps

    # Translate rights information
    if isinstance(fields.get("rights_information"), list):
        new_rights = []
        for right in fields["rights_information"]:
            if isinstance(right, dict):
                new_right = dict(right)
                for field in ("title", "detailed_explanation", "when_to_contact_legal_aid_or_authority"):
                    if right.get(field):
                        new_right[field] = translate_text_via_groq(right[field], lang)
                new_rights.append(new_right)
        translated["rights_information"] = new_rights

    return translated
