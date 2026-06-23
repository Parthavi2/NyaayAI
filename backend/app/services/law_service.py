import re
from typing import Dict, List


LAW_CATALOG = [
    {
        "id": "ni_138",
        "law_name": "Cheque dishonour notice",
        "act_name": "The Negotiable Instruments Act, 1881",
        "section": "Section 138",
        "confidence_keywords": [r"\bsection\s*138\b", r"\bu/s\s*138\b", r"dishonou?r of cheque", r"cheque.*returned", r"insufficien(?:cy|t) of funds"],
        "reason": "The notice language matches cheque dishonour and Section 138 patterns.",
        "official_source_title": "India Code - The Negotiable Instruments Act, 1881",
        "official_source_url": "https://www.indiacode.nic.in/bitstream/123456789/2189/1/a1881-26.pdf",
        "rights": {
            "title": "Rights in a cheque dishonour notice matter",
            "detailed_explanation": "You can verify whether the cheque details, bank memo, amount, and service timeline in the notice are accurate before responding.",
            "what_user_can_legally_do": [
                "Ask for copies of the cheque, return memo, and account statement relied upon.",
                "Check whether the notice was served within the legally relevant timeline stated in the notice and supporting documents.",
                "Prepare a documented reply if the debt, amount, signature, or transaction basis is disputed.",
            ],
            "precautions_to_take": [
                "Do not admit liability casually in writing or by message.",
                "Preserve bank records, cheque copies, and any agreement connected to the transaction.",
                "Verify whether the amount claimed matches the underlying transaction.",
            ],
            "when_to_contact": "Contact an advocate or legal aid immediately if criminal complaint filing is threatened or if the cheque details are disputed.",
        },
    },
    {
        "id": "it_148",
        "law_name": "Income tax reassessment notice",
        "act_name": "The Income-tax Act, 1961",
        "section": "Section 148",
        "confidence_keywords": [r"\bsection\s*148\b", r"\bu/s\s*148\b", r"income tax", r"reassess", r"escaped assessment"],
        "reason": "The notice references income-tax reassessment language associated with Section 148.",
        "official_source_title": "Income Tax Department - Section 148 notice guidance",
        "official_source_url": "https://www.incometax.gov.in/iec/foportal/help/how-to-respond-notice",
        "rights": {
            "title": "Rights in an income-tax reassessment notice",
            "detailed_explanation": "You can inspect the reasons, information relied upon, and filing history before submitting a response.",
            "what_user_can_legally_do": [
                "Review the notice number, PAN details, and assessment year carefully.",
                "Log in to the official income tax portal and verify the notice in your account.",
                "Consult a tax professional before filing a substantive reply if the allegations are complex.",
            ],
            "precautions_to_take": [
                "Respond only through the official income tax portal or verified departmental process.",
                "Do not share sensitive tax credentials with unverified callers or agents.",
                "Cross-check the notice section and assessment year before acting.",
            ],
            "when_to_contact": "Contact a tax practitioner or legal aid if the notice demands substantial records or alleges concealment or escaped income.",
        },
    },
    {
        "id": "tp_106",
        "law_name": "Tenancy or lease termination notice",
        "act_name": "The Transfer of Property Act, 1882",
        "section": "Section 106",
        "confidence_keywords": [r"\bsection\s*106\b", r"\bu/s\s*106\b", r"transfer of property act", r"terminate the tenancy", r"vacate the premises", r"lease"],
        "reason": "The notice language matches tenancy termination or property possession patterns linked with Section 106.",
        "official_source_title": "India Code - The Transfer of Property Act, 1882",
        "official_source_url": "https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse",
        "rights": {
            "title": "Rights in a tenancy or property notice",
            "detailed_explanation": "You can verify the tenancy basis, notice period, and property description before taking any step.",
            "what_user_can_legally_do": [
                "Review the rent agreement, lease terms, and any previous communications.",
                "Check whether the notice period and property details are correctly stated.",
                "Reply in writing if the possession claim, arrears claim, or notice period is disputed.",
            ],
            "precautions_to_take": [
                "Do not vacate or sign settlement papers without understanding the legal effect.",
                "Preserve rent receipts, agreement copies, and proof of possession.",
                "Verify whether the sender has authority to issue the notice.",
            ],
            "when_to_contact": "Contact legal aid or a property lawyer quickly if eviction, sealing, or forced possession is threatened.",
        },
    },
    {
        "id": "dv_2005",
        "law_name": "Domestic violence proceeding or protection-related notice",
        "act_name": "The Protection of Women from Domestic Violence Act, 2005",
        "section": "Relevant provisions under the Act",
        "confidence_keywords": [r"domestic violence", r"protection officer", r"residence order", r"protection order", r"monetary relief"],
        "reason": "The notice uses domestic violence protection language and remedies associated with the 2005 Act.",
        "official_source_title": "India Code - The Protection of Women from Domestic Violence Act, 2005",
        "official_source_url": "https://www.indiacode.nic.in/handle/123456789/12904?view_type=browse",
        "rights": {
            "title": "Rights in a domestic violence related notice",
            "detailed_explanation": "You can seek protection, residence, maintenance-related relief, and safe legal support through the statutory process.",
            "what_user_can_legally_do": [
                "Contact the Protection Officer, legal aid, or women support services promptly.",
                "Preserve records of threats, injuries, messages, and prior complaints.",
                "Seek guidance before appearing or responding if safety is a concern.",
            ],
            "precautions_to_take": [
                "Do not ignore any protection-order or court-related direction.",
                "Prioritize personal safety and emergency support if there is immediate risk.",
                "Use official women support helplines and verified legal services.",
            ],
            "when_to_contact": "Contact legal aid immediately, and use women helpline or emergency services if there is danger or coercion.",
        },
    },
    {
        "id": "bnss_summons",
        "law_name": "Criminal summons or appearance notice",
        "act_name": "The Bharatiya Nagarik Suraksha Sanhita, 2023",
        "section": "Sections 63 to 71 (service of summons context)",
        "confidence_keywords": [r"summons", r"appear before", r"criminal court", r"witness", r"service of summons"],
        "reason": "The document appears to be a criminal summons or appearance-related communication.",
        "official_source_title": "India Code - The Bharatiya Nagarik Suraksha Sanhita, 2023",
        "official_source_url": "https://www.indiacode.nic.in/bitstream/123456789/21544/1/the_bharatiya_nagarik_suraksha_sanhita%2C_2023.pdf",
        "rights": {
            "title": "Rights in a summons or court appearance notice",
            "detailed_explanation": "You can verify the court details, case number, date, and mode of service before taking the next step.",
            "what_user_can_legally_do": [
                "Confirm the case number and next date from the court or eCourts portal.",
                "Seek legal assistance before the appearance date if the matter is criminal or serious.",
                "Request document copies if the basis of the summons is unclear.",
            ],
            "precautions_to_take": [
                "Do not ignore a summons without legal advice.",
                "Verify whether the notice came from an actual court or authorised process server.",
                "Keep the envelope, service proof, and copy of the notice.",
            ],
            "when_to_contact": "Contact legal aid or an advocate immediately if the notice requires court appearance or witness attendance.",
        },
    },
]


