import { AnalyzeResponse } from "@/types";
import { Clock, AlertCircle, CalendarDays } from "lucide-react";

interface DeadlineCardProps {
  data: Pick<AnalyzeResponse, "deadlines" | "extracted_fields">;
}

function getUrgency(deadline: string): { label: string; class: string } {
  const lower = deadline.toLowerCase();
  const match = lower.match(/(\d+)\s*days?/);
  const days = match ? parseInt(match[1]) : 99;
  if (days <= 7) return { label: "Urgent", class: "badge-rose" };
  if (days <= 15) return { label: "Soon", class: "badge-amber" };
  return { label: "Standard", class: "badge-teal" };
}

export default function DeadlineCard({ data }: DeadlineCardProps) {
  const { deadlines, extracted_fields } = data;
  const allDates = extracted_fields.dates;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
          <Clock size={14} className="text-amber-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Deadlines & Dates</h3>
      </div>

      {deadlines.length === 0 && allDates.length === 0 ? (
        <div className="text-center py-6">
          <CalendarDays size={28} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No specific deadlines detected in this document.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((dl, i) => {
            const urgency = getUrgency(dl);
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-600 text-amber-300 capitalize">{dl}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Action required by this deadline</div>
                  </div>
                </div>
                <span className={`badge ${urgency.class}`}>{urgency.label}</span>
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
