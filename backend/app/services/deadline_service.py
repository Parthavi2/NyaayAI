import re
from typing import List
 
WITHIN_RE = re.compile(r"within\s+\d+\s+days?", re.I)
BY_DATE_RE = re.compile(r"by\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", re.I)
BEFORE_RE = re.compile(r"before\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", re.I)
 
 
def extract_deadlines(text: str) -> List[str]:
    deadlines = []
    deadlines += WITHIN_RE.findall(text)
    deadlines += BY_DATE_RE.findall(text)
    deadlines += BEFORE_RE.findall(text)
    return list(dict.fromkeys(deadlines))  # deduplicate
 