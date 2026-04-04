import re
from typing import Dict, List


SUBJECT_RE = re.compile(r"(?:subject|sub)\s*[:\-]\s*(.+)", re.I)
SECTION_RE = re.compile(r"(?:u/s|under section|section)\s+([0-9A-Za-z()./\-]+)", re.I)


def parse_notice_details(text: str, extracted_fields: Dict, deadlines: List[str], risk_reasons: List[str]) -> Dict:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    compact_lines = lines[:80]
    lower_lines = [line.lower() for line in compact_lines]

    sender = _extract_sender(compact_lines, lower_lines)
    receiver = _extract_receiver(compact_lines, lower_lines)
    subject = _extract_subject(compact_lines)
    demanded_action = _extract_demanded_action(lines)
    issue_problem = _extract_issue_problem(text, subject, demanded_action)
    possible_consequences = _extract_consequences(lines)
    supporting_lines = _supporting_lines(lines)
    authority_sender_type = _extract_authority_type(text, sender)

    if risk_reasons:
        possible_consequences = list(dict.fromkeys(possible_consequences + ["Fraud verification is recommended before responding."]))

    return {
        "sender": sender,
        "receiver": receiver,
        "subject": subject,
        "issue_problem": issue_problem,
        "demanded_action": demanded_action,
        "possible_consequences": possible_consequences,
        "deadlines": deadlines,
        "authority_sender_type": authority_sender_type,
        "supporting_lines": supporting_lines[:6],
    }


def _extract_sender(lines: List[str], lower_lines: List[str]) -> str:
    for index, line in enumerate(lower_lines):
        if line.startswith("from:") or line.startswith("from "):
            return lines[index].split(":", 1)[-1].strip() or "Not clearly identified"

    for index, line in enumerate(lines[:12]):
        if any(token in line.lower() for token in ["advocate", "law office", "legal department", "bank", "police", "court", "authority"]):
            return line

    return "Not clearly identified"


def _extract_receiver(lines: List[str], lower_lines: List[str]) -> str:
    for index, line in enumerate(lower_lines):
        if line in {"to,", "to"} and index + 1 < len(lines):
            return lines[index + 1]
        if line.startswith("to:") or line.startswith("to "):
            return lines[index].split(":", 1)[-1].strip() or "Not clearly identified"

    return "Not clearly identified"


def _extract_subject(lines: List[str]) -> str:
    for line in lines[:20]:
        match = SUBJECT_RE.search(line)
        if match:
            return match.group(1).strip()
    for line in lines[:12]:
        if "legal notice" in line.lower() or "summons" in line.lower() or "notice" in line.lower():
            return line
    return "Subject not clearly stated"


def _extract_demanded_action(lines: List[str]) -> str:
    action_patterns = [
        "pay",
        "appear",
        "reply",
        "vacate",
        "cease",
        "stop",
        "submit",
        "furnish",
        "attend",
        "comply",
    ]
    for line in lines:
        lower = line.lower()
        if any(token in lower for token in action_patterns):
            return line
    return "The demanded action is not clearly stated."


def _extract_issue_problem(text: str, subject: str, demanded_action: str) -> str:
    lower = text.lower()
    if any(token in lower for token in ["cheque", "dishonour", "bounce"]):
        return "The notice appears to relate to cheque dishonour or non-payment."
    if any(token in lower for token in ["loan", "outstanding", "dues", "recovery", "payment"]):
        return "The notice appears to relate to an alleged payment or recovery dispute."
    if any(token in lower for token in ["property", "tenant", "vacate", "lease", "rent"]):
        return "The notice appears to relate to a property, rent, or possession dispute."
    if any(token in lower for token in ["summons", "court", "hearing"]):
        return "The document appears to ask the recipient to appear or respond in a legal proceeding."
    if subject and subject != "Subject not clearly stated":
        return subject
    return demanded_action


def _extract_consequences(lines: List[str]) -> List[str]:
    result: List[str] = []
    consequence_tokens = ["failing which", "otherwise", "liable", "legal action", "prosecution", "penalty", "arrest", "attachment", "interest"]
    for line in lines:
        if any(token in line.lower() for token in consequence_tokens):
            result.append(line)
    return list(dict.fromkeys(result))[:5] or ["Possible legal consequences are mentioned, but they should be verified carefully."]


def _supporting_lines(lines: List[str]) -> List[str]:
    relevant: List[str] = []
    for line in lines:
        lower = line.lower()
        if any(token in lower for token in ["subject", "section", "notice", "summons", "pay", "reply", "appear", "within", "failing which"]):
            relevant.append(line)
    return list(dict.fromkeys(relevant))


def _extract_authority_type(text: str, sender: str) -> str:
    lower = f"{sender}\n{text[:1200]}".lower()
    if "court" in lower:
        return "Court or judicial authority"
    if "police" in lower:
        return "Police or investigating authority"
    if "bank" in lower or "financial" in lower:
        return "Bank or financial institution"
    if "advocate" in lower or "law office" in lower:
        return "Advocate or law office"
    if "department" in lower or "authority" in lower:
        return "Government department or statutory authority"
    return "Private sender or not clearly identified"
