import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import ConfidenceHeatMap from "./ConfidenceHeatMap";
import ConfidenceTooltip from "./ConfidenceTooltip";
import ConfidenceLegendModal from "./ConfidenceLegendModal";
import LowConfidenceFlag from "./LowConfidenceFlag";
import FieldAIExplanation from "./FieldAIExplanation";
import ReportIncorrectAmount from "./ReportIncorrectAmount";
import ConfidenceGate from "./ConfidenceGate";
import DisputeLetterGenerator from "./DisputeLetterGenerator";

function pct(conf) {
  const n = Number(conf || 0);
  return Math.max(0, Math.min(100, Math.round(n * 100)));
}

function labelizeKey(k) {
  return k
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ExplanationCard({ result }) {
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  if (!result?.pages?.length) {
    return <p className="text-center">No data returned.</p>;
  }

  const page = result.pages[0];
  const structured = page.structured || {};
  const explanation =
    structured.explanation || result.explanation || "No explanation available.";
  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];
  const nextSteps = structured.nextSteps || [];
  const rawText = page.rawText || "";

  const amountEntries = useMemo(() => {
    // Hide _debug card from main cards unless you want it visible
    return Object.entries(keyAmounts).filter(([k, v]) => k !== "_debug" && v && typeof v === "object");
  }, [keyAmounts]);

  const confidenceMeta = structured.confidenceMeta || {};
  const sourceType = confidenceMeta.sourceType || result?.extractionMeta?.sourceType || "unknown";

  return (
    <div className="relative max-w-5xl mx-auto space-y-6">
      {/* Main panel */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-[28px] border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Bill Explained
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                Clear, human-friendly guidance with confidence scoring. Educational use only —
                verify totals before paying.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-white/20">
                  🔒 processed transiently
                </span>
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-white/20">
                  📌 confidence + source shown
                </span>
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-white/20">
                  🧾 source: {sourceType}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <button
                onClick={() => setShowLegend(true)}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 underline underline-offset-4"
              >
                What do confidence scores mean?
              </button>

              <button
                onClick={() => setShowRaw((v) => !v)}
                className="text-sm font-semibold px-4 py-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur hover:scale-[1.02]"
              >
                {showRaw ? "Hide extracted text" : "View extracted text"}
              </button>
            </div>
          </div>
        </div>

        {/* Amount cards */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {amountEntries.map(([k, v]) => {
              const c = pct(v.confidence);
              const isLow = c > 0 && c < 60;

              return (
                <div
                  key={k}
                  className="relative rounded-3xl p-5 border border-white/15 bg-gradient-to-b from-white/70 to-white/30 dark:from-white/5 dark:to-white/0 shadow-xl overflow-hidden"
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {labelizeKey(k)}
                      </p>

                      <ConfidenceGate confidence={v.confidence}>
                        <p className="text-2xl font-extrabold mt-1">
                          {v.value || "—"}
                        </p>
                      </ConfidenceGate>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs px-2.5 py-1 rounded-full border border-white/20 bg-white/50 dark:bg-white/5">
                        <span className="font-semibold">{c}%</span>{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                          confidence
                        </span>
                      </div>
                      {isLow && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                          verify this one
                        </div>
                      )}
                    </div>
                  </div>

                  {/* confidence bar */}
                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c}%`,
                          background:
                            c >= 80
                              ? "linear-gradient(90deg,#22c55e,#16a34a)"
                              : c >= 60
                              ? "linear-gradient(90deg,#facc15,#f59e0b)"
                              : "linear-gradient(90deg,#fb7185,#ef4444)",
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                      {v.source ? `Source: ${v.source}` : "Source: —"}
                    </p>
                  </div>

                  <LowConfidenceFlag confidence={v.confidence} />
                  <FieldAIExplanation explanation={v.aiExplanation} />

                  <div className="mt-4 space-y-2">
                    <ReportIncorrectAmount field={k} value={v.value} />
                    <DisputeLetterGenerator
                      field={k}
                      value={v.value}
                      confidence={v.confidence}
                    />
                  </div>

                  {/* Tooltip */}
                  {hovered === k && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20">
                      <div className="space-y-2">
                        <ConfidenceTooltip confidence={v.confidence} source={v.source} />
                        {(v.matchLine || v.matchMethod) && (
                          <div className="w-[320px] rounded-2xl border border-white/20 bg-white/80 dark:bg-black/60 backdrop-blur p-3 shadow-2xl">
                            <p className="text-xs font-bold mb-1">
                              Why this value was chosen
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              Method:{" "}
                              <span className="font-semibold">{v.matchMethod || "—"}</span>
                            </p>
                            {v.matchLine && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                Match line:
                                <span className="block font-mono text-[11px] mt-1 whitespace-pre-wrap">
                                  {v.matchLine}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <ConfidenceHeatMap keyAmounts={keyAmounts} />
          </div>

          {/* Explanation */}
          <div className="mt-10 rounded-3xl border border-white/15 bg-white/50 dark:bg-white/5 backdrop-blur p-5 sm:p-6">
            <button
              onClick={() => setOpen(!open)}
              className="font-extrabold flex justify-between w-full text-left"
            >
              <span>
                Explanation{" "}
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  Plain-English summary + pointers + suggested next steps
                </span>
              </span>
              <span className="text-2xl leading-none">{open ? "−" : "+"}</span>
            </button>

            {open && (
              <div className="mt-4 space-y-3">
                {points.map((p, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-200">
                    • {p}
                  </p>
                ))}

                <div className="rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                    {explanation}
                  </p>
                </div>

                {nextSteps.length > 0 && (
                  <>
                    <p className="font-extrabold mt-2">Next Steps:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {nextSteps.map((s, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 p-3 text-sm"
                        >
                          ✅ {s}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Raw text viewer */}
          {showRaw && (
            <div className="mt-6 rounded-3xl border border-white/15 bg-white/60 dark:bg-white/5 backdrop-blur p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-extrabold text-lg">Extracted Text (Debug/Trust)</h3>
                <button
                  onClick={() => setShowRaw(false)}
                  className="text-sm font-semibold px-4 py-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/5"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                This is exactly what OCR/Text extraction produced before AI analysis.
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/5 dark:bg-black/30 p-4 max-h-[320px] overflow-auto">
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800 dark:text-gray-100">
                  {rawText || "No raw text returned."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLegend && <ConfidenceLegendModal onClose={() => setShowLegend(false)} />}
    </div>
  );
}
