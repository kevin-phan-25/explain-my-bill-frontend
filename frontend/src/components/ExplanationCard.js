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
  const [showRaw, setShowRaw] = useState(false);

  if (!result?.pages?.length) {
    return <p className="text-center text-white/70">No data returned.</p>;
  }

  const page = result.pages[0];
  const structured = page.structured || {};
  const explanation =
    structured.explanation || result.explanation || "No explanation available.";
  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];
  const nextSteps = structured.nextSteps || [];

  const confidenceMeta = structured.confidenceMeta || {};
  const usedOCR = confidenceMeta.usedOCR;
  const sourceType = confidenceMeta.sourceType;

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("ExplainMyBill Report", 14, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(
        `Key Amounts:\n${Object.entries(keyAmounts)
          .map(([k, v]) => `${k}: ${v?.value || "—"} (${Math.round((v?.confidence || 0) * 100)}%)`)
          .join("\n")}\n\nExplanation:\n${explanation}`,
        180
      );
      doc.text(lines, 14, 28);
      doc.save("ExplainMyBill-Report.pdf");
    } catch (e) {
      console.error(e);
      alert("PDF export failed. Check console.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Your Bill Explained
              </h2>
              <p className="mt-2 text-sm md:text-base text-white/70 max-w-2xl">
                Clear, human-friendly guidance with confidence scoring. This tool is for education —
                always verify totals before paying.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                  🔒 processed transiently (never stored)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                  ✅ confidence + source shown
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                  ⚡ fast explanation
                </span>
                {(sourceType || usedOCR !== undefined) && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75">
                    🧠 source: {sourceType || "unknown"}
                    {usedOCR ? <span className="text-amber-200/90">• OCR used</span> : null}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col gap-3 md:items-end">
              <button
                onClick={() => setShowLegend(true)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
              >
                What do confidence scores mean?
              </button>

              <button
                onClick={downloadPDF}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-white
                           bg-gradient-to-r from-indigo-600 to-fuchsia-600
                           hover:from-indigo-500 hover:to-fuchsia-500
                           shadow-[0_18px_60px_rgba(99,102,241,0.20)]"
              >
                Download Report (PDF)
              </button>
            </div>
          </div>

          {/* Key Amounts */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(keyAmounts).map(([k, v]) => {
              if (!v || typeof v !== "object") return null;

              const pct = Math.round((v.confidence || 0) * 100);
              const displayLabel = k
                .replace(/([A-Z])/g, " $1")
                .replace(/^\w/, (c) => c.toUpperCase());

              return (
                <div
                  key={k}
                  className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden"
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* glow */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white/65">{displayLabel}</p>
                        <ConfidenceGate confidence={v.confidence}>
                          <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                            {v.value || "—"}
                          </p>
                        </ConfidenceGate>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-white/55">Confidence</div>
                        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              background:
                                pct >= 80
                                  ? "rgb(52,211,153)"
                                  : pct >= 55
                                  ? "rgb(251,191,36)"
                                  : "rgb(248,113,113)",
                              boxShadow:
                                pct >= 80
                                  ? "0 0 16px rgba(52,211,153,0.35)"
                                  : pct >= 55
                                  ? "0 0 16px rgba(251,191,36,0.30)"
                                  : "0 0 16px rgba(248,113,113,0.30)",
                            }}
                          />
                          {pct}%
                        </div>
                      </div>
                    </div>

                    {/* micro bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct >= 80
                              ? "linear-gradient(90deg, rgba(52,211,153,0.9), rgba(16,185,129,0.7))"
                              : pct >= 55
                              ? "linear-gradient(90deg, rgba(251,191,36,0.9), rgba(245,158,11,0.65))"
                              : "linear-gradient(90deg, rgba(248,113,113,0.9), rgba(244,63,94,0.65))",
                        }}
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      <LowConfidenceFlag confidence={v.confidence} />
                      <FieldAIExplanation explanation={v.aiExplanation} />
                      <div className="flex flex-wrap gap-2">
                        <ReportIncorrectAmount field={k} value={v.value} />
                        <DisputeLetterGenerator field={k} value={v.value} confidence={v.confidence} />
                      </div>
                    </div>

                    {hovered === k && (
                      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-20">
                        <ConfidenceTooltip confidence={v.confidence} source={v.source} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <ConfidenceHeatMap keyAmounts={keyAmounts} />
          </div>

          {/* Explanation accordion */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              onClick={() => setOpen(!open)}
              className="w-full px-5 py-4 flex items-center justify-between text-left"
            >
              <div>
                <div className="text-lg font-bold text-white">Explanation</div>
                <div className="text-xs text-white/60">
                  Plain-English summary + pointers and suggested next steps
                </div>
              </div>
              <div className="text-white/70 text-2xl">{open ? "−" : "+"}</div>
            </button>

            {open && (
              <div className="px-5 pb-5 space-y-3">
                {points?.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-sm font-semibold text-white/85 mb-2">
                      Quick Highlights
                    </div>
                    <div className="space-y-1 text-sm text-white/75">
                      {points.map((p, i) => (
                        <p key={i}>• {p}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="whitespace-pre-wrap text-sm md:text-base text-white/80 leading-relaxed">
                    {explanation}
                  </p>
                </div>

                {nextSteps?.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="font-semibold text-white/85 mb-2">Next Steps</p>
                    <div className="space-y-1 text-sm text-white/75">
                      {nextSteps.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw text toggle for transparency/trust */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-sm text-white/75 hover:text-white underline"
                  >
                    {showRaw ? "Hide extracted text" : "Show extracted text (transparency)"}
                  </button>

                  {showRaw && (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs text-white/60 mb-2">
                        Extracted text preview (for debugging/trust):
                      </div>
                      <pre className="text-xs whitespace-pre-wrap text-white/75 max-h-72 overflow-auto">
                        {page.rawText || "No rawText returned."}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-center text-white/55">
            Educational use only. No medical, legal, or billing advice. Files are processed transiently and never stored.
          </p>
        </div>
      </div>

      {showLegend && <ConfidenceLegendModal onClose={() => setShowLegend(false)} />}
    </div>
  );
}
