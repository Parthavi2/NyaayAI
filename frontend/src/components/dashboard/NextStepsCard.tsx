"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckSquare } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, OutputLanguage } from "@/types";

interface NextStepsCardProps {
  data: Pick<AnalyzeResponse, "next_steps" | "case_type" | "detected_laws">;
  language: OutputLanguage;
}

export default function NextStepsCard({ data, language }: NextStepsCardProps) {
  const copy = getCopy(language);
  const storageKey = useMemo(() => `nyaayai_checklist_${data.case_type}_${(data.detected_laws[0]?.act_name || "general").replace(/\s+/g, "_")}`, [data.case_type, data.detected_laws]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setChecked(stored ? JSON.parse(stored) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const toggle = (key: string) => {
    setChecked((current) => {
      const updated = { ...current, [key]: !current[key] };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const query = encodeURIComponent(data.detected_laws[0]?.act_name || data.case_type || "legal notice");
  const lawyerUrl = `https://www.vakilsearch.com/?s=${query}`;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-400/10 flex items-center justify-center">
          <CheckSquare size={14} className="text-violet-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.nextSteps}</h3>
      </div>

      <ol className="space-y-3">
        {data.next_steps.map((step, index) => {
          const key = `${index}-${step.title}`;
          const isChecked = checked[key];
          return (
            <li key={key} className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={isChecked || false} onChange={() => toggle(key)} className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-violet-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className={`text-sm font-600 ${isChecked ? "text-slate-500 line-through" : "text-slate-100"}`}>{index + 1}. {step.title}</p>
                    <span className="text-[11px] uppercase tracking-wide text-violet-300">{step.timeframe}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isChecked ? "text-slate-500" : "text-slate-300"}`}>{step.details}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid gap-3">
        <div className="p-3 bg-teal-400/5 border border-teal-400/15 rounded-xl">
          <div className="flex items-center gap-2">
            <ArrowRight size={13} className="text-teal-400" />
            <p className="text-xs text-slate-400">Always consult a qualified advocate for complex legal matters. NyaayAI provides guidance, not legal advice.</p>
          </div>
        </div>
        <a href={lawyerUrl} target="_blank" rel="noreferrer" className="btn-outline px-4 py-2.5 text-sm text-center">
          {copy.findLawyer}
        </a>
      </div>
    </div>
  );
}
