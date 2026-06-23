import { AnalyzeResponse } from "@/types";
import { MessageCircle, BookOpen } from "lucide-react";

interface SimplificationCardProps {
  data: Pick<AnalyzeResponse, "summary" | "explanation">;
}

export default function SimplificationCard({ data }: SimplificationCardProps) {
  const { summary, explanation } = data;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-teal-400/10 flex items-center justify-center">
          <BookOpen size={14} className="text-teal-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Plain Language Explanation</h3>
      </div>

      {/* Summary */}
      <div className="glass-light rounded-xl p-4 mb-4 border border-teal-400/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="section-label text-teal-400">Summary</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Full explanation */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={13} className="text-violet-400" />
          <span className="text-xs font-600 text-slate-500">Detailed Explanation</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}