def detect_laws(text: str, notice_details: Dict, document_type: str, case_type: str) -> List[Dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    lowered = text.lower()
    matches: List[Dict] = []

    for law in LAW_CATALOG:
        score = 0.0
        supporting_lines: List[str] = []
        for pattern in law["confidence_keywords"]:
            regex = re.compile(pattern, re.I)
            if regex.search(text):
                score += 0.2
                supporting_lines.extend([line for line in lines if regex.search(line)][:2])

        if document_type == "Court Summons" and law["id"] == "bnss_summons":
            score += 0.25
        if case_type == "Payment / Recovery" and law["id"] == "ni_138":
            score += 0.1
        if case_type == "Property Dispute" and law["id"] == "tp_106":
            score += 0.1

        supporting_lines = list(dict.fromkeys(supporting_lines))[:4]
        if score >= 0.25:
            matches.append(
                {
                    "law_name": law["law_name"],
                    "act_name": law["act_name"],
                    "section": law["section"],
                    "confidence": _confidence_label(score),
                    "confidence_score": round(min(score, 0.95), 2),
                    "match_reason": law["reason"],
                    "supporting_lines": supporting_lines or notice_details.get("supporting_lines", [])[:2],
                    "official_source_title": law["official_source_title"],
                    "official_source_url": law["official_source_url"],
                }
            )

    return sorted(matches, key=lambda item: item["confidence_score"], reverse=True)


def build_rights_information(law_matches: List[Dict], case_type: str, risk_label: str) -> List[Dict]:
    rights: List[Dict] = []
    by_act = {law["act_name"]: law for law in LAW_CATALOG}

    for match in law_matches:
        catalog_entry = next((item for item in LAW_CATALOG if item["act_name"] == match["act_name"]), None)
        if not catalog_entry:
            continue
        rights_template = catalog_entry["rights"]
        rights.append(
            {
                "title": rights_template["title"],
                "detailed_explanation": rights_template["detailed_explanation"],
                "what_user_can_legally_do": rights_template["what_user_can_legally_do"],
                "precautions_to_take": rights_template["precautions_to_take"],
                "when_to_contact_legal_aid_or_authority": rights_template["when_to_contact"],
                "official_source_title": match["official_source_title"],
                "official_source_url": match["official_source_url"],
            }
        )

    if not rights:
        rights.append(
            {
                "title": "General rights when receiving a legal notice",
                "detailed_explanation": "You are entitled to read the notice carefully, verify the sender and authority, preserve records, and seek legal advice before taking an irreversible step.",
                "what_user_can_legally_do": [
                    "Ask for supporting documents, reference numbers, and proof relied upon in the notice.",
                    "Check whether the sender and authority details are genuine.",
                    "Take legal aid or advocate support before admitting liability or signing anything.",
                ],
                "precautions_to_take": [
                    "Do not panic, pay, or share sensitive information without verification.",
                    "Preserve the full notice, envelope, attachments, and related messages.",
                    "Cross-check deadlines and consequences before deciding your response.",
                ],
                "when_to_contact_legal_aid_or_authority": "Contact legal aid quickly if the notice threatens court action, criminal complaint, eviction, or immediate financial loss.",
                "official_source_title": "India Code - The Legal Services Authorities Act, 1987",
                "official_source_url": "https://www.indiacode.nic.in/handle/123456789/10899?col=123456789%2F2496",
            }
        )

    if risk_label == "Suspicious":
        rights[0]["precautions_to_take"] = list(
            dict.fromkeys(rights[0]["precautions_to_take"] + ["Verify authenticity before responding because fraud indicators were detected."])
        )

    return rights


def _confidence_label(score: float) -> str:
    if score >= 0.65:
        return "High"
    if score >= 0.4:
        return "Medium"
    return "Low"
