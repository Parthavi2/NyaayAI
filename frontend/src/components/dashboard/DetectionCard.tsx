import { AnalyzeResponse, RISK_COLORS } from "@/types";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface DetectionCardProps {
  data: Pick<AnalyzeResponse, "risk_label" | "risk_score" | "redactions">;
}

const DETECTION_CONFIG = {
  "Low Risk": {
    icon: ShieldCheck,
    title: "Appears Genuine",
    message: "No major fraud signals detected. This document shows characteristics of a legitimate legal notice. Proceed with normal caution.",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    barColor: "bg-emerald-400",
  },
  "Needs Verification": {
    icon: ShieldAlert,
    title: "Needs Verification",
    message: "Some elements of this document could not be fully verified. Cross-check the reference number and sender details before acting.",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    barColor: "bg-amber-400",
  },
  Suspicious: {
    icon: ShieldX,
    title: "Suspicious Document",
    message: "Multiple fraud indicators detected. This notice may be fake or from an unauthorised source. Do not pay or respond without expert verification.",
    iconColor: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
    barColor: "bg-rose-400",
  },
};

export default function DetectionCard({ data }: DetectionCardProps) {
  const { risk_label, risk_score, redactions } = data;
  const config = DETECTION_CONFIG[risk_label];
  const Icon = config.icon;
  const genuineScore = 100 - risk_score;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">Authenticity Check</h3>

      <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon size={22} className={config.iconColor} />
          <span className={`font-display font-700 text-base ${config.iconColor}`}>{config.title}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{config.message}</p>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Authenticity Confidence</span>
          <span className="text-slate-300 font-600">{genuineScore}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${config.barColor}`} style={{ width: `${genuineScore}%` }} />
        </div>
      </div>

      {/* PII redactions */}
      {redactions.length > 0 && (
        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-2">PII Automatically Redacted</div>
          <div className="flex flex-wrap gap-1.5">
            {redactions.map((r, i) => (
              <span key={i} className="badge badge-violet capitalize">{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
