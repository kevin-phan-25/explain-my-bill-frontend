// src/components/ExplanationCard.js
import React, { useState } from "react";
import jsPDF from "jspdf";

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

export default function ExplanationCard({ result, onUpgrade }) {
  const [openSections, setOpenSections] = useState(["main"]);

  if (!result) return null;

  const { pages = [], isPaid, explanation: topLevelExp } = result;

  // Normalize
  let structured = null;
  let aiExplanation = topLevelExp || "";
  let rawOcrText = "";

  pages.forEach((p) => {
    if (p.structured && !structured) structured = p.structured;
    if (p.explanation) aiExplanation += (aiExplanation ? "\n\n" : "") + p.explanation;
    if (p.rawText) rawOcrText += (rawOcrText ? "\n\n" : "") + p.rawText.trim();
  });

  aiExplanation = aiExplanation.trim();
  rawOcrText = rawOcrText.trim();

  const hasFullAnalysis = structured && aiExplanation;
  const hasPartial = rawOcrText.length > 50;

  const keyAmounts = structured?.keyAmounts || {};
  const summaryPoints = structured?.summaryPoints || [];

  const totalCharges = keyAmounts.totalCharges || "Not detected";
  const insurancePaid = keyAmounts.insurancePaid || "Not detected";
  const patientResponsibility = keyAmounts.patientResponsibility || "Not detected";
  const potentialSavings = structured?.potentialSavings || (isPaid ? "See full report" : "Upgrade to unlock");

  const toggle = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

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
    doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    if (structured) {
      doc.setFontSize(14);
      doc.text("Financial Summary", margin, y);
      y += 10;

      const items = [
        ["Total Billed", totalCharges],
        ["Insurance Paid", insurancePaid],
        ["You Owe", patientResponsibility],
        ["Potential Savings", potentialSavings],
      ];

      doc.setFontSize(11);
      items.forEach(([label, value]) => {
        doc.text(label + ":", margin, y);
        doc.text(value, margin + 80, y);
        y += 10;
      });
      y += 10;
    }

    doc.setFontSize(14);
    doc.text("Explanation", margin, y);
    y += 10;

    const expText = aiExplanation || (hasPartial ? "We found text in your bill and are generating a full explanation." : "No text detected.");
    doc.setFontSize(11);
    doc.splitTextToSize(expText, width - margin * 2).forEach((line) => {
      if (y > 270) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save("ExplainMyBill_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Your Medical Bill Review
          </h1>
          <p className="text-xl text-white/80">Clear, accurate, and easy to understand</p>
        </header>

        {/* Main Card */}
        <section className="bg-slate-800/90 backdrop-blur rounded-3xl overflow-hidden shadow-2xl">
          <button
            onClick={() => toggle("main")}
            className="w-full flex items-center justify-between p-8 hover:bg-slate-700/50 transition"
          >
            <div className="flex items-center gap-5">
              <span className="text-3xl">📊</span>
              <h2 className="text-3xl font-bold">Analysis Results</h2>
            </div>
            <ChevronDown isOpen={openSections.includes("main")} />
          </button>

          {openSections.includes("main") && (
            <div className="p-8 pt-0 space-y-8">
              {hasFullAnalysis ? (
                <>
                  {summaryPoints.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-300 mb-4">Key Insights</h3>
                      <ul className="space-y-3">
                        {summaryPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-4 text-lg">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span className="text-white/90">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="prose prose-invert prose-lg max-w-none">
                    {aiExplanation.split("\n\n").map((para, i) => (
                      <p key={i} className="text-white/90 leading-relaxed text-lg">
                        {para}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-blue-900/40 border border-blue-500/50 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">
                    {hasPartial ? "We read your bill!" : "Processing..."}
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    {hasPartial
                      ? "We successfully extracted text from your bill. Our AI is generating a full plain-English explanation and savings estimates."
                      : "We're analyzing your uploaded bill now."}
                  </p>
                  <p className="text-blue-200 text-base">
                    Best results come from a clear photo of the summary page.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Raw OCR Text */}
        {hasPartial && (
          <section className="bg-slate-800/60 rounded-2xl p-6">
            <button
              onClick={() => toggle("raw")}
              className="w-full flex justify-between items-center mb-4"
            >
              <h3 className="text-xl font-bold text-yellow-300">Raw Text from Your Bill</h3>
              <ChevronDown isOpen={openSections.includes("raw")} />
            </button>
            {openSections.includes("raw") && (
              <pre className="text-sm bg-slate-900/70 p-5 rounded-lg overflow-x-auto whitespace-pre-wrap text-white/80">
                {rawOcrText}
              </pre>
            )}
          </section>
        )}

        {/* PDF Download */}
        <div className="text-center">
          <button
            onClick={handlePDF}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl py-5 px-12 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition hover:scale-105"
          >
            <span className="text-2xl">📄</span>
            Download Report (PDF)
          </button>
        </div>

        {/* Upgrade */}
        {!isPaid && (
          <section className="bg-gradient-to-r from-orange-600/40 to-purple-800/40 backdrop-blur rounded-3xl p-10 text-center border border-orange-500/50 shadow-2xl">
            <h3 className="text-4xl font-black mb-6">Unlock Full AI Review</h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get red flags, savings estimates, and help writing appeal letters.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-purple-800 font-bold text-xl py-5 px-12 rounded-full shadow-2xl hover:scale-110 transition"
            >
              Upgrade Now
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
