from app.core.config import settings

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native_name": "English"},
    "hi": {"name": "Hindi", "native_name": "हिन्दी"},
    "mr": {"name": "Marathi", "native_name": "मराठी"},
    "bn": {"name": "Bengali", "native_name": "বাংলা"},
    "ta": {"name": "Tamil", "native_name": "தமிழ்"},
    "te": {"name": "Telugu", "native_name": "తెలుగు"},
    "kn": {"name": "Kannada", "native_name": "ಕನ್ನಡ"},
    "gu": {"name": "Gujarati", "native_name": "ગુજરાતી"},
    "pa": {"name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
}

LANGUAGE_ALIASES = {
    "english": "en",
    "hindi": "hi",
    "marathi": "mr",
    "bengali": "bn",
    "bangla": "bn",
    "tamil": "ta",
    "telugu": "te",
    "kannada": "kn",
    "gujarati": "gu",
    "punjabi": "pa",
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
    return [{"code": code, "name": meta["name"], "native_name": meta["native_name"]} for code, meta in SUPPORTED_LANGUAGES.items()]


def get_language_label(code: str) -> str:
    meta = SUPPORTED_LANGUAGES.get(normalize_output_language(code), SUPPORTED_LANGUAGES[settings.DEFAULT_OUTPUT_LANGUAGE])
    return f"{meta['name']} ({meta['native_name']})"
