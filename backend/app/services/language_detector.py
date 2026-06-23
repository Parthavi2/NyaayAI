from langdetect import detect
from app.services.translation_service import normalize_output_language


def detect_language(text: str) -> str:
    try:
        if not text.strip():
            return "unknown"
        return normalize_output_language(detect(text), fallback="en")
    except Exception:
        return "unknown"
