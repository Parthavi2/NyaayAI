from typing import Dict, List


def generate_guidance(doc_meta: Dict, fraud: Dict, deadlines: List[str]) -> List[str]:
    """
    Rule-based next steps used as fallback when LLM is unavailable.
    The primary next_steps come from the LLM prompt in llm_service.py.
    """
    steps = []
    risk_score = fraud.get("risk_score", 0)
    doc_type = doc_meta.get("document_type", "")
    case_type = doc_meta.get("case_type", "")

    # Risk-based first steps
    if risk_score > 60:
        steps.append("Do not make any immediate payment — this notice shows fraud signals.")
        steps.append("Verify the sender's identity directly with the relevant authority.")
        steps.append("Check the reference number on the official eCourts portal (ecourts.gov.in).")
        steps.append("Report this to the Cyber Crime helpline: 1930 if it looks like a scam.")
    elif risk_score > 30:
        steps.append("Read the document carefully and keep a physical copy in a safe place.")
        steps.append("Verify the reference number and sender details before responding.")
        steps.append("Do not sign or pay anything until you have verified the notice is genuine.")
    else:
        steps.append("Read the document carefully and keep a physical copy in a safe place.")
        steps.append("Note all deadlines mentioned and set reminders to act before they pass.")

    # Deadline-based step
    if deadlines:
        steps.append(f"Important deadline detected: {deadlines[0]} — take action before this date.")

    # Document-type specific steps
    if doc_type == "Court Summons":
        steps.append("Check the exact hearing date and time — failing to appear can lead to an ex-parte order against you.")
        steps.append("Consult a registered advocate at least one week before the court date.")
        steps.append("Carry all relevant documents to the court hearing.")
    elif doc_type == "FIR":
        steps.append("Visit the relevant police station to get a copy of the FIR and verify its details.")
        steps.append("Consult a criminal lawyer immediately — do not speak to police without legal counsel.")
        steps.append("Apply for anticipatory bail if arrest is likely.")
    elif doc_type == "Legal Notice":
        steps.append("You have the right to send a formal written reply to the legal notice within 30 days.")
        steps.append("Do not ignore the notice — non-response can be used against you in court.")
        steps.append("Consult a lawyer to draft an appropriate reply.")
    elif doc_type == "Tax Notice":
        steps.append("Gather all relevant tax payment receipts, returns, and supporting documents.")
        steps.append("File a written response with the issuing tax authority within the stated deadline.")
        steps.append("Consult a CA or tax lawyer if the amount or issue is significant.")
    elif doc_type == "Eviction Notice":
        steps.append("Do not vacate immediately — verify whether the notice follows proper legal procedure.")
        steps.append("Check your rental agreement for applicable notice period clauses.")
        steps.append("Consult a lawyer about your tenant rights under the Rent Control Act of your state.")
    elif doc_type == "Cheque Bounce Notice":
        steps.append("You have 15 days from receipt to pay the cheque amount to avoid criminal prosecution.")
        steps.append("If you dispute the notice, consult a lawyer immediately about filing a reply.")
    elif doc_type == "Demand Notice":
        steps.append("Verify whether the claimed amount is accurate and matches your records.")
        steps.append("Respond in writing within the stated deadline — silence implies acceptance.")

    # Case-type specific steps
    if case_type == "Payment / Recovery":
        steps.append("Gather all payment receipts, invoices, bank statements, and agreements as evidence.")
        steps.append("Consult a lawyer about filing a counter-claim if the demand is incorrect.")
    elif case_type == "Property Dispute":
        steps.append("Collect all property documents: sale deed, title papers, mutation records, encumbrance certificate.")
        steps.append("Get a certified copy of all relevant records from the local registrar office.")
    elif case_type == "Labour / Employment":
        steps.append("Contact the Labour Commissioner office in your district for free guidance.")
        steps.append("Call the Labour Helpline: 14567 for Ministry of Labour support.")
        steps.append("File a complaint with the Industrial Tribunal or Labour Court if unlawfully terminated.")
    elif case_type == "Consumer":
        steps.append("File a complaint at consumerhelpline.gov.in or call the National Consumer Helpline: 1915.")
        steps.append("Gather all purchase receipts, warranty cards, and communication records as evidence.")
    elif case_type == "Domestic Violence":
        steps.append("Call the Women Helpline immediately: 181 (24x7, free).")
        steps.append("Contact the National Commission for Women: 7827170170.")
        steps.append("Approach the nearest Protection Officer under the Domestic Violence Act.")
    elif case_type == "Cyber Crime / Fraud":
        steps.append("Report to the Cyber Crime portal: cybercrime.gov.in or call 1930 immediately.")
        steps.append("Do not transfer any money or share OTPs — block all suspicious contacts.")
        steps.append("Preserve all screenshots, messages, and transaction records as evidence.")
    elif case_type == "Criminal":
        steps.append("Do not make any statements to the police without a lawyer present.")
        steps.append("Engage a criminal advocate immediately.")

    # Universal last step
    steps.append("Contact NALSA for free legal aid: call 15100 or visit nalsa.gov.in.")

    return steps
