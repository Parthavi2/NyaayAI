"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HistoryItem } from "@/types";
import { MOCK_HISTORY } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { History, Search, Filter, ArrowUpRight, FileText, Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_ICON = {
  "Low Risk": { Icon: CheckCircle, color: "text-emerald-400" },
  "Needs Verification": { Icon: Info, color: "text-amber-400" },
  Suspicious: { Icon: AlertTriangle, color: "text-rose-400" },
};

const RISK_BADGE = {
  "Low Risk": "badge-emerald",
  "Needs Verification": "badge-amber",
  Suspicious: "badge-rose",
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nyaayai_history") || "[]");
      setItems(stored.length > 0 ? stored : MOCK_HISTORY);
    } catch {
      setItems(MOCK_HISTORY);
    }
  }, []);

  const docTypes = ["All", ...Array.from(new Set(items.map((i) => i.document_type)))];

  const filtered = items.filter((item) => {
    const matchSearch =
      search === "" ||
      item.filename.toLowerCase().includes(search.toLowerCase()) ||
      item.document_type.toLowerCase().includes(search.toLowerCase()) ||
      item.case_type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || item.document_type === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem("nyaayai_history", JSON.stringify(updated));
  };

  const handleReopen = (item: HistoryItem) => {
    // Set mock result and navigate to dashboard
    const result = { ...item, explanation: item.summary };
    sessionStorage.setItem("nyaayai_result", JSON.stringify(result));
  };

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <Navbar />

      <main className="relative pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                <History size={16} className="text-violet-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-800 text-slate-100">Analysis History</h1>
                <p className="text-slate-500 text-sm">{filtered.length} document{filtered.length !== 1 ? "s" : ""} analysed</p>
              </div>
            </div>
          </div>

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename, document type, or case..."
                className="input-field pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-500" />
              <div className="flex gap-1.5">
                {docTypes.map((dt) => (
                  <button
                    key={dt}
                    onClick={() => setFilter(dt)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-600 transition-all",
                      filter === dt
                        ? "bg-teal-400/15 text-teal-400 border border-teal-400/25"
                        : "bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:text-slate-300"
                    )}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History list */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={40} className="text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-400 font-600 mb-2">No results found</h3>
              <p className="text-slate-600 text-sm">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const riskInfo = RISK_ICON[item.risk_label];
                const RiskIcon = riskInfo.Icon;

                return (
                  <div
                    key={item.id}
                    className="glass rounded-2xl border border-white/[0.06] p-5 card-hover flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-teal-400/10 border border-teal-400/15 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-teal-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-600 text-slate-200 text-sm truncate">{item.filename}</span>
                        <span className="badge badge-teal">{item.document_type}</span>
                        <span className="badge badge-violet">{item.case_type}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-2">{item.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>{formatDate(item.analyzed_at)}</span>
                        <span className="font-mono">{item.fingerprint}</span>
                      </div>
                    </div>

                    {/* Risk */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <RiskIcon size={14} className={riskInfo.color} />
                        <span className={`badge ${RISK_BADGE[item.risk_label]}`}>{item.risk_label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href="/dashboard"
                          onClick={() => handleReopen(item)}
                          className="w-8 h-8 rounded-lg bg-teal-400/10 border border-teal-400/20 flex items-center justify-center hover:bg-teal-400/20 transition-colors"
                        >
                          <ArrowUpRight size={14} className="text-teal-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-rose-400/10 hover:border-rose-400/20 transition-colors"
                        >
                          <Trash2 size={13} className="text-slate-500 hover:text-rose-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
