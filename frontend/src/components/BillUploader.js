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
  // ✅ Hooks MUST be called before any return
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // ✅ Derive values safely (and only once)
  const derived = useMemo(() => {
    const hasPages = !!result?.pages?.length;
    const page = hasPages ? result.pages[0] : null;
    const structured = page?.structured || {};
    const keyAmounts = structured?.keyAmounts || {};
    const explanation =
      structured?.explanation || result?.explanation || "No explanation available.";
    const points = structured?.summaryPoints || [];
    const nextSteps = structured?.nextSteps || [];
    const rawText = page?.rawText || "";
    const confidenceMeta = structured?.confidenceMeta || {};

    // Normalize the amounts into consistent cards (handles your current schema)
    const fields = Object.entries(keyAmounts)
      .map(([k, v]) => {
        if (!v || typeof v !== "object") return null;
        return {
          key: k,
          label: (v.label || k).replace(/([A-Z])/g, " $1").trim(),
          value: v.value ?? "—",
          confidence: typeof v.confidence === "number" ? v.confidence : 0,
          reason: v.reason || "",
          source: v.source || "",
          raw: v.raw || "",
          aiExplanation: v.aiExplanation || "",
        };
      })
      .filter(Boolean);

    // Suspicious-data detection: same value repeated or weird tiny values
    const valuesOnly = fields.map((f) => String(f.value || ""));
    const uniqueValues = new Set(valuesOnly.filter((v) => v && v !== "—"));
    const repeated = uniqueValues.size <= Math.max(1, Math.floor(fields.length / 2));

    const tinyMoney = fields.some((f) => {
      const n = Number(String(f.value).replace(/[$,]/g, ""));
      return isFinite(n) && n > 0 && n < 5; // catches $1.00 style junk
    });

    const debugHint = repeated || tinyMoney;

    return {
      hasPages,
      page,
      structured,
      keyAmounts,
      fields,
      explanation,
      points,
      nextSteps,
      rawText,
      confidenceMeta,
      debugHint,
    };
  }, [result]);

  if (!derived.hasPages) {
    return <p className="text-center text-gray-300">No data returned.</p>;
  }

  const {
    fields,
    explanation,
    points,
    nextSteps,
    rawText,
    confidenceMeta,
    debugHint,
  } = derived;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("ExplainMyBill Report", 10, 15);
    doc.setFont("helvetica", "normal");
    doc.text("Educational use only. Verify amounts before paying.", 10, 25);

    doc.text("Summary / Explanation:", 10, 40);
    const lines = doc.splitTextToSize(explanation || "", 180);
    doc.text(lines, 10, 50);

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.text("Extracted Text (Debug)", 10, 15);
    doc.setFont("helvetica", "normal");
    const rawLines = doc.splitTextToSize(rawText || "No raw text.", 180);
    doc.text(rawLines, 10, 25);

    doc.save("explainmybill-report.pdf");
  };

  return (
    <div className="relative">
      {/* Ambient background glow */}
      <div className="absolute -inset-6 blur-3xl opacity-40 pointer-events-none bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-400/20" />

      <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Your Bill Explained
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl">
                Clear, human-friendly guidance with confidence scoring. This is for education —
                always verify totals before paying.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge icon="🔒" text="processed transiently (never stored)" />
                <Badge icon="✅" text="confidence + source shown" />
                <Badge icon="⚡" text="fast explanation" />
                {confidenceMeta?.sourceType && (
                  <Badge icon="🧾" text={`source: ${confidenceMeta.sourceType}`} />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <button
                onClick={() => setShowLegend(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/10"
              >
                What do confidence scores mean?
              </button>

              <button
                onClick={downloadPDF}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
              >
                Download Report (PDF)
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/50">
            Educational use only. No medical, legal, or billing advice. Not HIPAA-certified.
          </p>
        </div>

        {/* Amount cards */}
        <div className="p-6 sm:p-8">
          {debugHint && (
            <div className="mb-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
              <div className="flex items-start gap-3">
                <div className="text-lg">⚠️</div>
                <div className="flex-1">
                  <p className="font-semibold">
                    Extraction looks suspicious (repeated values or tiny amounts).
                  </p>
                  <p className="text-yellow-100/80 mt-1">
                    Turn on <span className="font-semibold">Raw Text Preview</span> to verify what
                    Google Vision extracted. If the raw text is good, the issue is likely your
                    field-matching logic — not OCR.
                  </p>

                  <button
                    onClick={() => setShowDebug((v) => !v)}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold"
                  >
                    {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDebug && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/80">
              <p className="font-bold text-white mb-2">Debug</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/30 p-3 border border-white/10">
                  <p className="text-white/60">Source Type</p>
                  <p className="font-semibold text-white">
                    {confidenceMeta?.sourceType || "unknown"}
                  </p>
                </div>
                <div className="rounded-xl bg-black/30 p-3 border border-white/10">
                  <p className="text-white/60">Used OCR fallback</p>
                  <p className="font-semibold text-white">
                    {String(confidenceMeta?.usedOCR ?? "unknown")}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-white/60">
                Tip: If raw text contains “PAY THIS AMOUNT 111.41” but your cards show $992 or
                $14,561 — your regex/heuristics are grabbing the wrong numbers.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div
                key={f.key}
                className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 overflow-hidden"
                onMouseEnter={() => setHovered(f.key)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Subtle glow accent */}
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/10 blur-3xl pointer-events-none" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white/85">{f.label}</p>

                    <div className="rounded-full px-3 py-1 text-xs font-bold border border-white/10 bg-black/30 text-white/80">
                      {Math.round((f.confidence || 0) * 100)}%
                    </div>
                  </div>

                  <div className="mt-3">
                    <ConfidenceGate confidence={f.confidence}>
                      <p className="text-3xl font-extrabold text-white tracking-tight">
                        {f.value || "—"}
                      </p>
                    </ConfidenceGate>

                    {/* Confidence bar */}
                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, (f.confidence || 0) * 100))}%`,
                          background:
                            (f.confidence || 0) >= 0.8
                              ? "linear-gradient(90deg, rgba(16,185,129,1), rgba(34,197,94,1))"
                              : (f.confidence || 0) >= 0.5
                              ? "linear-gradient(90deg, rgba(234,179,8,1), rgba(245,158,11,1))"
                              : "linear-gradient(90deg, rgba(239,68,68,1), rgba(244,63,94,1))",
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-white/55 line-clamp-2">
                      {f.reason ? f.reason : "—"}
                    </p>

                    <LowConfidenceFlag confidence={f.confidence} />
                    <FieldAIExplanation explanation={f.aiExplanation} />

                    <div className="mt-4 space-y-2">
                      <ReportIncorrectAmount field={f.key} value={f.value} />
                      <DisputeLetterGenerator
                        field={f.key}
                        value={f.value}
                        confidence={f.confidence}
                      />
                    </div>

                    {hovered === f.key && (
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20">
                        <ConfidenceTooltip confidence={f.confidence} source={f.source} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="mt-10">
            <h3 className="text-center text-white font-extrabold text-xl mb-4">
              Confidence by Field
            </h3>
            <ConfidenceHeatMap keyAmounts={derived.keyAmounts} />
          </div>

          {/* Explanation */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-white font-extrabold text-lg">Explanation</p>
                <p className="text-xs text-white/60">
                  Plain-English summary + pointers and suggested next steps
                </p>
              </div>
              <span className="text-white/80 text-2xl">{open ? "−" : "+"}</span>
            </button>

            {open && (
              <div className="mt-4 space-y-3 text-white/85 text-sm leading-relaxed">
                {points.map((p, i) => (
                  <p key={i}>• {p}</p>
                ))}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="whitespace-pre-wrap">{explanation}</p>
                </div>

                {nextSteps.length > 0 && (
                  <div className="pt-2">
                    <p className="font-extrabold text-white mt-2">Next Steps:</p>
                    {nextSteps.map((s, i) => (
                      <p key={i}>• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Raw text (debug/trust) */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-white font-extrabold">Extracted Text Preview (Debug/Trust)</p>
                <p className="text-xs text-white/60">
                  Shows what the OCR extracted before sending to OpenAI/Gemini
                </p>
              </div>
              <span className="text-white/80 text-2xl">{showRaw ? "−" : "+"}</span>
            </button>

            {showRaw && (
              <pre className="mt-4 max-h-80 overflow-auto text-xs whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-white/80">
                {rawText || "No raw text returned."}
              </pre>
            )}
          </div>
        </div>

        {showLegend && <ConfidenceLegendModal onClose={() => setShowLegend(false)} />}
      </div>
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/80">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}
