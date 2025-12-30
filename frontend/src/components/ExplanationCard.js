// src/components/ExplanationCard.js
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

export default function ExplanationCard({ result }) {
  // ✅ Hooks must be unconditional (no early-return before hooks)
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const safe = useMemo(() => {
    const pages = result?.pages || [];
    const page0 = pages[0] || {};
    const structured = page0.structured || page0?.structured || page0?.structured || {};
    const structuredSafe = structured || {};
    const keyAmounts = structuredSafe.keyAmounts || {};
    const explanation =
      structuredSafe.explanation || result?.explanation || "No explanation available.";
    const nextSteps = structuredSafe.nextSteps || [];
    const summary = structuredSafe.summary || "Bill analyzed.";
    const confidenceMeta = structuredSafe.confidenceMeta || {};
    const rawText = page0.rawText || "";
    const extractionMeta = result?.extractionMeta || {};

    // Normalize keyAmounts: only objects
    const entries = Object.entries(keyAmounts).filter(
      ([, v]) => v && typeof v === "object"
    );

    return {
      hasPages: pages.length > 0,
      entries,
      summary,
      explanation,
      nextSteps,
      confidenceMeta,
      rawText,
      extractionMeta,
    };
  }, [result]);

  // Now it’s safe to early return
  if (!safe.hasPages) {
    return <p className="text-center text-white/70">No data returned.</p>;
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("ExplainMyBill Report", 14, 18);

      doc.setFontSize(11);
      doc.text("Educational use only. Verify before paying.", 14, 28);

      doc.setFontSize(12);
      doc.text("Summary:", 14, 40);
      doc.setFontSize(10);
      doc.text(String(safe.summary || ""), 14, 48, { maxWidth: 180 });

      doc.setFontSize(12);
      doc.text("Explanation:", 14, 70);
      doc.setFontSize(10);
      doc.text(String(safe.explanation || ""), 14, 78, { maxWidth: 180 });

      doc.save("ExplainMyBill_Report.pdf");
    } catch (e) {
      console.error(e);
      alert("PDF export failed. Check console.");
    }
  };

  const extractorLabel =
    safe.extractionMeta?.extractorUsed ||
    safe.confidenceMeta?.extractorUsed ||
    safe.confidenceMeta?.sourceType ||
    "unknown";

  return (
    <div className="relative">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl p-5 md:p-7">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Your Bill Explained
            </h2>
            <p className="text-sm text-white/70 mt-2 max-w-2xl">
              Clear, human-friendly guidance with confidence scoring and evidence lines.
              This tool is for education — always verify totals before paying.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Chip icon="🧼" text="processed transiently (never stored)" />
              <Chip icon="✅" text="confidence + evidence shown" />
              <Chip icon="⚡" text="fast explanation" />
              <Chip icon="🧾" text={`extractor: ${extractorLabel}`} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowLegend(true)}
              className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 text-sm"
            >
              What do confidence scores mean?
            </button>

            <button
              onClick={downloadPDF}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-bold text-sm shadow-lg hover:opacity-95"
            >
              Download Report (PDF)
            </button>
          </div>
        </div>

        {/* Key fields */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {safe.entries.map(([k, v]) => {
            const pct = Math.round((v.confidence || 0) * 100);
            const title = prettifyKey(k);

            return (
              <div
                key={k}
                className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-xl"
                onMouseEnter={() => setHovered(k)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/70">{title}</p>
                    <ConfidenceGate confidence={v.confidence}>
                      <p className="text-3xl font-extrabold mt-2">
                        {v.value || "—"}
                      </p>
                    </ConfidenceGate>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-white/50">Confidence</p>
                    <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <span
                        className={[
                          "inline-block w-2.5 h-2.5 rounded-full",
                          pct >= 80 ? "bg-emerald-400" : pct >= 55 ? "bg-amber-300" : "bg-rose-400",
                        ].join(" ")}
                      />
                      <span className="text-sm font-bold">{pct}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar pct={pct} />
                  <p className="text-xs text-white/50 mt-2">
                    {v.source ? `Source: ${v.source}` : "Source: unknown"}
                  </p>
                  <LowConfidenceFlag confidence={v.confidence} />
                </div>

                {/* Evidence lines (citations) */}
                {Array.isArray(v.citations) && v.citations.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-3">
                    <p className="text-xs font-bold text-white/80 mb-2">
                      Evidence lines (from extracted text)
                    </p>
                    <ul className="space-y-2">
                      {v.citations.slice(0, 3).map((c, idx) => (
                        <li key={idx} className="text-xs text-white/70">
                          <span className="text-white/50">
                            {c.lineIndex ? `L${c.lineIndex}: ` : ""}
                          </span>
                          <span className="font-mono">{c.lineText}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optional: per-field AI explanation (kept) */}
                <FieldAIExplanation explanation={v.aiExplanation} />

                <div className="mt-4 flex flex-col gap-2">
                  <ReportIncorrectAmount field={k} value={v.value} />
                  <DisputeLetterGenerator field={k} value={v.value} confidence={v.confidence} />
                </div>

                {hovered === k && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50">
                    <ConfidenceTooltip confidence={v.confidence} source={v.source} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Heatmap */}
        <div className="mt-8">
          <h3 className="text-lg font-extrabold text-center">Confidence by Field</h3>
          <div className="mt-4">
            <ConfidenceHeatMap
              keyAmounts={Object.fromEntries(safe.entries)}
            />
          </div>
        </div>

        {/* Explanation accordion */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between font-extrabold"
          >
            <span>Explanation</span>
            <span className="text-white/60">{open ? "−" : "+"}</span>
          </button>

          {open && (
            <div className="mt-4 space-y-3">
              <p className="text-white/80">{safe.summary}</p>

              <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <p className="text-sm text-white/80 whitespace-pre-wrap">
                  {safe.explanation}
                </p>
              </div>

              {Array.isArray(safe.nextSteps) && safe.nextSteps.length > 0 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="font-bold mb-2">Suggested next steps</p>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-white/80">
                    {safe.nextSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRaw((x) => !x)}
                  className="text-sm text-white/70 hover:text-white underline underline-offset-4"
                >
                  {showRaw ? "Hide extracted text" : "Show extracted text (for trust/debug)"}
                </button>

                <span className="text-xs text-white/50">
                  Not medical/legal/billing advice
                </span>
              </div>

              {showRaw && (
                <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 border border-white/10 p-4 text-xs text-white/70 whitespace-pre-wrap">
                  {safe.rawText || "No raw text available."}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Legend modal */}
        {showLegend && <ConfidenceLegendModal onClose={() => setShowLegend(false)} />}
      </div>
    </div>
  );
}

function prettifyKey(k) {
  return String(k)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function ProgressBar({ pct }) {
  const cl =
    pct >= 80 ? "bg-emerald-400" : pct >= 55 ? "bg-amber-300" : "bg-rose-400";
  return (
    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full ${cl}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Chip({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}
