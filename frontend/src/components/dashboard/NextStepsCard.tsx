import { AnalyzeResponse } from "@/types";
import { ArrowRight, CheckSquare } from "lucide-react";

interface NextStepsCardProps {
  data: Pick<AnalyzeResponse, "next_steps">;
}

export default function NextStepsCard({ data }: NextStepsCardProps) {
  const { next_steps } = data;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-400/10 flex items-center justify-center">
          <CheckSquare size={14} className="text-violet-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Recommended Next Steps</h3>
      </div>

      <ol className="space-y-3">
        {next_steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-400/15 border border-violet-400/25 flex items-center justify-center mt-0.5">
              <span className="text-xs font-700 text-violet-400">{i + 1}</span>
            </div>
            <div className="flex-1 flex items-start gap-2">
              <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 p-3 bg-teal-400/5 border border-teal-400/15 rounded-xl">
        <div className="flex items-center gap-2">
          <ArrowRight size={13} className="text-teal-400" />
          <p className="text-xs text-slate-400">
            Always consult a qualified advocate for complex legal matters. NyaayAI provides guidance, not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
