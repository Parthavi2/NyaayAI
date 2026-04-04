export interface ExtractedFields {
  dates: string[];
  amounts: string[];
  reference_numbers: string[];
}

export interface AnalyzeResponse {
  detected_language: string;
  redactions: string[];
  document_type: string;
  case_type: string;
  tone: string;
  extracted_fields: ExtractedFields;
  risk_score: number;
  risk_label: "Low Risk" | "Needs Verification" | "Suspicious";
  risk_reasons: string[];
  deadlines: string[];
  next_steps: string[];
  summary: string;
  explanation: string;
  reply_draft: string;
  fingerprint: string;
}

export interface HistoryItem {
  id: string;
  filename: string;
  document_type: string;
  case_type: string;
  risk_label: "Low Risk" | "Needs Verification" | "Suspicious";
  risk_score: number;
  analyzed_at: string;
  fingerprint: string;
  summary: string;
}

export type OutputLanguage = "en" | "hi" | "mr" | "ta" | "te" | "bn" | "gu";

export const LANGUAGE_OPTIONS: { value: OutputLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "mr", label: "मराठी (Marathi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "gu", label: "ગુજરાતી (Gujarati)" },
];

export const RISK_COLORS = {
  "Low Risk": { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", stroke: "#34d399" },
  "Needs Verification": { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", stroke: "#fbbf24" },
  Suspicious: { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", stroke: "#fb7185" },
} as const;
