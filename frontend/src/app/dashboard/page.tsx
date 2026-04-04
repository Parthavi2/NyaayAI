"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { AnalyzeResponse } from "@/types";
import { MOCK_RESPONSE } from "@/lib/mockData";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("nyaayai_result");
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        // Use mock data for demo/direct navigation
        setData(MOCK_RESPONSE);
      }
    } catch {
      setData(MOCK_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading analysis…</p>
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
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
                  <LayoutDashboard size={15} className="text-teal-400" />
                </div>
                <h1 className="font-display text-2xl font-800 text-slate-100">Analysis Dashboard</h1>
              </div>
              <p className="text-slate-500 text-sm ml-11">
                Full breakdown of your legal document · Fingerprint:{" "}
                <span className="font-mono text-slate-600">{data.fingerprint}</span>
              </p>
            </div>
            <Link href="/analyze" className="btn-outline flex items-center gap-2 px-4 py-2.5 text-sm self-start">
              <ArrowLeft size={14} />
              Analyse Another
            </Link>
          </div>

          {/* Top row: Risk + Summary + Detection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <RiskScoreCard data={data} />
            <SummaryCard data={data} />
            <DetectionCard data={data} />
          </div>

          {/* Middle row: Explanation full-width */}
          <div className="mb-5">
            <SimplificationCard data={data} />
          </div>

          {/* Bottom row: Fraud + Deadlines + Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <FraudIndicatorsCard data={data} />
            <DeadlineCard data={data} />
            <NextStepsCard data={data} />
          </div>

          {/* Reply draft full-width */}
          <ReplyDraftCard data={data} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
