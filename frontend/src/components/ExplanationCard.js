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
  // ✅ Hooks ALWAYS run (no early return before hooks)
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const normalized = useMemo(() => {
    const page = result?.pages?.[0] || {};
    const structured = page.structured || {};

    const keyAmounts = structured.keyAmounts || {};
    const citations = structured.citations || [];
    const confidenceMeta = structured.confidenceMeta || {};

    const explanation =
      structured.explanation || result?.explanation || "No explanation available.";

    const summary = structured.summary || "Bill analyzed.";
    const points = structured.summaryPoints || [];
    const nextSteps = structured.nextSteps || [];

    // Prefer preview if present (less sensitive)
    const rawText = page.rawTextPreview || page.rawText || "";

    return {
      hasData: !!result?.pages?.length,
      page,
      structured,
      summary,
      explanation,
      keyAmounts,
      points,
      nextSteps,
      citations,
      confidenceMeta,
      rawText,
    };
  }, [result]);

  if (!normalized.hasData) {
    return (
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center text-white/70">
        No data returned.
      </div>
    );
  }

  const {
    summary,
    explanation,
    keyAmounts,
    points,
    nextSteps,
    citations,
    confidenceMeta,
    rawText,
  } = normalized;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ExplainMyBill Report", 14, 18);

    doc.setFontSize(11);
    doc.text(`Summary: ${summary}`, 14, 30);

    doc.setFontSize(10);
    doc.text("Explanation:", 14, 42);
    doc.text(doc.splitTextToSize(explanation, 180), 14, 50);

    doc.setFontSize(10);
    doc.text("Next Steps:", 14, 110);
    const steps = (nextSteps || []).map((s, i) => `${i + 1}. ${s}`);
    doc.text(doc.splitTextToSize(steps.join("\n"), 180), 14, 118);

    doc.save("explainmybill-report.pdf");
  };

  const chip = (icon, text) => (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );

  // Convert citations to field->snippets list for easy rendering
  const evidenceByField = useMemo(() => {
    const map = {};
    (citations || []).forEach((c) => {
      const f = String(c?.field || "").toLowerCase();
      if (!f) return;
      map[f] = map[f] || [];
      if (c?.snippet) map[f].push(String(c.snippet));
    });
    return map;
  }, [citations]);

  const fieldLabel = (k) => {
    const pretty = k.replace(/([A-Z])/g, " $1").trim();
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_100px_-45px_rgba(0,0,0,0.9)] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Your Bill Explained
            </h2>
            <p className="mt-2 text-sm text-white/70 max-w-2xl">
              Clear, human-friendly guidance with confidence scoring and evidence snippets.
              Always verify totals before paying.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {chip("🧼", "processed transiently (never stored)")}
              {chip("🔎", "evidence + source shown")}
              {chip("⚡", "fast explanation")}
              {confidenceMeta?.sourceType && chip("🧾", `source: ${confidenceMeta.sourceType}`)}
              {confidenceMeta?.extractorUsed && chip("🧠", `extractor: ${confidenceMeta.extractorUsed}`)}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:w-[260px]">
            <button
              onClick={() => setShowLegend(true)}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm text-white/85"
            >
              What do confidence scores mean?
            </button>

            <button
              onClick={downloadPDF}
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 px-4 py-3 text-sm font-semibold shadow-[0_10px_30px_-15px_rgba(99,102,241,0.8)]"
            >
              Download Report (PDF)
            </button>
          </div>
        </div>

        {/* Amount cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(keyAmounts).map(([k, v]) => {
            if (!v || typeof v !== "object") return null;

            const percent = Math.round((v.confidence || 0) * 100);
            const evKey = String(k).toLowerCase();
            const snippets = evidenceByField[evKey] || [];
            const directEvidence = v.evidence ? [v.evidence] : [];
            const allEvidence = [...directEvidence, ...snippets].slice(0, 3);

            return (
              <div
                key={k}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 to-white/4 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                onMouseEnter={() => setHovered(k)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/70">{fieldLabel(k)}</p>
                    <ConfidenceGate confidence={v.confidence}>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight">
                        {v.value || "—"}
                      </p>
                    </ConfidenceGate>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-white/50">Confidence</p>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          percent >= 85 ? "bg-emerald-400" : percent >= 60 ? "bg-amber-300" : "bg-rose-400",
                        ].join(" ")}
                      />
                      <span className="text-xs text-white/80">{percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full",
                      percent >= 85 ? "bg-emerald-400" : percent >= 60 ? "bg-amber-300" : "bg-rose-400",
                    ].join(" ")}
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-white/55">
                  {v.reason || "Confidence reflects clarity + evidence."}
                </p>

                <LowConfidenceFlag confidence={v.confidence} />
                <FieldAIExplanation explanation={v.aiExplanation} />

                {/* Evidence */}
                {allEvidence.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs font-semibold text-white/70 mb-2">
                      Evidence (from extracted text)
                    </p>
                    <div className="space-y-2">
                      {allEvidence.map((snip, i) => (
                        <div key={i} className="text-xs text-white/75 leading-relaxed">
                          <span className="text-white/40 mr-2">•</span>
                          <span className="font-mono">{snip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <ReportIncorrectAmount field={k} value={v.value} />
                  <DisputeLetterGenerator field={k} value={v.value} confidence={v.confidence} />
                </div>

                {hovered === k && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20">
                    <ConfidenceTooltip confidence={v.confidence} source={v.source} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ConfidenceHeatMap keyAmounts={keyAmounts} />

        {/* Explanation */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 font-semibold flex items-center justify-between"
        >
          <span>Explanation</span>
          <span className="text-white/70">{open ? "−" : "+"}</span>
        </button>

        {open && (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 space-y-3">
            <p className="text-sm text-white/80 font-semibold">{summary}</p>

            {points.length > 0 && (
              <div className="space-y-1">
                {points.map((p, i) => (
                  <p key={i} className="text-sm text-white/75">
                    • {p}
                  </p>
                ))}
              </div>
            )}

            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {explanation}
            </p>

            {nextSteps.length > 0 && (
              <>
                <p className="text-sm font-bold mt-2">Next Steps:</p>
                <div className="space-y-1">
                  {nextSteps.map((s, i) => (
                    <p key={i} className="text-sm text-white/75">
                      • {s}
                    </p>
                  ))}
                </di
