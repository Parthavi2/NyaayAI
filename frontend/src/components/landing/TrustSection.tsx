import { Lock, Trash2, Eye, Server } from "lucide-react";

const TRUST_POINTS = [
  { icon: Lock, title: "End-to-End Processing", desc: "Documents are processed in-memory and never stored permanently." },
  { icon: Trash2, title: "Auto-Delete Policy", desc: "All uploads are deleted immediately after analysis is complete." },
  { icon: Eye, title: "PII Redaction", desc: "Emails and phone numbers are automatically redacted before LLM processing." },
  { icon: Server, title: "Private Infrastructure", desc: "Runs on private cloud — your documents never train our models." },
];

export default function TrustSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl border border-white/[0.06] p-10 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-10">
              <div className="md:w-2/5">
                <div className="section-label mb-3">Security & Privacy</div>
                <h2 className="font-display text-3xl sm:text-4xl font-800 text-slate-100 mb-4">
                  Your documents stay{" "}
                  <span className="gradient-text">private. Always.</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We built NyaayAI with privacy at the core. Legal documents are highly sensitive —
                  we treat them that way. No data sold, no training on your files.
                </p>
              </div>

              <div className="md:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass-light rounded-xl p-4 flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-400/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-teal-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-600 text-slate-200 mb-1">{title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SDG Impact strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { number: "5.02 Cr+", label: "Pending cases in India", color: "teal" },
            { number: "80%+", label: "Citizens lack legal access", color: "violet" },
            { number: "₹8.1L Cr", label: "Annual economic loss", color: "amber" },
            { number: "3–25 Yrs", label: "Avg case resolution time", color: "rose" },
          ].map(({ number, label, color }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <div
                className={`font-display text-2xl font-800 mb-1 ${
                  color === "teal" ? "text-teal-400" :
                  color === "violet" ? "text-violet-400" :
                  color === "amber" ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {number}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
