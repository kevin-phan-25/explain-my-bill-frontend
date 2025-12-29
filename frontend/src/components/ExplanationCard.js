import React, { useState } from "react";
import jsPDF from "jspdf";
import ConfidenceHeatMap from "./ConfidenceHeatMap";
import ConfidenceTooltip from "./ConfidenceTooltip";
import ConfidenceLegendModal from "./ConfidenceLegendModal";
import LowConfidenceFlag from "./LowConfidenceFlag";
import FieldAIExplanation from "./FieldAIExplanation";
import ReportIncorrectAmount from "./ReportIncorrectAmount";
import ConfidenceGate from "./ConfidenceGate";
import DisputeLetterGenerator from "./DisputeLetterGenerator";

export default function ExplanationCard({ result }) {
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);

  if (!result?.pages?.length) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur shadow-xl text-center">
        <p className="text-gray-700 dark:text-gray-200 font-medium">No data returned.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Try uploading a clearer file (PDF text layer preferred) or a sharper image.
        </p>
      </div>
    );
  }

  const page = result.pages[0];
  const structured = page.structured || {};
  const explanation =
    structured.explanation || result.explanation || "No explanation available.";
  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];
  const nextSteps = structured.nextSteps || [];

  const sourceType = structured?.confidenceMeta?.sourceType || "unknown";
  const usedOCR = Boolean(structured?.confidenceMeta?.usedOCR);

  const niceLabel = (k) =>
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .replace("Usd", "USD");

  const confidenceTone = (c = 0) => {
    if (c >= 0.8) return "border-emerald-400/30 bg-emerald-500/10";
    if (c >= 0.55) return "border-sky-400/30 bg-sky-500/10";
    if (c >= 0.35) return "border-amber-400/30 bg-amber-500/10";
    return "border-rose-400/30 bg-rose-500/10";
  };

  const confidenceDot = (c = 0) => {
    if (c >= 0.8) return "bg-emerald-400";
    if (c >= 0.55) return "bg-sky-400";
    if (c >= 0.35) return "bg-amber-400";
    return "bg-rose-400";
  };

  const fields = Object.entries(keyAmounts).filter(([, v]) => v && typeof v === "object");

  return (
    <div className="relative">
      {/* Ambient futuristic glow */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(50%_50%_at_10%_80%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(60%_60%_at_90%_80%,rgba(34,211,238,0.14),transparent_55%)] blur-2xl" />

      <div className="relative max-w-3xl mx-auto rounded-[2rem] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Top header */}
        <div className="px-6 sm:px-8 py-6 border-b border-black/5 dark:border-white/10 bg-gradient-to-r from-white/40 to-white/10 dark:from-white/5 dark:to-white/0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Your Bill Explained
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Educational use only. No medical, legal, or billing advice. Files are processed transiently and never stored.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2">
                <span className="text-lg">🔒</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Privacy-first
                </span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Source: {sourceType}{usedOCR ? " (OCR)" : ""}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLegend(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20">
              i
            </span>
            What do confidence scores mean?
          </button>
        </div>

        {/* Key amounts */}
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Key amounts detected
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hover a card to see extraction source. Low confidence means “verify on the original bill.”
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className={`h-2 w-2 rounded-full ${confidenceDot(0.9)}`} />
              High
              <span className={`ml-3 h-2 w-2 rounded-full ${confidenceDot(0.6)}`} />
              Medium
              <span className={`ml-3 h-2 w-2 rounded-full ${confidenceDot(0.25)}`} />
              Low
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(([k, v]) => {
              const c = v.confidence || 0;
              const pct = Math.round(c * 100);

              return (
                <div
                  key={k}
                  className={[
                    "relative rounded-2xl border shadow-lg overflow-hidden",
                    "transition-transform duration-200 hover:-translate-y-0.5",
                    "bg-white/65 dark:bg-white/5 backdrop-blur",
                    "border-white/30 dark:border-white/10",
                  ].join(" ")}
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Subtle neon edge */}
                  <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)]" />

                  <div className="relative p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {niceLabel(k)}
                        </p>
                        <div className="mt-2">
                          <ConfidenceGate confidence={c}>
                            <p className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                              {v.value || "—"}
                            </p>
                          </ConfidenceGate>
                        </div>
                      </div>

                      <div
                        className={[
                          "shrink-0 rounded-xl border px-3 py-2 text-center min-w-[110px]",
                          confidenceTone(c),
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${confidenceDot(c)}`} />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {pct}% conf
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-200 opacity-80">
                          {c >= 0.8 ? "Strong" : c >= 0.55 ? "Good" : c >= 0.35 ? "Weak" : "Very weak"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <LowConfidenceFlag confidence={c} />
                    </div>

                    <div className="mt-3">
                      <FieldAIExplanation explanation={v.aiExplanation} />
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <ReportIncorrectAmount field={k} value={v.value} />
                      <DisputeLetterGenerator field={k} value={v.value} confidence={c} />
                    </div>

                    {hovered === k && (
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30">
                        <ConfidenceTooltip confidence={c} source={v.source} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Confidence heat map
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {sourceType}{usedOCR ? " • OCR used" : ""}
                </p>
              </div>
              <ConfidenceHeatMap keyAmounts={keyAmounts} />
            </div>
          </div>
        </div>

        {/* Explanation accordion */}
        <div className="px-6 sm:px-8 pb-8">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-4 py-3 shadow-lg"
          >
            <span className="font-extrabold text-gray-900 dark:text-white">
              Explanation
            </span>
            <span className="text-gray-700 dark:text-gray-200 text-xl">
              {open ? "−" : "+"}
            </span>
          </button>

          {open && (
            <div className="mt-4 rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5 shadow-lg space-y-3">
              {points?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Summary points
                  </p>
                  <div className="grid gap-2">
                    {points.map((p, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/20 px-3 py-2"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {p}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Detailed explanation
                </p>
                <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {explanation}
                </p>
              </div>

              {nextSteps?.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Next steps
                  </p>
                  <div className="grid gap-2">
                    {nextSteps.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/20 px-3 py-2"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                          ✓
                        </span>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {s}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 text-xs text-gray-600 dark:text-gray-300">
                Tip: If a number is “Not detected” or low confidence, upload a PDF (not a photo of a screen),
                or a clearer image with higher contrast.
              </div>
            </div>
          )}
        </div>

        {showLegend && (
          <ConfidenceLegendModal onClose={() => setShowLegend(false)} />
        )}
      </div>
    </div>
  );
}
