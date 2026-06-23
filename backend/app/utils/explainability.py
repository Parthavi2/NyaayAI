from typing import List
 
 
def explain_risk_breakdown(risk_score: int, reasons: List[str]) -> dict:
    if risk_score <= 30:
        level = "Low"
        color = "green"
        advice = "This document appears genuine. Proceed with normal caution."
    elif risk_score <= 60:
        level = "Medium"
        color = "yellow"
        advice = "Some elements need verification. Do not act without checking."
    else:
        level = "High"
        color = "red"
        advice = "Multiple fraud signals detected. Seek legal advice immediately."
 
    return {
        "risk_score": risk_score,
        "risk_level": level,
        "color": color,
        "reasons": reasons,
        "advice": advice,
        "explanation": "Risk score is computed from suspicious phrases, missing fields, unofficial domains, and authority checks.",
    }
 