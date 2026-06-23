"use client";

import { useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";
import { askCaseAssistant } from "@/lib/api";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, OutputLanguage, QueryAnswer } from "@/types";

interface CaseAssistantCardProps {
  data: AnalyzeResponse;
  outputLanguage: OutputLanguage;
}

export default function CaseAssistantCard({ data, outputLanguage }: CaseAssistantCardProps) {
  const copy = getCopy(outputLanguage);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QueryAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await askCaseAssistant(question.trim(), data.fingerprint, outputLanguage);
      setAnswer(response.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not answer this query right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-teal-400/10 flex items-center justify-center">
          <Bot size={14} className="text-teal-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.queryResponse}</h3>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-4">
        Ask a doubt about this specific notice. The answer stays tied to this document, its legal basis, deadlines, and your rights in this matter.
      </p>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder={copy.askPlaceholder}
        className="w-full min-h-28 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-400/40"
      />

      <button
        type="button"
        onClick={handleAsk}
        disabled={loading || !question.trim()}
        className="btn-primary mt-3 inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
      >
        <SendHorizonal size={14} />
        {loading ? copy.answering : copy.askButton}
      </button>

      {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</div>}

      {answer && (
        <div className="mt-4 space-y-3">
          {!answer.is_within_scope ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">{copy.outOfScope}</div>
          ) : (
            <>
              <Section title="User Question" content={answer.user_question} />
              <Section title="Short Answer" content={answer.short_answer} highlight />
              <Section title="Detailed Explanation" content={answer.detailed_explanation} />
              <Section title="Legal / Practical Context" content={answer.legal_practical_context} />
              <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-2">What The User Should Do Next</div>
                <ol className="space-y-2">
                  {answer.what_user_should_do_next.map((step, index) => (
                    <li key={`${step}-${index}`} className="text-sm text-slate-200 leading-relaxed">{index + 1}. {step}</li>
                  ))}
                </ol>
              </div>
              <Section title="Caution / Verification Note" content={answer.caution_verification_note} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, content, highlight = false }: { title: string; content: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "border-teal-400/20 bg-teal-400/5" : "border-white/8 bg-slate-950/40"}`}>
      <div className={`text-xs font-700 tracking-widest uppercase mb-2 ${highlight ? "text-teal-400" : "text-slate-500"}`}>{title}</div>
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}
