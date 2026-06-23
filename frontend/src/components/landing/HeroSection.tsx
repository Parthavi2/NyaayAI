"use client";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-4 py-1.5 mb-8 animate-fade-up stagger-1">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-400 text-xs font-600 tracking-wide">AI-Powered Legal Aid for India</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 leading-[1.05] tracking-tight mb-6 animate-fade-up stagger-2">
            <span className="text-slate-100">Understand Legal</span>
            <br />
            <span className="gradient-text">Notices Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-up stagger-3">
            Upload any legal notice, FIR, or summons and get AI-powered explanation,
            authenticity detection, deadlines, and reply guidance — in your language.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up stagger-4">
            <Link
              href="/analyze"
              className="btn-primary flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold group"
            >
              Analyze Notice
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="btn-outline flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold"
            >
              <Play size={14} className="text-teal-400" />
              See Demo
            </Link>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-up stagger-5">
            {[
              { icon: Shield, value: "99.2%", label: "Fraud Detection" },
              { icon: Zap, value: "< 30s", label: "Analysis Speed" },
              { icon: Globe, value: "7 Languages", label: "Supported" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center border-animated">
                <Icon size={18} className="text-teal-400 mx-auto mb-2" />
                <div className="font-display font-700 text-xl text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — floating document card */}
        <div className="mt-20 max-w-3xl mx-auto animate-fade-up stagger-6">
          <div className="glass rounded-2xl border border-white/[0.06] p-1 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="bg-navy-800/60 rounded-xl p-6">
              {/* Fake terminal-style UI */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="ml-4 text-xs text-slate-500 font-mono">NyaayAI Analysis Result</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-light rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Document Type</div>
                  <div className="text-sm font-600 text-slate-200">Legal Notice</div>
                  <div className="badge badge-amber mt-2">Payment Dispute</div>
                </div>
                <div className="glass-light rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                  <div className="text-2xl font-display font-800 text-rose-400">72</div>
                  <div className="text-xs text-slate-500">Suspicious</div>
                </div>
                <div className="glass-light rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Deadline</div>
                  <div className="text-sm font-600 text-amber-400">15 Days</div>
                  <div className="text-xs text-slate-500">Action Required</div>
                </div>
              </div>
              <div className="mt-3 glass-light rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1.5">AI Explanation</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  This notice uses threatening language and was sent from a Gmail address — not an official legal firm domain. Several red flags indicate this may be a fraudulent document. Do not make any payment without verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
