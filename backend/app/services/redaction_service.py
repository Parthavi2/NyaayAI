import re
from typing import Tuple, List
 
EMAIL_RE = re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b")
PHONE_RE = re.compile(r"\b\d{10}\b")
AADHAAR_RE = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
PAN_RE = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
 
 
def redact_pii(text: str) -> Tuple[str, List[str]]:
    redactions = []
 
    if EMAIL_RE.search(text):
        text = EMAIL_RE.sub("[REDACTED_EMAIL]", text)
        redactions.append("email")
 
    if PHONE_RE.search(text):
        text = PHONE_RE.sub("[REDACTED_PHONE]", text)
        redactions.append("phone")
 
    if AADHAAR_RE.search(text):
        text = AADHAAR_RE.sub("[REDACTED_AADHAAR]", text)
        redactions.append("aadhaar")
 
    if PAN_RE.search(text):
        text = PAN_RE.sub("[REDACTED_PAN]", text)
        redactions.append("pan")
 
    return text, redactions
 