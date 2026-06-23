"use client";

import { useState } from "react";
import { Loader2, LocateFixed, MapPin, PhoneCall } from "lucide-react";
import { getLocationSupport } from "@/lib/api";
import { getCopy } from "@/lib/i18n";
import { AnalyzeResponse, LocationSupportResponse, OutputLanguage } from "@/types";

interface LocationLegalHelpCardProps {
  data: AnalyzeResponse;
  outputLanguage: OutputLanguage;
}

export default function LocationLegalHelpCard({ data, outputLanguage }: LocationLegalHelpCardProps) {
  const copy = getCopy(outputLanguage);
  const [state, setState] = useState(data.state_detected === "Not detected" ? "" : data.state_detected);
  const [city, setCity] = useState(data.city_detected === "Not detected" ? "" : data.city_detected);
  const [result, setResult] = useState<LocationSupportResponse | null>({
    preferred_language: data.output_language,
    detected_state: data.state_detected,
    detected_city: data.city_detected,
    state_options: data.state_options,
    resources: data.location_resources,
    legal_aid: data.legal_aid,
    support_options: data.support_options,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupport = async (coords?: { latitude: number; longitude: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLocationSupport({
        fingerprint: data.fingerprint,
        state,
        city,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        preferredLanguage: outputLanguage,
        caseType: data.case_type,
      });
      setResult(response);
      if (response.detected_state && response.detected_state !== "Not detected") setState(response.detected_state);
      if (response.detected_city && response.detected_city !== "Not detected") setCity(response.detected_city);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load location-based legal help.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchSupport({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => {
        setLoading(false);
        setError("Location access was denied. You can still search by state and city.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-400/10 flex items-center justify-center">
          <MapPin size={14} className="text-violet-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">{copy.helplines}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          value={state}
          onChange={(event) => setState(event.target.value)}
          placeholder={copy.state}
          className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400/40"
        />
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={copy.city}
          className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400/40"
        />
      </div>

      {result?.state_options?.length ? (
        <select value={state} onChange={(event) => setState(event.target.value)} className="input-field text-sm mb-3">
          <option value="">{copy.confirmState}</option>
          {result.state_options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : null}

      <div className="flex flex-wrap gap-3 mb-4">
        <button type="button" onClick={() => void fetchSupport()} disabled={loading} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60 inline-flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? copy.searching : copy.searchResources}
        </button>
        <button type="button" onClick={handleUseLocation} disabled={loading} className="btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60">
          <LocateFixed size={14} />
          {copy.useLocation}
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
            <div className="text-xs font-700 tracking-widest uppercase text-violet-400 mb-2">{copy.detectedLocation}</div>
            <p className="text-sm text-slate-200">{result.detected_city}, {result.detected_state}</p>
          </div>

          <div className="space-y-3">
            {result.resources.map((resource, index) => (
              <div key={`${resource.relevant_authority_name}-${index}`} className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-600 text-slate-100">{resource.relevant_authority_name}</p>
                    <p className="text-xs text-slate-400">{resource.office_support_category}</p>
                  </div>
                  <span className={`text-[11px] uppercase tracking-wide px-2 py-1 rounded-full ${resource.is_fallback ? "bg-amber-400/10 text-amber-300" : "bg-emerald-400/10 text-emerald-300"}`}>
                    {resource.is_fallback ? "Fallback" : "Official match"}
                  </span>
                </div>
                <div className="grid gap-2 text-xs text-slate-300">
                  <p>State / City: {resource.state}, {resource.city}</p>
                  <p>Helpline: {resource.helpline_number}</p>
                  <p>Hours: {resource.availability_hours}</p>
                  <a href={resource.official_website} target="_blank" rel="noreferrer" className="text-teal-300 inline-block">{resource.official_source_title}</a>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{resource.relevance_reason}</p>
                <a href={`tel:${resource.helpline_number.replace(/[^\d+]/g, "")}`} className="btn-outline mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <PhoneCall size={14} />
                  Call Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
