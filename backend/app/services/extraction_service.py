import re
from typing import Dict, List
 
DATE_RE = re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b")
AMOUNT_RE = re.compile(r"(?:Rs\.?|INR|₹)\s?[\d,]+")
REF_RE = re.compile(
    r"(?:reference|ref|notice|case|fir)\s*(?:no\.?|number)?\s*[:\-]?\s*([A-Za-z0-9\/\-]+)",
    re.I,
)
 
 
def extract_fields(text: str) -> Dict:
    dates: List[str] = DATE_RE.findall(text)
    amounts: List[str] = AMOUNT_RE.findall(text)
    refs = REF_RE.findall(text)
 
    return {
        "dates": list(dict.fromkeys(dates)),       # deduplicate
        "amounts": list(dict.fromkeys(amounts)),
        "reference_numbers": list(dict.fromkeys(refs)),
    }
 