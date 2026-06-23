"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, OutputLanguage } from "@/types";

export default function RightsCard({ data, language }: { data: AnalyzeResponse; language: OutputLanguage }) {
  const copy = getCopy(language);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center">
          <ShieldCheck size={14} className="text-emerald-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.legalRights}</h3>
      </div>

      <div className="space-y-3">
        {data.rights_information.length === 0 && <p className="text-sm text-slate-400">{copy.noRights}</p>}
        {data.rights_information.map((right, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={`${right.title}-${index}`} className="rounded-xl border border-white/8 bg-slate-950/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <p className="text-sm font-600 text-slate-100">{right.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{right.article_or_section || right.source}</p>
                </div>
                <ChevronDown size={16} className={`text-emerald-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/6">
                  <p className="text-sm text-slate-300 leading-relaxed pt-4">{right.detailed_explanation}</p>
                  {right.official_text_excerpt && (
                    <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 p-3">
                      <div className="text-xs font-700 tracking-widest uppercase text-emerald-300 mb-1">Official Context</div>
                      <p className="text-sm text-slate-200 leading-relaxed">{right.official_text_excerpt}</p>
                    </div>
                  )}
                  <List title="What You Can Legally Do" items={right.what_user_can_legally_do} />
                  <List title="Precautions" items={right.precautions_to_take} />
                  <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 p-3">
                    <div className="text-xs font-700 tracking-widest uppercase text-amber-300 mb-1">When To Contact Legal Aid / Authority</div>
                    <p className="text-sm text-slate-200 leading-relaxed">{right.when_to_contact_legal_aid_or_authority}</p>
                  </div>
                  <a href={right.official_source_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-300 inline-block">
                    {right.official_source_title}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="btn-outline mt-4 inline-block px-4 py-2.5 text-sm">
        {copy.knowRights}
      </a>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-2">{title}</div>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className="text-sm text-slate-200 leading-relaxed">{index + 1}. {item}</p>
        ))}
      </div>
    </div>
  );
}
