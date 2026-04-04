import { Upload, Cpu, LayoutDashboard } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Document",
    description: "Drag and drop a PDF, image, or paste text directly. Supports scanned documents via OCR.",
    accent: "teal",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Processes & Analyses",
    description: "Our multi-layer AI pipeline runs fraud detection, NLP analysis, deadline extraction, and legal guidance generation.",
    accent: "violet",
  },
  {
    step: "03",
    icon: LayoutDashboard,
    title: "Get Full Report",
    description: "Receive a rich dashboard with risk score, simplified explanation, next steps, and an editable reply draft.",
    accent: "teal",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-teal-glow opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="section-label mb-3">Process</div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-100 mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From document upload to actionable legal guidance in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-teal-400/30 via-violet-500/30 to-teal-400/30" />

          {STEPS.map(({ step, icon: Icon, title, description, accent }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              {/* Step number background */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-2xl glass border border-white/[0.06] flex items-center justify-center">
                  <Icon size={32} className={accent === "teal" ? "text-teal-400" : "text-violet-400"} />
                </div>
                <div
                  className="absolute -top-3 -right-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-800"
                  style={{
                    background: accent === "teal" ? "rgba(45,212,191,0.15)" : "rgba(139,92,246,0.15)",
                    color: accent === "teal" ? "#2dd4bf" : "#a78bfa",
                    border: `1px solid ${accent === "teal" ? "rgba(45,212,191,0.25)" : "rgba(139,92,246,0.25)"}`,
                  }}
                >
                  {step}
                </div>
              </div>
              <h3 className="font-display font-700 text-slate-200 text-lg mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
