"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { LANGUAGE_OPTIONS, OutputLanguage } from "@/types";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  isAnalyzing: boolean;
  progress: number;
  outputLanguage: OutputLanguage;
  onLanguageChange: (lang: OutputLanguage) => void;
}

export default function UploadCard({
  onFileSelect,
  onTextSubmit,
  isAnalyzing,
  progress,
  outputLanguage,
  onLanguageChange,
}: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tab, setTab] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (tab === "file" && selectedFile) onFileSelect(selectedFile);
    if (tab === "text" && pastedText.trim()) onTextSubmit(pastedText);
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") return FileText;
    return ImageIcon;
  };

  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden shadow-card">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06]">
        {[
          { key: "file", label: "Upload File" },
          { key: "text", label: "Paste Text" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "file" | "text")}
            className={cn(
              "flex-1 py-3.5 text-sm font-600 transition-all duration-200",
              tab === t.key
                ? "text-teal-400 border-b-2 border-teal-400 bg-teal-400/[0.04]"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "file" ? (
          <>
            {/* Drop zone */}
            <div
              className={cn(
                "upload-zone rounded-xl p-10 text-center cursor-pointer transition-all duration-300",
                dragActive && "drag-active"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  {(() => {
                    const Icon = getFileIcon(selectedFile);
                    return <Icon size={36} className="text-teal-400" />;
                  })()}
                  <div>
                    <div className="font-600 text-slate-200 text-sm">{selectedFile.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <button
                    className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center">
                    <Upload size={24} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-600 text-sm mb-1">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-slate-500 text-xs">
                      Supports PDF, JPG, PNG · Max 10 MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the text of your legal notice, FIR, or summons here..."
            className="input-field min-h-[200px] resize-none text-sm"
          />
        )}

        {/* Language selector */}
        <div className="mt-4">
          <label className="block text-xs text-slate-500 mb-2">Output Language</label>
          <select
            value={outputLanguage}
            onChange={(e) => onLanguageChange(e.target.value as OutputLanguage)}
            className="input-field text-sm appearance-none cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: "#0f2040" }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Progress bar */}
        {isAnalyzing && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Analyzing document...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill bg-gradient-to-r from-teal-400 to-violet-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || (tab === "file" ? !selectedFile : !pastedText.trim())}
          className={cn(
            "btn-primary w-full mt-4 py-3 text-sm font-semibold flex items-center justify-center gap-2",
            (isAnalyzing || (tab === "file" ? !selectedFile : !pastedText.trim())) &&
              "opacity-50 cursor-not-allowed hover:shadow-none hover:transform-none"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analysing…
            </>
          ) : (
            "Run AI Analysis"
          )}
        </button>
      </div>
    </div>
  );
}
