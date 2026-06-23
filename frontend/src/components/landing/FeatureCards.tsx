import {
  ShieldCheck,
  FileSearch,
  Languages,
  Clock,
  FileEdit,
  AlertTriangle,
  Scale,
  Fingerprint,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Smart Document Analysis",
    description: "Upload PDFs, images, or scanned documents. Our OCR + NLP engine extracts all key information automatically.",
    accent: "teal",
  },
  {
    icon: ShieldCheck,
    title: "Fake Notice Detector",
    description: "Identifies fraud patterns, missing authority details, unofficial email domains, and suspicious phrasing.",
    accent: "violet",
  },
  {
    icon: Languages,
    title: "7 Language Support",
    description: "Get explanations in Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, and English.",
    accent: "teal",
  },
  {
    icon: Clock,
    title: "Deadline Extraction",
    description: "Automatically detects and highlights all critical dates and action deadlines.",
    accent: "amber",
  },
  {
    icon: FileEdit,
    title: "AI Reply Drafting",
    description: "Generates a professional legal reply draft you can edit and download instantly.",
    accent: "violet",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Risk Score",
    description: "Assigns a 0–100 risk score with colour-coded labels: Low Risk, Needs Verification, Suspicious.",
    accent: "rose",
  },
  {
    icon: Scale,
    title: "Legal Guidance",
    description: "Provides clear next steps tailored to your document type and case category.",
    accent: "teal",
  },
  {
    icon: Fingerprint,
    title: "Document Fingerprint",
    description: "Unique SHA-256 fingerprint for every document to track and prevent duplicate submissions.",
    accent: "violet",
  },
];

const ACCENT_STYLES = {
  teal: {
    icon: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(45,212,191,0.12)]",
    hover: "group-hover:border-teal-400/30",
  },
  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(167,139,250,0.12)]",
    hover: "group-hover:border-violet-400/30",
  },
  amber: {
    icon: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,191,36,0.12)]",
    hover: "group-hover:border-amber-400/30",
  },
  rose: {
    icon: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,113,133,0.12)]",
    hover: "group-hover:border-rose-400/30",
  },
};

export default function FeatureCards() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label mb-3">Features</div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-100 mb-4">
            Everything you need to{" "}
            <span className="gradient-text">fight back</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A complete AI-powered toolkit for understanding, verifying, and responding to legal documents.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => {
            const accent = ACCENT_STYLES[feature.accent as keyof typeof ACCENT_STYLES];
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group glass rounded-xl p-5 border ${accent.border} ${accent.hover} ${accent.glow} card-hover transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-lg ${accent.bg} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={accent.icon} />
                </div>
                <h3 className="font-display font-600 text-slate-200 text-sm mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
