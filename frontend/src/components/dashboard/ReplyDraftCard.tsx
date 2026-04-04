"use client";
import { useState } from "react";
import { AnalyzeResponse } from "@/types";
import { Copy, Download, Edit3, Check, MessageSquare } from "lucide-react";
import { copyToClipboard, downloadText } from "@/lib/utils";

interface ReplyDraftCardProps {
  data: Pick<AnalyzeResponse, "reply_draft">;
}

export default function ReplyDraftCard({ data }: ReplyDraftCardProps) {
  const [draft, setDraft] = useState(data.reply_draft);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadText(draft, "nyaayai-reply-draft.txt");
  };

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-400/10 flex items-center justify-center">
            <MessageSquare size={14} className="text-violet-400" />
          </div>
          <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">AI Reply Draft</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all ${
              editing
                ? "bg-teal-400/15 text-teal-400 border border-teal-400/25"
                : "btn-ghost text-slate-400"
            }`}
          >
            <Edit3 size={12} />
            {editing ? "Done" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 btn-ghost text-slate-400 hover:text-emerald-400"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 btn-ghost text-slate-400 hover:text-teal-400"
          >
            <Download size={12} />
            Save
          </button>
        </div>
      </div>

      <div className="relative">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="input-field font-mono text-xs leading-relaxed min-h-[240px] resize-y"
          />
        ) : (
          <div className="bg-navy-800/60 border border-white/[0.05] rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[180px]">
            {draft}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 mt-3">
        ✦ This draft is AI-generated. Review carefully and personalise before sending.
      </p>
    </div>
  );
}
