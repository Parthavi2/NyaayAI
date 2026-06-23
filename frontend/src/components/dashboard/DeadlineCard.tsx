import { AlertCircle, CalendarDays, Clock } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, OutputLanguage } from "@/types";

interface DeadlineCardProps {
  data: Pick<AnalyzeResponse, "deadline_items" | "extracted_fields">;
  language: OutputLanguage;
}

const urgencyClass: Record<string, string> = {
  critical: "badge-rose",
  warning: "badge-amber",
  safe: "badge-teal",
  unknown: "badge border border-white/10 text-slate-300",
};

export default function DeadlineCard({ data, language }: DeadlineCardProps) {
  const copy = getCopy(language);
  const items = data.deadline_items || [];
  const allDates = data.extracted_fields.dates || [];

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
          <Clock size={14} className="text-amber-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.timeline}</h3>
      </div>

      {items.length === 0 && allDates.length === 0 ? (
        <div className="text-center py-6">
          <CalendarDays size={28} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No specific deadlines detected in this document.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const badgeClass = urgencyClass[item.urgency] || urgencyClass.unknown;
            const expired = item.status === "expired";
            return (
              <div key={`${item.label}-${index}`} className={`rounded-xl border p-4 ${expired ? "border-rose-400/20 bg-rose-400/5" : "border-amber-400/15 bg-amber-400/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} className={`${expired ? "text-rose-400" : "text-amber-400"} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="text-sm font-600 text-slate-100">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.date}</div>
                      <div className="text-xs text-slate-500 mt-2">{item.source_basis}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`badge ${badgeClass}`}>{expired ? "EXPIRED" : item.urgency.toUpperCase()}</span>
                    {typeof item.days_remaining === "number" && <p className="text-xs text-slate-300">{item.days_remaining} day(s) remaining</p>}
                  </div>
                </div>
              </div>
            );
          })}

          {allDates.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-2 font-600 uppercase tracking-wide">All Dates Found</div>
              <div className="flex flex-wrap gap-1.5">
                {allDates.map((d, i) => (
                  <span key={i} className="font-mono text-xs px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-slate-400">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
