"use client";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const LOADING_MESSAGES = [
  "Extracting text from document…",
  "Running fraud detection…",
  "Analysing legal clauses…",
  "Calculating risk score…",
  "Generating plain-language explanation…",
  "Drafting reply…",
  "Almost done…",
];

interface LoadingStateProps {
  progress: number;
}

export default function LoadingState({ progress }: LoadingStateProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/20 to-violet-500/20 border border-teal-400/20 flex items-center justify-center">
          <Scale size={32} className="text-teal-400 animate-pulse" />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-teal-400 animate-spin" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Analysing your document</span>
          <span className="font-mono text-teal-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated message */}
      <p className="text-sm text-slate-400 animate-pulse text-center">
        {LOADING_MESSAGES[msgIndex]}
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: 7 }).map((_, i) => {
          const stepProgress = (i + 1) * (100 / 7);
          return (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                progress >= stepProgress
                  ? "bg-teal-400 scale-125"
                  : "bg-white/10"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
