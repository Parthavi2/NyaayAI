from typing import Dict, List
from app.core.config import settings
import json
import requests


async def generate_llm_output(
    text: str,
    extracted_fields: Dict,
    doc_meta: Dict,
    fraud: Dict,
    deadlines: List[str],
    guidance: List[str],
    tone: str,
    output_language: str,
) -> Dict:

    provider = settings.LLM_PROVIDER.lower()

    if provider == "ollama":
        return await _ollama_output(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language)
    elif provider == "openai" and settings.OPENAI_API_KEY:
        return await _openai_output(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language)
    else:
        return _mock_output(doc_meta, fraud)


def _build_prompt(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language) -> str:
    return f"""You are NyaayAI, a legal-assistance AI for Indian citizens.
Analyse this legal document and respond in {output_language} language.

Document type: {doc_meta['document_type']}
Case type: {doc_meta['case_type']}
Tone: {tone}
Risk score: {fraud['risk_score']} ({fraud['risk_label']})
Risk reasons: {fraud['risk_reasons']}
Deadlines: {deadlines}
Extracted fields: {extracted_fields}

Document text:
{text[:3000]}

Respond ONLY with a valid JSON object with exactly these three keys:
- summary: a 2-3 sentence plain summary string
- explanation: a detailed plain-language explanation string
- reply_draft: a professional reply letter as a plain string

All values must be plain strings, not nested objects or dicts.
Return only valid JSON, no markdown, no extra text."""


async def _ollama_output(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language) -> Dict:
    prompt = _build_prompt(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language)
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=120,
        )
        response.raise_for_status()
        raw = response.json().get("response", "{}")
        parsed = json.loads(raw)

        summary = parsed.get("summary", "")
        if isinstance(summary, dict):
            summary = _mock_output(doc_meta, fraud)["summary"]

        explanation = parsed.get("explanation", "")
        if isinstance(explanation, dict):
            explanation = _mock_output(doc_meta, fraud)["explanation"]

        reply = parsed.get("reply_draft", "")
        if isinstance(reply, dict) or not reply:
            reply = _default_reply()

        return {
            "summary": str(summary),
            "explanation": str(explanation),
            "reply_draft": str(reply),
        }
    except Exception as e:
        print(f"Ollama error: {e}")
        return _mock_output(doc_meta, fraud)


async def _openai_output(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language) -> Dict:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = _build_prompt(text, extracted_fields, doc_meta, fraud, deadlines, tone, output_language)
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        parsed = json.loads(content)

        reply = parsed.get("reply_draft", _default_reply())
        if isinstance(reply, dict):
            reply = _default_reply()

        return {
            "summary": str(parsed.get("summary", "Summary not available.")),
            "explanation": str(parsed.get("explanation", "Explanation not available.")),
            "reply_draft": str(reply),
        }
    except Exception as e:
        print(f"OpenAI error: {e}")
        return _mock_output(doc_meta, fraud)


def _mock_output(doc_meta: Dict, fraud: Dict) -> Dict:
    doc_type = doc_meta.get("document_type", "document")
    case_type = doc_meta.get("case_type", "legal matter")
    risk = fraud.get("risk_label", "Unknown")

    return {
        "summary": (
            f"This appears to be a {doc_type} related to a {case_type}. "
            f"The document has been assessed as '{risk}' based on automated analysis. "
            "Please review the full details in the dashboard."
        ),
        "explanation": (
            f"You have received a {doc_type} concerning a {case_type}. "
            "Our AI has analysed the document for authenticity, key information, and potential risks. "
            f"The risk level is '{risk}'. "
            "Please review the fraud indicators, deadlines, and next steps carefully before taking any action. "
            "Do not make any payment or sign any document without consulting a qualified advocate."
        ),
        "reply_draft": _default_reply(),
    }


def _default_reply() -> str:
    return """To,
The Sender / Concerned Party,

Dear Sir/Madam,

I write in response to your communication received by me. I acknowledge receipt of the said document. However, I wish to state that I am currently reviewing the contents with legal counsel.

I request you to kindly furnish documentary proof and certified copies of any agreement or authority you rely upon, within seven (7) days of this letter.

I reserve all my legal rights and remedies in this matter. Nothing in this response shall be construed as an admission of liability.

Yours faithfully,
[Your Name]
[Address]
[Date]"""