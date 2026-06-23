export interface ExtractedFields {
  dates: string[];
  amounts: string[];
  reference_numbers: string[];
}

export interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
}

export interface LegalAidCenter {
  name: string;
  state: string;
  city: string;
  contact: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
}

export interface SupportChannel {
  title: string;
  contact: string;
  description: string;
  channel: string;
}

export interface SupportOptions {
  legal_aid_message: string;
  legal_aid_centers: LegalAidCenter[];
  helplines: SupportChannel[];
  whatsapp_enabled: boolean;
}

export interface LegalAidRecommendation {
  recommended: boolean;
  message: string;
  preferred_language: string;
  case_type: string;
  centers: LegalAidCenter[];
  nalsa_url: string;
}

export interface NoticeDetails {
  sender: string;
  receiver: string;
  subject: string;
  issue_problem: string;
  demanded_action: string;
  possible_consequences: string[];
  deadlines: string[];
  authority_sender_type: string;
  supporting_lines: string[];
}

export interface LawMatch {
  law_name: string;
  act_name: string;
  section: string;
  sections: string[];
  severity: string;
  confidence: string;
  confidence_score: number;
  match_reason: string;
  supporting_lines: string[];
  official_source_title: string;
  official_source_url: string;
}

export interface RightsInfo {
  title: string;
  detailed_explanation: string;
  source: string;
  article_or_section: string;
  official_text_excerpt: string;
  what_user_can_legally_do: string[];
  precautions_to_take: string[];
  when_to_contact_legal_aid_or_authority: string;
  official_source_title: string;
  official_source_url: string;
}

export interface ResourceItem {
  state: string;
  city: string;
  relevant_authority_name: string;
  helpline_number: string;
  official_website: string;
  office_support_category: string;
  relevance_reason: string;
  availability_hours: string;
  official_source_title: string;
  is_fallback: boolean;
}

export interface DeadlineItem {
  label: string;
  date: string;
  days_remaining?: number | null;
  urgency: "critical" | "warning" | "safe" | "unknown" | string;
  status: "active" | "expired" | "fallback_window" | "unclear" | string;
  source_basis: string;
}

export interface NextStep {
  title: string;
  details: string;
  timeframe: string;
}

export interface QueryAnswer {
  is_within_scope: boolean;
  user_question: string;
  short_answer: string;
  detailed_explanation: string;
  legal_practical_context: string;
  what_user_should_do_next: string[];
  caution_verification_note: string;
}

export interface AnalyzeResponse {
  detected_language: string;
  output_language: string;
  supported_languages: LanguageOption[];
  redactions: string[];
  document_type: string;
  case_type: string;
  tone: string;
  extracted_fields: ExtractedFields;
  notice_details: NoticeDetails;
  risk_score: number;
  risk_label: "Low Risk" | "Needs Verification" | "Suspicious";
  risk_reasons: string[];
  deadlines: string[];
  deadline_items: DeadlineItem[];
  next_steps: NextStep[];
  summary: string;
  explanation: string;
  reply_draft: string;
  fingerprint: string;
  detected_laws: LawMatch[];
  rights_information: RightsInfo[];
  state_detected: string;
  city_detected: string;
  state_options: string[];
  location_resources: ResourceItem[];
  source_text?: string;
  legal_aid: LegalAidRecommendation;
  support_options: SupportOptions;
}

export interface CaseAssistantResponse {
  answer: QueryAnswer;
  output_language: string;
  source: string;
  support_options: SupportOptions;
}

export interface LocationSupportResponse {
  preferred_language: string;
  detected_state: string;
  detected_city: string;
  state_options: string[];
  resources: ResourceItem[];
  legal_aid: LegalAidRecommendation;
  support_options: SupportOptions;
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

export type OutputLanguage = "en" | "hi" | "mr" | "bn" | "ta" | "te" | "kn" | "gu" | "pa";

export const LANGUAGE_OPTIONS: { value: OutputLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "bn", label: "Bengali" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "gu", label: "Gujarati" },
  { value: "pa", label: "Punjabi" },
];

export const RISK_COLORS = {
  "Low Risk": { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", stroke: "#34d399" },
  "Needs Verification": { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", stroke: "#fbbf24" },
  Suspicious: { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", stroke: "#fb7185" },
} as const;
