import { Scale } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, OutputLanguage } from "@/types";

export default function LawDetailsCard({ data, language }: { data: AnalyzeResponse; language: OutputLanguage }) {
  const copy = getCopy(language);
  const primaryLaw = data.detected_laws[0];

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-teal-400/10 flex items-center justify-center">
          <Scale size={14} className="text-teal-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.detectedLaw}</h3>
      </div>

      {primaryLaw ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-lg font-700 text-slate-100">{primaryLaw.act_name}</p>
                <p className="text-sm text-slate-300 mt-1">{primaryLaw.sections.length ? primaryLaw.sections.join(", ") : primaryLaw.section}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="badge badge-teal">{primaryLaw.confidence} confidence</span>
                <span className="badge border border-white/10 text-slate-200">{primaryLaw.severity}</span>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{primaryLaw.match_reason}</p>
          </div>

          {data.detected_laws.slice(1).map((law, index) => (
            <div key={`${law.act_name}-${index}`} className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
                <div>
                  <p className="text-sm font-600 text-slate-100">{law.act_name}</p>
                  <p className="text-xs text-slate-400">{law.sections.length ? law.sections.join(", ") : law.section}</p>
                </div>
                <span className="badge badge-teal">{law.confidence}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{law.match_reason}</p>
            </div>
          ))}

          <div className="rounded-lg border border-white/8 bg-slate-900/50 p-4">
            <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-2">Supporting Lines</div>
            <div className="space-y-1.5">
              {primaryLaw.supporting_lines.map((line, lineIndex) => (
                <p key={`${line}-${lineIndex}`} className="text-xs text-slate-300 leading-relaxed">{line}</p>
              ))}
            </div>
          </div>

          <a href={primaryLaw.official_source_url} target="_blank" rel="noreferrer" className="text-sm text-teal-300 inline-block">
            {primaryLaw.official_source_title}
          </a>
        </div>
      ) : (
        <p className="text-sm text-slate-400">{copy.noLaws}</p>
      )}
    </div>
  );
}
