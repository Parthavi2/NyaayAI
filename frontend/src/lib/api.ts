import { AnalyzeResponse, OutputLanguage } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function analyzeDocument(
  file: File,
  outputLanguage: OutputLanguage = "en",
  onProgress?: (progress: number) => void
): Promise<AnalyzeResponse> {
  if (USE_MOCK) {
    throw new ApiError(500, "Mock mode is enabled. Set NEXT_PUBLIC_USE_MOCK=false");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("output_language", outputLanguage);

  onProgress?.(10);

  const response = await fetch(`${API_BASE_URL}/analyze-document`, {
    method: "POST",
    body: formData,
  });

  onProgress?.(80);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Unknown error",
    }));
    throw new ApiError(response.status, error.detail || "Analysis failed");
  }

  const data: AnalyzeResponse = await response.json();
  onProgress?.(100);
  return data;
}

export async function analyzeText(
  text: string,
  outputLanguage: OutputLanguage = "en"
): Promise<AnalyzeResponse> {
  const blob = new Blob([text], { type: "text/plain" });
  const file = new File([blob], "pasted-text.txt", { type: "text/plain" });
  return analyzeDocument(file, outputLanguage);
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new ApiError(response.status, "Backend health check failed");
  }

  return response.json();
}
