"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RiskScoreCard from "@/components/dashboard/RiskScoreCard";
import SummaryCard from "@/components/dashboard/SummaryCard";
import SimplificationCard from "@/components/dashboard/SimplificationCard";
import DetectionCard from "@/components/dashboard/DetectionCard";
import FraudIndicatorsCard from "@/components/dashboard/FraudIndicatorsCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import NextStepsCard from "@/components/dashboard/NextStepsCard";
import ReplyDraftCard from "@/components/dashboard/ReplyDraftCard";
import CaseAssistantCard from "@/components/dashboard/CaseAssistantCard";
import LocationLegalHelpCard from "@/components/dashboard/LocationLegalHelpCard";
import NoticeDetailsCard from "@/components/dashboard/NoticeDetailsCard";
import LawDetailsCard from "@/components/dashboard/LawDetailsCard";
import RightsCard from "@/components/dashboard/RightsCard";
import { translateAnalysis } from "@/lib/api";
import { getCopy } from "@/lib/i18n";
import { MOCK_RESPONSE } from "@/lib/mockData";
import { AnalyzeResponse, LANGUAGE_OPTIONS, OutputLanguage } from "@/types";

const DEFAULT_PANELS = {
  notice: true,
  law: true,
  rights: false,
  query: false,
  resources: false,
};

export default function DashboardPage() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [panels, setPanels] = useState(DEFAULT_PANELS);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("nyaayai_result");
      if (stored) {
        const parsed = { ...MOCK_RESPONSE, ...JSON.parse(stored) } as AnalyzeResponse;
        setData(parsed);
        setLanguage((parsed.output_language as OutputLanguage) || "en");
      } else {
        setData(MOCK_RESPONSE);
      }
    } catch {
      setData(MOCK_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = getCopy(language);

  const handleLanguageChange = async (nextLanguage: OutputLanguage) => {
    setLanguage(nextLanguage);
    setTranslationError(null);
    if (!data || nextLanguage === data.output_language) return;
    setTranslating(true);
    try {
      const translated = await translateAnalysis(data.fingerprint, nextLanguage);
      const updated = { ...data, ...translated, output_language: nextLanguage } as AnalyzeResponse;
      setData(updated);
      sessionStorage.setItem("nyaayai_result", JSON.stringify(updated));
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : copy.languageError);
      setLanguage((data.output_language as OutputLanguage) || "en");
    } finally {
      setTranslating(false);
    }
  };

  const togglePanel = (key: keyof typeof DEFAULT_PANELS) => {
    setPanels((current) => ({ ...current, [key]: !current[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <Navbar />

      <main className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
                  <LayoutDashboard size={15} className="text-teal-400" />
                </div>
                <h1 className="font-display text-2xl font-800 text-slate-100">{copy.dashboard}</h1>
              </div>
              <p className="text-slate-500 text-sm ml-11">Fingerprint: <span className="font-mono text-slate-600">{data.fingerprint}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={language} onChange={(event) => void handleLanguageChange(event.target.value as OutputLanguage)} className="input-field text-sm min-w-48">
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <Link href="/analyze" className="btn-outline flex items-center gap-2 px-4 py-2.5 text-sm self-start">
                <ArrowLeft size={14} />
                {copy.analyseAnother}
              </Link>
            </div>
          </div>

          {translating && <div className="mb-5 rounded-xl border border-teal-400/20 bg-teal-400/10 p-3 text-sm text-teal-200">{copy.languageLoading}</div>}
          {translationError && <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{translationError}</div>}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            <RiskScoreCard data={data} />
            <LawDetailsCard data={data} language={language} />
            <DeadlineCard data={data} language={language} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <SummaryCard data={data} />
            <DetectionCard data={data} />
          </div>

          <div className="mb-5">
            <SimplificationCard data={data} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <FraudIndicatorsCard data={data} />
            <NextStepsCard data={data} language={language} />
          </div>

          <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card mb-5">
            <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">{copy.openSections}</h3>
            <div className="flex flex-wrap gap-3">
              <ToggleButton active={panels.notice} label={copy.noticeSummary} onClick={() => togglePanel("notice")} />
              <ToggleButton active={panels.law} label={copy.detectedLaw} onClick={() => togglePanel("law")} />
              <ToggleButton active={panels.rights} label={copy.legalRights} onClick={() => togglePanel("rights")} />
              <ToggleButton active={panels.query} label={copy.queryResponse} onClick={() => togglePanel("query")} />
              <ToggleButton active={panels.resources} label={copy.helplines} onClick={() => togglePanel("resources")} />
            </div>
          </div>

          {panels.notice && <div className="mb-5"><NoticeDetailsCard data={data} /></div>}
          {panels.law && <div className="mb-5"><LawDetailsCard data={data} language={language} /></div>}
          {panels.rights && <div className="mb-5"><RightsCard data={data} language={language} /></div>}

          {(panels.query || panels.resources) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
              {panels.query ? <CaseAssistantCard data={data} outputLanguage={language} /> : <div />}
              {panels.resources ? <LocationLegalHelpCard data={data} outputLanguage={language} /> : <div />}
            </div>
          )}

          <ReplyDraftCard data={data} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${active ? "bg-teal-400/10 border-teal-400/30 text-teal-200" : "bg-slate-950/40 border-white/10 text-slate-300 hover:border-teal-400/20"}`}
    >
      {label}
    </button>
  );
}
