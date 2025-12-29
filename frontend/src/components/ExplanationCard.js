import React, { useState } from "react";
import jsPDF from "jspdf";

/* ================= Chevron ================= */
const ChevronDown = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ================= Component ================= */
export default function ExplanationCard({ result, onUpgrade }) {
  const [openSections, setOpenSections] = useState(["explanation"]);

  if (!result) return null;

  const { pages = [], isPaid, explanation: topLevelExplanation } = result;

  // Normalize data from pages
  let structured = null;
  let aiExplanation = topLevelExplanation || "";
  let rawOcrText = "";

  pages.forEach((page) => {
    if (page.structured && !structured) {
      structured = page.structured;
    }
    if (page.explanation) {
      aiExplanation += (aiExplanation ? "\n\n" : "") + page.explanation;
    }
    if (page.rawText) {
      rawOcrText += (rawOcrText ? "\n\n" : "") + page.rawText.trim();
    }
  });

  aiExplanation = aiExplanation.trim();
  rawOcrText = rawOcrText.trim();

  const hasAiAnalysis = structured || aiExplanation;
  const hasOcrText = rawOcrText.length > 50;

  const keyAmounts = structured?.keyAmounts || {};
  const summaryPoints = structured?.summaryPoints || [];

  const totalCharges = keyAmounts.totalCharges || "Not detected";
  const insurancePaid = keyAmounts.insurancePaid || "Not detected";
  const patientResponsibility = keyAmounts.patientResponsibility || "Not detected";
  const potentialSavings = structured?.potentialSavings || (isPaid ? "Included in full report" : "Upgrade to view");

  /* ================= Toggle Section ================= */
  const toggle = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  /* ================= PDF Download ================= */
  const handlePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const width = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Medical Bill Review Report", margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    // Key Amounts
    if (structured) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Summary", margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const items = [
        ["Total Billed Charges", totalCharges],
        ["Insurance Paid", insurancePaid],
        ["Patient Responsibility", patientResponsibility],
        ["Potential Savings", potentialSavings],
      ];

      items.forEach(([label, value]) => {
        doc.text(`${label}:`, margin, y);
        doc.text(value, margin + 80, y);
        y += 10;
      });
      y += 10;
    }

    // Explanation
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Explanation", margin, y);
    y += 10;

    const explanationText = aiExplanation || "Analysis in progress. We detected text from your bill and are generating a full explanation.";
    const lines = doc.splitTextToSize(explanationText, width - margin * 2);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    // Raw OCR (optional, for transparency)
    if (hasOcrText && rawOcrText.length < 5000) { // limit size
      y += 15;
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Raw Text from Bill (for reference)", margin, y);
      y += 10;
      doc.setFontSize(9);
      const ocrLines = doc.splitTextToSize(rawOcrText, width - margin * 2);
      ocrLines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 30;
        }
        doc.text(line, margin, y);
        y += 5;
      });
    }

    doc.save("ExplainMyBill_Report.pdf");
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Medical Bill Review
          </h1>
          <p className="text-xl text-white/80">Clear, Accurate, and Easy to Understand</p>
        </header>

        {/* Main Explanation Section */}
        <section className="bg-slate-800/80 backdrop-blur rounded-2xl overflow-hidden shadow-2xl">
          <button
            onClick={() => toggle("explanation")}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">📄</span>
              <h2 className="text-2xl font-bold">Your Bill Explanation</h2>
            </div>
            <ChevronDown isOpen={openSections.includes("explanation")} />
          </button>

          {openSections.includes("explanation") && (
            <div className="p-6 pt-0 space-y-6">
              {hasAiAnalysis ? (
                <>
                  {summaryPoints.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-cyan-300 mb-3">Key Insights</h3>
                      <ul className="space-y-2">
                        {summaryPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    {aiExplanation.split("\n\n").map((para, i) => (
                      <p key={i} className="text-white/90 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">
                    {hasOcrText ? "We found text in your bill!" : "Processing your bill..."}
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {hasOcrText
                      ? "We successfully read text from your uploaded bill. Our AI is generating a full plain-English explanation, key insights, and savings estimates."
                      : "We're analyzing your bill now. This usually takes just a few seconds."}
                  </p>
                  <p className="text-blue-200 mt-4">
                    Tip: For fastest and most accurate results, upload a clear photo of the summary page.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Raw OCR Text (optional, helpful for transparency) */}
        {hasOcrText && openSections.includes("raw") && (
          <section className="bg-slate-800/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-yellow-300 mb-3">Raw Text from Your Bill</h3>
            <pre className="text-sm text-white/70 bg-slate-900/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {rawOcrText}
            </pre>
          </section>
        )}

        {/* Toggle Raw OCR */}
        {hasOcrText && (
          <div className="text-center">
            <button
              onClick={() => toggle("raw")}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {openSections.includes("raw") ? "Hide" : "Show"} raw text from bill
            </button>
          </div>
        )}

        {/* Download PDF */}
        <div className="text-center">
          <button
            onClick={handlePDF}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl py-4 px-10 rounded-full shadow-xl hover:shadow-cyan-500/50 transition transform hover:scale-105"
          >
            <span>📄</span>
            Download Full Report (PDF)
          </button>
        </div>

        {/* Upgrade CTA */}
        {!isPaid && (
          <section className="bg-gradient-to-r from-orange-600/40 to-purple-800/40 backdrop-blur rounded-2xl p-8 text-center border border-orange-500/50 shadow-2xl">
            <h3 className="text-3xl font-black mb-4">
              Unlock Instant Full Review & Savings Tools
            </h3>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Get detailed red flags, personalized appeal letter help, and accurate savings estimates.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-purple-800 font-bold text-xl py-4 px-10 rounded-full shadow-lg hover:scale-110 transition"
            >
              Upgrade Now – Save Money
            </button>
            <p className="mt-4 text-white/70">
              30-day money-back guarantee • One-time or monthly plans
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
