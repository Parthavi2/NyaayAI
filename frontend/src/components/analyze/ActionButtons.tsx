"use client";
import { ShieldCheck, FileText, MessageSquare, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "authenticity", icon: ShieldCheck, label: "Detect Authenticity", accent: "emerald", desc: "Check if genuine or fake" },
  { id: "simplify", icon: FileText, label: "Simplify Notice", accent: "teal", desc: "Plain language explanation" },
  { id: "reply", icon: MessageSquare, label: "Generate Reply", accent: "violet", desc: "AI-drafted response" },
  { id: "deadlines", icon: Clock, label: "Extract Deadlines", accent: "amber", desc: "Important dates & actions" },
  { id: "case", icon: BookOpen, label: "Understand Case", accent: "teal", desc: "Case type & context" },
  { id: "fraud", icon: AlertTriangle, label: "View Fraud Indicators", accent: "rose", desc: "Risk signals & reasons" },
];

const ACCENT_MAP = {
  teal: "text-teal-400 bg-teal-400/10 border-teal-400/20 hover:border-teal-400/40 hover:bg-teal-400/15",
  violet: "text-violet-400 bg-violet-400/10 border-violet-400/20 hover:border-violet-400/40 hover:bg-violet-400/15",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40 hover:bg-emerald-400/15",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/15",
  rose: "text-rose-400 bg-rose-400/10 border-rose-400/20 hover:border-rose-400/40 hover:bg-rose-400/15",
};

interface ActionButtonsProps {
  onAction: (id: string) => void;
  activeAction?: string;
  disabled?: boolean;
}

export default function ActionButtons({ onAction, activeAction, disabled }: ActionButtonsProps) {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card">
      <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map(({ id, icon: Icon, label, accent, desc }) => (
          <button
            key={id}
            onClick={() => !disabled && onAction(id)}
            disabled={disabled}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
              ACCENT_MAP[accent as keyof typeof ACCENT_MAP],
              activeAction === id && "ring-1 ring-inset ring-current",
              disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <div className="mt-0.5">
              <Icon size={16} />
            </div>
            <div>
              <div className="text-xs font-600 leading-tight">{label}</div>
              <div className="text-xs opacity-60 mt-0.5 font-400">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
