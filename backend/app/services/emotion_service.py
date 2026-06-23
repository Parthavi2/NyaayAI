def detect_tone(text: str) -> str:
    lower = text.lower()
 
    threatening_words = ["urgent", "final warning", "arrest", "immediately", "failure", "action will be taken", "legal proceedings"]
    formal_words = ["hereby", "pursuant", "whereas", "aforesaid", "hereinafter"]
 
    threatening_count = sum(1 for w in threatening_words if w in lower)
    formal_count = sum(1 for w in formal_words if w in lower)
 
    if threatening_count >= 3:
        return "threatening/urgent"
    elif threatening_count >= 1 and formal_count >= 1:
        return "formal/stern"
    elif formal_count >= 2:
        return "neutral/formal"
    else:
        return "neutral/informal"
 