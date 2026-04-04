import json
import os
from typing import Dict, List
 
# Load scam phrases from config
_config_path = os.path.join(os.path.dirname(__file__), "../../config/scam_phrases.json")
try:
    with open(_config_path) as f:
        _scam_phrases = {item["phrase"]: item["weight"] for item in json.load(f)}
except Exception:
    _scam_phrases = {
        "urgent payment": 15,
        "final warning": 10,
        "pay immediately": 20,
        "avoid arrest": 20,
        "contact on whatsapp": 25,
        "no signature required": 20,
        "fake authority": 25,
    }
 
# Load authority list
_auth_path = os.path.join(os.path.dirname(__file__), "../../config/authority_list.json")
try:
    with open(_auth_path) as f:
        _authority_list = [a.lower() for a in json.load(f)]
except Exception:
    _authority_list = ["district court", "high court", "police station", "income tax department"]
 
 
def detect_fraud_and_score(text: str, extracted_fields: Dict, doc_meta: Dict) -> Dict:
    lower = text.lower()
    score = 0
    reasons: List[str] = []
 
    # Missing reference number
    if not extracted_fields.get("reference_numbers"):
        score += 20
        reasons.append("Missing reference number")
 
    # Scam phrases
    for phrase, weight in _scam_phrases.items():
        if phrase in lower:
            score += weight
            reasons.append(f"Suspicious phrase found: '{phrase}'")
 
    # Unofficial email domain
    for domain in ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]:
        if domain in lower:
            score += 15
            reasons.append(f"Unofficial email domain detected ({domain})")
            break
 
    # No known authority mentioned
    if not any(auth in lower for auth in _authority_list):
        score += 10
        reasons.append("No recognised legal authority mentioned")
 
    # Risk label
    score = min(score, 100)
    if score <= 30:
        label = "Low Risk"
    elif score <= 60:
        label = "Needs Verification"
    else:
        label = "Suspicious"
 
    return {
        "risk_score": score,
        "risk_label": label,
        "risk_reasons": reasons,
    }
 