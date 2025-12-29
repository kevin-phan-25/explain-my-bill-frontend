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
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);

  if (!result?.pages?.length) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8">
          <p className="text-center text-white/80">No data returned.</p>
        </div>
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

  // ======= Helpers (UI + Trust) =======
  const fields = useMemo(() => {
    const entries = Object.entries(keyAmounts || {}).filter(
      ([, v]) => v && typeof v === "object"
    );

    // nice ordering if present
    const order = ["totalCharges", "insurancePaid", "patientResponsibility"];
    entries.sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return entries;
  }, [keyAmounts]);

  const trustBadges = useMemo(() => {
    const sourceType = structured?.confidenceMeta?.sourceType || "unknown";
    const usedOCR = Boolean(structured?.confidenceMeta?.usedOCR);
    return {
      sourceType,
      usedOCR,
      transient: true,
      noLogin: true,
    };
  }, [structured]);

  function humanLabel(key) {
    if (key === "totalCharges") return "Total Charges";
    if (key === "insurancePaid") return "Insurance Paid";
    if (key === "patientResponsibility") return "Patient Responsibility";
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  }

  function confidenceTier(c = 0) {
    if (c >= 0.85) return { label: "High", ring: "ring-emerald-400/40", glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_20px_50px_rgba(0,0,0,0.35)]" };
    if (c >= 0.6) return { label: "Medium", ring: "ring-sky-400/40", glow: "shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_20px_50px_rgba(0,0,0,0.35)]" };
    return { label: "Low", ring: "ring-amber-400/40", glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_20px_50px_rgba(0,0,0,0.35)]" };
  }

  function downloadPDF() {
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 48;
      let y = margin;

      const title = "ExplainMyBill — Summary (Educational Use Only)";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title, margin, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const metaLine = `Processed transiently • Not medical/legal/billing advice • Source: ${
        structured?.confidenceMeta?.sourceType || "unknown"
      }${structured?.confidenceMeta?.usedOCR ? " • OCR used" : ""}`;
      doc.text(metaLine, margin, y);
      y += 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Key Amounts", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const amountLines = fields.map(([k, v]) => {
        const pct = Math.round((v?.confidence || 0) * 100);
        return `${humanLabel(k)}: ${v?.value || "—"}  (${pct}% confidence)`;
      });

      amountLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 520);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 14;
      });

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Explanation", margin, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      const expl = doc.splitTextToSize(explanation || "", 520);
      doc.text(expl, margin, y);
      y += Math.min(expl.length * 14, 280);

      if (nextSteps?.length) {
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Next Steps", margin, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        nextSteps.forEach((s) => {
          const wrapped = doc.splitTextToSize(`• ${s}`, 520);
          doc.text(wrapped, margin, y);
          y += wrapped.length * 14;
        });
      }

      doc.save("ExplainMyBill-Summary.pdf");
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("PDF export failed. Check console for details.");
    }
  }

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="pointer-events-none absolute -inset-8 opacity-60 blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-fuchsia-500/20" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
                  Live Analysis • Transient Processing
                </div>

                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Your Bill Explained
                </h2>

                <p className="mt-2 text-sm text-white/70 max-w-3xl">
                  Educational use only — not medical, legal, or billing advice. Files are processed
                  transiently in-memory and never stored.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                <button
                  onClick={() => setShowLegend(true)}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 hover:bg-white/15 transition"
                >
                  Confidence Guide
                </button>

                <button
                  onClick={downloadPDF}
                  className="rounded-xl bg-white text-gray-900 px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
                >
                  Download Summary PDF
                </button>
              </div>
            </div>

            {/* Trust row */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] text-white/60">Storage</p>
                <p className="text-sm font-semibold text-white">None</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] text-white/60">Login</p>
                <p className="text-sm font-semibold text-white">Not required</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] text-white/60">Text source</p>
                <p className="text-sm font-semibold text-white">
                  {trustBadges.sourceType}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] text-white/60">OCR</p>
                <p className="text-sm font-semibold text-white">
                  {trustBadges.usedOCR ? "Used" : "Not used"}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Amount Cards */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {fields.map(([k, v]) => {
                const c = Number(v?.confidence || 0);
                const tier = confidenceTier(c);
                const pct = Math.round(c * 100);

                return (
                  <div
                    key={k}
                    className={[
                      "relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 overflow-hidden",
                      "ring-1",
                      tier.ring,
                      tier.glow,
                    ].join(" ")}
                    onMouseEnter={() => setHovered(k)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* subtle glow */}
                    <div className="pointer-events-none absolute -inset-6 opacity-40 blur-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    </div>

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-white/70">{humanLabel(k)}</p>
                          <ConfidenceGate confidence={c}>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                              {v?.value || "—"}
                            </p>
                          </ConfidenceGate>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80">
                            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
                            {tier.label} • {pct}%
                          </span>

                          {/* Keep your existing low-confidence UI */}
                          <LowConfidenceFlag confidence={c} />
                        </div>
                      </div>

                      {/* “Why this confidence?” tooltip */}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-white/60">
                          {v?.reason || "Confidence based on extraction quality."}
                        </p>

                        <div className="relative">
                          {hovered === k && (
                            <div className="absolute right-0 top-0 translate-y-6 z-50">
                              <ConfidenceTooltip confidence={c} source={v?.source} />
                            </div>
                          )}
                          <button
                            type="button"
                            onMouseEnter={() => setHovered(k)}
                            onMouseLeave={() => setHovered(null)}
                            className="text-xs text-cyan-200/90 hover:text-cyan-200 underline underline-offset-4"
                          >
                            Why?
                          </button>
                        </div>
                      </div>

                      {/* Keep your existing AI field explanation + report + dispute tools */}
                      <div className="mt-4 space-y-3">
                        <FieldAIExplanation explanation={v?.aiExplanation} />
                        <div className="flex flex-col gap-2">
                          <ReportIncorrectAmount field={k} value={v?.value} />
                          <DisputeLetterGenerator
                            field={k}
                            value={v?.value}
                            confidence={c}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Heatmap */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Confidence Heatmap</p>
                <p className="text-xs text-white/60">
                  Quick view of extraction reliability
                </p>
              </div>
              <div className="mt-3">
                <ConfidenceHeatMap keyAmounts={keyAmounts} />
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <button
                onClick={() => setOpen(!open)}
                className="w-full p-5 sm:p-6 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-base sm:text-lg font-bold text-white">
                    Explanation
                  </p>
                  <p className="text-xs text-white/60">
                    Plain-language breakdown you can read in under a minute
                  </p>
                </div>

                <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-black/30 text-white">
                  {open ? "−" : "+"}
                </span>
              </button>

              {open && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-7">
                  {points?.length > 0 && (
                    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-semibold text-white mb-2">
                        Quick Summary
                      </p>
                      <div className="space-y-1 text-sm text-white/80">
                        {points.map((p, i) => (
                          <p key={i}>• {p}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-semibold text-white mb-2">
                      Detailed Explanation
                    </p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {explanation}
                    </p>

                    {nextSteps?.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-white mb-2">
                          Next Steps
                        </p>
                        <div className="space-y-1 text-sm text-white/80">
                          {nextSteps.map((s, i) => (
                            <p key={i}>• {s}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-[11px] text-white/50">
                    Tip: If any amount is low-confidence, compare it against your original bill
                    before paying. OCR + mixed formatting can cause misreads.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showLegend && <ConfidenceLegendModal onClose={() => setShowLegend(false)} />}
      </div>
    </div>
  );
}
