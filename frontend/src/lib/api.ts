import { MOCK_RESPONSE } from "@/lib/mockData";
import { AnalyzeResponse, CaseAssistantResponse, LocationSupportResponse, OutputLanguage } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true" || false;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function analyzeDocument(file: File, outputLanguage: OutputLanguage = "en", onProgress?: (progress: number) => void): Promise<AnalyzeResponse> {
  if (USE_MOCK) {
    onProgress?.(10);
    await delay(400);
    onProgress?.(35);
    await delay(600);
    onProgress?.(65);
    await delay(500);
    onProgress?.(90);
    await delay(300);
    onProgress?.(100);
    return { ...MOCK_RESPONSE, output_language: outputLanguage };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("output_language", outputLanguage);

  onProgress?.(10);
  const response = await fetch(`${API_BASE_URL}/analyze-document`, { method: "POST", body: formData });
  onProgress?.(80);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Analysis failed");
  }

  const data: AnalyzeResponse = await response.json();
  onProgress?.(100);
  return data;
}

export async function analyzeText(text: string, outputLanguage: OutputLanguage = "en"): Promise<AnalyzeResponse> {
  if (USE_MOCK) {
    await delay(1500);
    return { ...MOCK_RESPONSE, output_language: outputLanguage };
  }
  const blob = new Blob([text], { type: "text/plain" });
  const file = new File([blob], "pasted-text.txt", { type: "text/plain" });
  return analyzeDocument(file, outputLanguage);
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export async function askCaseAssistant(question: string, fingerprint: string, outputLanguage: OutputLanguage = "en"): Promise<CaseAssistantResponse> {
  if (USE_MOCK) {
    await delay(700);
    return {
      answer: {
        is_within_scope: true,
        user_question: question,
        short_answer: "Verify the sender first and avoid immediate payment until the demand is supported.",
        detailed_explanation: "The notice context suggests a payment demand with authenticity concerns, so the immediate focus should be sender verification, supporting records, and a careful written response.",
        legal_practical_context: "This answer is based on the stored notice type, detected law context, deadlines, and extracted demand from the analyzed document.",
        what_user_should_do_next: MOCK_RESPONSE.next_steps.map((step) => step.details).slice(0, 3),
        caution_verification_note: "Do not admit liability or send money until the notice is verified.",
      },
      output_language: outputLanguage,
      source: "mock",
      support_options: MOCK_RESPONSE.support_options,
    };
  }

  const response = await fetch(`${API_BASE_URL}/case-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, fingerprint, output_language: outputLanguage }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Case query failed");
  }
  return response.json();
}

export async function getLocationSupport(params: {
  fingerprint?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: OutputLanguage;
  caseType?: string;
}): Promise<LocationSupportResponse> {
  if (USE_MOCK) {
    await delay(500);
    return {
      preferred_language: params.preferredLanguage || "en",
      detected_state: MOCK_RESPONSE.state_detected,
      detected_city: MOCK_RESPONSE.city_detected,
      state_options: [],
      resources: MOCK_RESPONSE.location_resources,
      legal_aid: MOCK_RESPONSE.legal_aid,
      support_options: MOCK_RESPONSE.support_options,
    };
  }

  const search = new URLSearchParams();
  if (params.fingerprint) search.set("fingerprint", params.fingerprint);
  if (params.state) search.set("state", params.state);
  if (params.city) search.set("city", params.city);
  if (params.latitude !== undefined) search.set("latitude", String(params.latitude));
  if (params.longitude !== undefined) search.set("longitude", String(params.longitude));
  if (params.preferredLanguage) search.set("preferred_language", params.preferredLanguage);
  if (params.caseType) search.set("case_type", params.caseType);

  const response = await fetch(`${API_BASE_URL}/support/options?${search.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Location support lookup failed");
  }
  return response.json();
}

export async function translateAnalysis(fingerprint: string, outputLanguage: OutputLanguage): Promise<Partial<AnalyzeResponse>> {
  if (USE_MOCK) {
    await delay(500);
    return {
      output_language: outputLanguage,
      summary: MOCK_RESPONSE.summary,
      explanation: MOCK_RESPONSE.explanation,
      reply_draft: MOCK_RESPONSE.reply_draft,
      notice_details: MOCK_RESPONSE.notice_details,
      detected_laws: MOCK_RESPONSE.detected_laws,
      rights_information: MOCK_RESPONSE.rights_information,
      deadline_items: MOCK_RESPONSE.deadline_items,
      next_steps: MOCK_RESPONSE.next_steps,
      location_resources: MOCK_RESPONSE.location_resources,
    };
  }

  const response = await fetch(`${API_BASE_URL}/analysis/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fingerprint, output_language: outputLanguage }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Translation failed");
  }

  const data = await response.json();
  return { output_language: data.output_language, ...(data.translated || {}) };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
