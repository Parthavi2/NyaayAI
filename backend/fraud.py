import re

scam_keywords = [
    "urgent payment",
    "no signature required",
    "pay immediately",
    "legal action within 24 hours",
    "final warning"
]

def detect_fraud(text):
    score = 0

    for word in scam_keywords:
        if word in text.lower():
            score += 20

    if "no signature" in text.lower():
        score += 30

    if "upi" in text.lower():
        score += 20

    if score > 50:
        label = "Fraud"
    elif score > 20:
        label = "Suspicious"
    else:
        label = "Genuine"

    return label, score