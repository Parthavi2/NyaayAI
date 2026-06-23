import { AnalyzeResponse } from "@/types";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface FraudIndicatorsCardProps {
  data: Pick<AnalyzeResponse, "risk_reasons" | "risk_score">;
}

const ALL_CHECKS = [
  { key: "Missing reference number", label: "Official reference number present" },
  { key: "Unofficial email domain detected", label: "Official sender domain" },
  { key: "Suspicious phrase found: urgent payment", label: "No manipulative payment phrases" },
  { key: "Suspicious phrase found: final warning", label: "No threatening language" },
  { key: "Suspicious phrase found: avoid arrest", label: "No coercive arrest threats" },
  { key: "Suspicious phrase found: contact on whatsapp", label: "No unofficial contact channels" },
];

export default function FraudIndicatorsCard({ data }: FraudIndicatorsCardProps) {
  const { risk_reasons, risk_score } = data;

  const checks = ALL_CHECKS.map((check) => ({
    ...check,
    failed: risk_reasons.some((r) => r.toLowerCase().includes(check.key.toLowerCase())),
  }));

  const additionalReasons = risk_reasons.filter(
    (r) => !ALL_CHECKS.some((c) => r.toLowerCase().includes(c.key.toLowerCase()))
  );

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Fraud Indicators</h3>
        <span className={`badge ${risk_score > 60 ? "badge-rose" : risk_score > 30 ? "badge-amber" : "badge-emerald"}`}>
          Score: {risk_score}/100
        </span>
      </div>

      <div className="space-y-2.5">
        {checks.map(({ label, failed }) => (
          <div key={label} className="flex items-center gap-3">
            {failed ? (
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
            )}
            <span className={`text-xs ${failed ? "text-rose-300" : "text-slate-400"}`}>{label}</span>
            {failed && (
              <span className="ml-auto text-xs text-rose-400/70">FAIL</span>
            )}
          </div>
        ))}
      </div>

      {additionalReasons.length > 0 && (
        <div className="mt-4 p-3 bg-rose-400/5 border border-rose-400/10 rounded-xl">
          <div className="text-xs text-slate-500 mb-2">Additional Signals</div>
          {additionalReasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-rose-300 mb-1.5">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
