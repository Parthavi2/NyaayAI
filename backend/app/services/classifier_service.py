from typing import Dict
 
 
def classify_document_and_case(text: str, extracted_fields: Dict) -> Dict:
    lower = text.lower()
 
    # Document type detection
    if "fir" in lower or "first information report" in lower:
        document_type = "FIR"
    elif "summons" in lower or "appear before" in lower or "court notice" in lower:
        document_type = "Court Summons"
    elif "legal notice" in lower or "notice" in lower:
        document_type = "Legal Notice"
    elif "warrant" in lower:
        document_type = "Warrant"
    else:
        document_type = "Other"
 
    # Case type detection
    if any(k in lower for k in ["payment", "dues", "recovery", "outstanding", "loan", "debt"]):
        case_type = "Payment / Recovery"
    elif any(k in lower for k in ["property", "land", "possession", "plot", "flat"]):
        case_type = "Property Dispute"
    elif any(k in lower for k in ["employment", "salary", "termination", "wrongful", "dismiss"]):
        case_type = "Employment Issue"
    elif any(k in lower for k in ["divorce", "custody", "marriage", "matrimonial"]):
        case_type = "Family / Matrimonial"
    elif document_type == "Court Summons":
        case_type = "Court Appearance"
    elif document_type == "FIR":
        case_type = "Criminal Matter"
    else:
        case_type = "General Legal Matter"
 
    return {
        "document_type": document_type,
        "case_type": case_type,
    }
 