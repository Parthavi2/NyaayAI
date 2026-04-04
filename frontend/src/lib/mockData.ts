import { AnalyzeResponse, HistoryItem } from "@/types";

export const MOCK_RESPONSE: AnalyzeResponse = {
  detected_language: "en",
  redactions: ["email", "phone"],
  document_type: "Legal Notice",
  case_type: "Payment / Recovery",
  tone: "threatening/urgent",
  extracted_fields: {
    dates: ["15/03/2025", "01/04/2025"],
    amounts: ["₹ 85,000", "₹ 1,20,000"],
    reference_numbers: ["LN/2025/MH/04421", "HC-PUNE-2025"],
  },
  risk_score: 72,
  risk_label: "Suspicious",
  risk_reasons: [
    "Suspicious phrase found: urgent payment",
    "Unofficial email domain detected",
    "Missing official seal or letterhead",
    "Suspicious phrase found: final warning",
    "No verifiable court reference number",
  ],
  deadlines: ["within 15 days", "within 30 days"],
  next_steps: [
    "Do not make any immediate payment.",
    "Verify the sender's credentials with the relevant authority.",
    "Cross-check the case reference number on eCourts portal.",
    "Consult a registered advocate before responding.",
    "Important deadline detected: within 15 days",
    "Keep a copy of this notice and all related correspondence.",
  ],
  summary:
    "This document appears to be a legal notice demanding payment of ₹85,000 allegedly owed under a disputed financial agreement. The notice uses urgent and threatening language and was sent from an unofficial email domain, raising significant authenticity concerns.",
  explanation:
    "You have received a legal notice that claims you owe money under a financial contract. The sender is demanding immediate payment and threatening legal action. However, several red flags suggest this notice may not be genuine: it was sent from a Gmail address (not an official legal firm domain), uses aggressive language like 'final warning' and 'urgent payment', and the reference number does not appear in publicly verifiable court records. You are advised not to panic or make any payment without first verifying the sender's identity and consulting with a legal professional.",
  reply_draft: `To,
The Sender / Concerned Party,
[Reference: LN/2025/MH/04421]

Dear Sir/Madam,

I write in response to your notice dated 15/03/2025. I acknowledge receipt of the said communication. However, I wish to state that I dispute the claims made therein in their entirety.

I request you to kindly furnish documentary proof of the alleged outstanding amount, along with certified copies of any agreement you rely upon, within seven (7) days of this letter.

I reserve all my legal rights and remedies in this matter and shall not be construed to have admitted any liability by virtue of this response.

Yours faithfully,
[Your Name]
[Date]`,
  fingerprint: "a1b2c3d4e5f6g7h8",
};

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    filename: "legal_notice_march.pdf",
    document_type: "Legal Notice",
    case_type: "Payment / Recovery",
    risk_label: "Suspicious",
    risk_score: 72,
    analyzed_at: "2025-03-20T10:30:00Z",
    fingerprint: "a1b2c3d4",
    summary: "Payment recovery notice with suspicious origin and threatening language.",
  },
  {
    id: "2",
    filename: "court_summons_feb.pdf",
    document_type: "Court Summons",
    case_type: "Court Appearance",
    risk_label: "Low Risk",
    risk_score: 15,
    analyzed_at: "2025-02-14T14:00:00Z",
    fingerprint: "e5f6g7h8",
    summary: "Genuine court summons for a civil property dispute hearing.",
  },
  {
    id: "3",
    filename: "fir_copy_jan.jpg",
    document_type: "FIR",
    case_type: "General Legal Matter",
    risk_label: "Needs Verification",
    risk_score: 45,
    analyzed_at: "2025-01-08T09:15:00Z",
    fingerprint: "i9j0k1l2",
    summary: "FIR copy with some missing fields; requires official verification.",
  },
  {
    id: "4",
    filename: "property_notice.pdf",
    document_type: "Legal Notice",
    case_type: "Property Dispute",
    risk_label: "Low Risk",
    risk_score: 22,
    analyzed_at: "2024-12-30T16:45:00Z",
    fingerprint: "m3n4o5p6",
    summary: "Property boundary dispute notice from a registered legal firm.",
  },
];
