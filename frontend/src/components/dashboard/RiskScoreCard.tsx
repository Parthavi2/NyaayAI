"use client";
import { useEffect, useState } from "react";
import { AnalyzeResponse, RISK_COLORS } from "@/types";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface RiskScoreCardProps {
  data: Pick<AnalyzeResponse, "risk_score" | "risk_label" | "risk_reasons">;
}

export default function RiskScoreCard({ data }: RiskScoreCardProps) {
  const { risk_score, risk_label, risk_reasons } = data;
  const colors = RISK_COLORS[risk_label];

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(risk_score), 200);
    return () => clearTimeout(timer);
  }, [risk_score]);

  // SVG arc math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc
  const filled = arcLength * (animatedScore / 100);
  const dashOffset = arcLength - filled;

  const RiskIcon = risk_label === "Low Risk" ? CheckCircle : risk_label === "Needs Verification" ? Info : AlertTriangle;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Risk Score</h3>
        <span className={`badge ${
          risk_label === "Low Risk" ? "badge-emerald" :
          risk_label === "Needs Verification" ? "badge-amber" : "badge-rose"
        }`}>
          {risk_label}
        </span>
      </div>

      {/* Radial gauge */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
            {/* Track */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Fill */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                filter: `drop-shadow(0 0 6px ${colors.stroke}66)`,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-800" style={{ color: colors.stroke }}>
              {animatedScore}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <RiskIcon size={16} style={{ color: colors.stroke }} />
            <span className="text-sm font-600 text-slate-200">{risk_label}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            {risk_label === "Low Risk"
              ? "This document appears to be genuine with no major red flags detected."
              : risk_label === "Needs Verification"
              ? "Some elements need verification before taking action."
              : "Multiple fraud signals detected. Do not act without expert advice."}
          </p>
        </div>
      </div>

      {/* Risk reasons */}
      {risk_reasons.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-slate-600 font-600 uppercase tracking-wide mb-2">Risk Signals</div>
          {risk_reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.stroke }} />
              {reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
