from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class LanguageOption(BaseModel):
    code: str
    name: str
    native_name: str


class LegalAidCenter(BaseModel):
    name: str
    state: str
    city: str
    contact: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None


class SupportChannel(BaseModel):
    title: str
    contact: str
    description: str
    channel: str


class SupportOptions(BaseModel):
    legal_aid_message: str
    legal_aid_centers: List[LegalAidCenter]
    helplines: List[SupportChannel]
    whatsapp_enabled: bool


class NoticeDetails(BaseModel):
    sender: str
    receiver: str
    subject: str
    issue_problem: str
    demanded_action: str
    possible_consequences: List[str]
    deadlines: List[str]
    authority_sender_type: str
    supporting_lines: List[str]


class LawMatch(BaseModel):
    law_name: str
    act_name: str
    section: str
    sections: List[str] = []
    severity: str = "Unclear"
    confidence: str
    confidence_score: float
    match_reason: str
    supporting_lines: List[str]
    official_source_title: str
    official_source_url: str


class RightsInfo(BaseModel):
    title: str
    detailed_explanation: str
    source: str = ""
    article_or_section: str = ""
    official_text_excerpt: str = ""
    what_user_can_legally_do: List[str]
    precautions_to_take: List[str]
    when_to_contact_legal_aid_or_authority: str
    official_source_title: str
    official_source_url: str


class ResourceItem(BaseModel):
    state: str
    city: str
    relevant_authority_name: str
    helpline_number: str
    official_website: str
    office_support_category: str
    relevance_reason: str
    availability_hours: str = "Check official website"
    official_source_title: str = "Official source"
    is_fallback: bool = False


class DeadlineItem(BaseModel):
    label: str
    date: str
    days_remaining: Optional[int] = None
    urgency: str
    status: str
    source_basis: str


class NextStep(BaseModel):
    title: str
    details: str
    timeframe: str


class QueryAnswer(BaseModel):
    is_within_scope: bool = True
    user_question: str
    short_answer: str
    detailed_explanation: str
    legal_practical_context: str
    what_user_should_do_next: List[str]
    caution_verification_note: str


class AnalyzeResponse(BaseModel):
    detected_language: str
    output_language: str
    supported_languages: List[LanguageOption]
    redactions: List[str]
    document_type: str
    case_type: str
    tone: str
    extracted_fields: Dict[str, Any]
    notice_details: NoticeDetails
    risk_score: int
    risk_label: str
    risk_reasons: List[str]
    deadlines: List[str]
    deadline_items: List[DeadlineItem]
    next_steps: List[NextStep]
    summary: str
    explanation: str
    reply_draft: str
    fingerprint: str
    detected_laws: List[LawMatch]
    rights_information: List[RightsInfo]
    state_detected: str
    city_detected: str
    location_resources: List[ResourceItem]
    state_options: List[str] = []
    source_text: str = ""
    legal_aid: Dict[str, Any]
    support_options: SupportOptions


class CaseAssistantRequest(BaseModel):
    question: str = Field(..., min_length=3)
    fingerprint: Optional[str] = None
    case_context: Optional[Dict[str, Any]] = None
    output_language: str = "en"


class CaseAssistantResponse(BaseModel):
    answer: QueryAnswer
    output_language: str
    source: str
    support_options: SupportOptions


class SupportRequest(BaseModel):
    message: str = Field(..., min_length=5)
    phone_number: Optional[str] = None
    fingerprint: Optional[str] = None
    state: str = ""
    city: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_language: str = "en"
    case_type: str = ""


class SupportResponse(BaseModel):
    success: bool
    message: str
    detected_state: str
    detected_city: str
    state_options: List[str] = []
    whatsapp: Dict[str, Any]
    legal_aid: Dict[str, Any]
    helplines: List[SupportChannel]
    resources: List[ResourceItem]
    escalation_summary: str


class AnalysisTranslateRequest(BaseModel):
    fingerprint: str = Field(..., min_length=8)
    output_language: str = "en"
