// Re-exports from lib/utils plus additional helpers

export { cn, formatDate, formatFileSize, truncate, getRiskColor, copyToClipboard, downloadText } from "@/lib/utils";

/**
 * Formats a risk score as a percentage string
 */
export function formatRiskScore(score: number): string {
  return `${score}/100`;
}

/**
 * Returns a human-readable label for a detected language code
 */
export function getLanguageName(code: string): string {
  const map: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    ta: "Tamil",
    te: "Telugu",
    bn: "Bengali",
    gu: "Gujarati",
    unknown: "Unknown",
  };
  return map[code] ?? code.toUpperCase();
}

/**
 * Returns urgency level based on number of days in deadline string
 */
export function getDeadlineUrgency(deadline: string): "urgent" | "soon" | "normal" {
  const match = deadline.match(/(\d+)\s*days?/i);
  if (!match) return "normal";
  const days = parseInt(match[1]);
  if (days <= 7) return "urgent";
  if (days <= 15) return "soon";
  return "normal";
}

/**
 * Truncates a filename for display
 */
export function formatFilename(name: string, maxLength = 30): string {
  if (name.length <= maxLength) return name;
  const ext = name.split(".").pop() ?? "";
  const base = name.slice(0, maxLength - ext.length - 4);
  return `${base}…${ext ? `.${ext}` : ""}`;
}

/**
 * Returns a color class based on risk score number
 */
export function getRiskScoreColor(score: number): string {
  if (score <= 30) return "text-emerald-400";
  if (score <= 60) return "text-amber-400";
  return "text-rose-400";
}

/**
 * Checks if a file is a valid upload type
 */
export function isValidFileType(file: File): boolean {
  const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  return allowed.includes(file.type);
}

/**
 * Generates a short display ID from a fingerprint
 */
export function shortId(fingerprint: string): string {
  return fingerprint.slice(0, 8).toUpperCase();
}
