from langdetect import detect
 
 
def detect_language(text: str) -> str:
    try:
        if not text.strip():
            return "unknown"
        return detect(text)
    except Exception:
        return "unknown"
 