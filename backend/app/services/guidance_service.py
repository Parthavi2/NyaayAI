from typing import Dict, List
 
 
def generate_guidance(doc_meta: Dict, fraud: Dict, deadlines: List[str]) -> List[str]:
    steps = []
    risk_score = fraud["risk_score"]
 
    if risk_score > 60:
        steps.append("Do not make any immediate payment — this notice shows fraud signals.")
        steps.append("Verify the sender's identity with the relevant authority directly.")
        steps.append("Check the reference number on the official eCourts portal (ecourts.gov.in).")
    elif risk_score > 30:
        steps.append("Read the document carefully and keep a copy in a safe place.")
        steps.append("Verify the reference number and sender details before responding.")
    else:
        steps.append("Read the document carefully and keep a copy in a safe place.")
 
    if deadlines:
        steps.append(f"Important deadline detected: {deadlines[0]} — take action promptly.")
 
    doc_type = doc_meta.get("document_type", "")
    case_type = doc_meta.get("case_type", "")
 
    if doc_type == "Court Summons":
        steps.append("Check the hearing date and ensure you appear before the court on time.")
        steps.append("Consult a registered advocate before the court date.")
    elif doc_type == "FIR":
        steps.append("Visit the relevant police station to verify the FIR details.")
        steps.append("Consult a criminal lawyer immediately.")
    elif doc_type == "Legal Notice":
        steps.append("You have the right to send a formal reply to the legal notice.")
 
    if case_type == "Payment / Recovery":
        steps.append("Gather all payment receipts and agreements as evidence.")
    elif case_type == "Property Dispute":
        steps.append("Collect all property documents, sale deeds, and title papers.")
 
    steps.append("Contact the National Legal Services Authority (NALSA) for free legal aid if needed.")
 
    return steps
 