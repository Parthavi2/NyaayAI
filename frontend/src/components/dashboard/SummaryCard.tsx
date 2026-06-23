import { AnalyzeResponse } from "@/types";
import { FileText, Hash, Globe, Tag, Bookmark } from "lucide-react";

interface SummaryCardProps {
  data: Pick<AnalyzeResponse, "document_type" | "case_type" | "detected_language" | "extracted_fields" | "tone" | "fingerprint">;
}

const LANG_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil",
  te: "Telugu", bn: "Bengali", gu: "Gujarati", unknown: "Unknown",
};

const TONE_STYLE: Record<string, { label: string; class: string }> = {
  "threatening/urgent": { label: "Threatening / Urgent", class: "badge-rose" },
  "neutral/formal": { label: "Neutral / Formal", class: "badge-teal" },
};

export default function SummaryCard({ data }: SummaryCardProps) {
  const { document_type, case_type, detected_language, extracted_fields, tone, fingerprint } = data;
  const toneStyle = TONE_STYLE[tone] ?? { label: tone, class: "badge-violet" };

  const rows = [
    { icon: FileText, label: "Document Type", value: document_type },
    { icon: Bookmark, label: "Case Type", value: case_type },
    { icon: Globe, label: "Language", value: LANG_NAMES[detected_language] ?? detected_language },
    { icon: Tag, label: "Tone", value: null, badge: toneStyle },
  ];

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">Document Summary</h3>

      <div className="space-y-3">
        {rows.map(({ icon: Icon, label, value, badge }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon size={13} />
              <span className="text-xs">{label}</span>
            </div>
            {badge ? (
              <span className={`badge ${badge.class}`}>{badge.label}</span>
            ) : (
              <span className="text-xs font-600 text-slate-300">{value}</span>
            )}
          </div>
        ))}
      </div>

      <div className="divider my-4" />

      {/* Extracted fields */}
      <div className="space-y-3">
        {extracted_fields.reference_numbers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Hash size={12} />
              <span className="text-xs">Reference Numbers</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extracted_fields.reference_numbers.map((ref, i) => (
                <span key={i} className="font-mono text-xs px-2 py-0.5 bg-violet-400/10 border border-violet-400/20 rounded text-violet-300">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {extracted_fields.amounts.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Amounts Mentioned</div>
            <div className="flex flex-wrap gap-1.5">
              {extracted_fields.amounts.map((amt, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded text-amber-300">
                  {amt}
                </span>
              ))}
            </div>
          </div>
        )}

        {extracted_fields.dates.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Dates Found</div>
            <div className="flex flex-wrap gap-1.5">
              {extracted_fields.dates.map((d, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-teal-400/10 border border-teal-400/20 rounded text-teal-300">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fingerprint */}
      <div className="mt-4 flex items-center gap-2 text-slate-600">
        <Hash size={11} />
        <span className="font-mono text-xs">{fingerprint}</span>
      </div>
    </div>
  );
}
