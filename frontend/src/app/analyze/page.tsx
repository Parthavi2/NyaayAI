"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UploadCard from "@/components/analyze/UploadCard";
import ActionButtons from "@/components/analyze/ActionButtons";
import { analyzeDocument, analyzeText } from "@/lib/api";
import { AnalyzeResponse, OutputLanguage } from "@/types";
import { AlertCircle, Sparkles, Scale, Shield, Languages, Clock } from "lucide-react";

const TIPS = [
  { icon: Scale, text: "Upload FIRs, legal notices, court summons, or any legal document." },
  { icon: Shield, text: "Our AI detects fake notices and assigns a fraud risk score." },
  { icon: Languages, text: "Get results in Hindi, Marathi, Tamil, and 4 other languages." },
  { icon: Clock, text: "Analysis completes in under 30 seconds." },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [activeAction, setActiveAction] = useState<string | undefined>();

  const handleAnalysis = async (result: AnalyzeResponse) => {
    // Store result in sessionStorage so dashboard can read it
    sessionStorage.setItem("nyaayai_result", JSON.stringify(result));

    // Add to history
    const history = JSON.parse(localStorage.getItem("nyaayai_history") || "[]");
    const historyItem = {
      id: Date.now().toString(),
      filename: "Analyzed Document",
      document_type: result.document_type,
      case_type: result.case_type,
      risk_label: result.risk_label,
      risk_score: result.risk_score,
      analyzed_at: new Date().toISOString(),
      fingerprint: result.fingerprint,
      summary: result.summary,
    };
    localStorage.setItem("nyaayai_history", JSON.stringify([historyItem, ...history].slice(0, 20)));
    router.push("/dashboard");
  };

  const runAnalysis = async (fn: () => Promise<AnalyzeResponse>) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    try {
      const result = await fn();
      await handleAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (file: File) => {
    runAnalysis(() =>
      analyzeDocument(file, language, (p) => setProgress(p))
    );
  };

  const handleTextSubmit = (text: string) => {
    runAnalysis(() => analyzeText(text, language));
  };

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />

      <Navbar />

      <main className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-400/10 border border-violet-400/20 rounded-full px-4 py-1.5 mb-5">
              <Sparkles size={13} className="text-violet-400" />
              <span className="text-violet-400 text-xs font-600 tracking-wide">AI Legal Analysis Engine</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-slate-100 mb-4">
              Analyse Your <span className="gradient-text">Legal Document</span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Upload a PDF, image, or paste text. Our AI will analyse it and provide a full risk assessment in seconds.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 max-w-2xl mx-auto flex items-center gap-3 p-4 bg-rose-400/10 border border-rose-400/20 rounded-xl text-rose-300 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload */}
            <div className="lg:col-span-2">
              <UploadCard
                onFileSelect={handleFileSelect}
                onTextSubmit={handleTextSubmit}
                isAnalyzing={isAnalyzing}
                progress={progress}
                outputLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <ActionButtons
                onAction={setActiveAction}
                activeAction={activeAction}
                disabled={isAnalyzing}
              />

              {/* Tips */}
              <div className="glass rounded-2xl border border-white/[0.06] p-5">
                <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">How It Works</h3>
                <div className="space-y-3.5">
                  {TIPS.map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-teal-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={12} className="text-teal-400" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo notice */}
              <div className="p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl">
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  <span className="font-600">Demo Mode:</span> Currently showing mock analysis results. Connect your FastAPI backend to process real documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
