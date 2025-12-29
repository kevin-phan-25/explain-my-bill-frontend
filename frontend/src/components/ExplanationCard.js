// src/components/ExplanationCard.js
import React, { useState } from "react";
import jsPDF from "jspdf";

const Chevron = ({ isOpen }) => (
  <svg className={`w-6 h-6 text-white transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function ExplanationCard({ result, onUpgrade }) {
  const [open, setOpen] = useState(["main"]);

  if (!result) return null;

  const { pages = [], isPaid } = result;

  let structured = null;
  let explanation = "";
  let rawText = "";

  pages.forEach(p => {
    if (p.structured && !structured) structured = p.structured;
    if (p.explanation) explanation += (explanation ? "\n\n" : "") + p.explanation;
    if (p.rawText) rawText += (rawText ? "\n\n" : "") + p.rawText;
  });

  explanation = explanation.trim();
  rawText = rawText.trim();

  const hasAnalysis = structured || explanation.length > 50;
  const hasRawText = rawText.length > 50;

  const keyAmounts = structured?.keyAmounts || {};
  const points = structured?.summaryPoints || [];

  const toggle = (section) => {
    setOpen(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text("Medical Bill Review", 20, y);
    y += 15;
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 20;

    if (structured) {
      doc.setFontSize(16);
      doc.text("Summary", 20, y);
      y += 10;
      doc.setFontSize(12);
      const items = [
        ["Total Charges", keyAmounts.totalCharges || "Not detected"],
        ["Insurance Paid", keyAmounts.insurancePaid || "Not detected"],
        ["You Owe", keyAmounts.patientResponsibility || "Not detected"],
        ["Potential Savings", structured.potentialSavings || (isPaid ? "See report" : "Upgrade")],
      ];
      items.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 30, y);
        y += 10;
      });
      y += 10;
    }

    doc.setFontSize(16);
    doc.text("Explanation", 20, y);
    y += 10;
    doc.setFontSize(11);
    const exp = explanation || "Analysis in progress...";
    doc.splitTextToSize(exp, 170).forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 7;
    });

    doc.save("ExplainMyBill.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Your Bill Review
        </h1>

        <div className="bg-slate-800/90 rounded-3xl shadow-2xl border border-slate-700">
          <button onClick={() => toggle("main")} className="w-full p-8 flex justify-between items-center hover:bg-slate-700/50 transition">
            <div className="flex items-center gap-6">
              <span className="text-4xl">📊</span>
              <h2 className="text-3xl font-bold">Analysis</h2>
            </div>
            <Chevron isOpen={open.includes("main")} />
          </button>

          {open.includes("main") && (
            <div className="p-8 pt-0">
              {hasAnalysis ? (
                <>
                  {points.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-4">Key Insights</h3>
                      <ul className="space-y-3 text-xl">
                        {points.map((p, i) => (
                          <li key={i} className="flex gap-4">
                            <span className="text-cyan-400">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-lg leading-relaxed text-white/90 space-y-6">
                    {explanation.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                </>
              ) : (
                <div className="bg-blue-900/40 border border-blue-500/50 rounded-2xl p-10 text-center">
                  <h3 className="text-3xl font-bold text-blue-300 mb-6">
                    {hasRawText ? "We found your bill text!" : "Processing..."}
                  </h3>
                  <p className="text-xl text-white/90">
                    {hasRawText 
                      ? "Our AI is generating your full explanation and savings estimate."
                      : "Analyzing your bill now..."}
                  </p>
                  <p className="text-blue-200 mt-6">
                    Best results: Clear photo of summary page
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {hasRawText && (
          <div className="bg-slate-800/60 rounded-3xl p-8">
            <button onClick={() => toggle("raw")} className="w-full flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-yellow-300">Raw Bill Text</h3>
              <Chevron isOpen={open.includes("raw")} />
            </button>
            {open.includes("raw") && (
              <pre className="text-sm bg-slate-900/70 p-6 rounded-2xl overflow-x-auto whitespace-pre-wrap text-white/80">
                {rawText}
              </pre>
            )}
          </div>
        )}

        <div className="text-center">
          <button onClick={downloadPDF} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-2xl py-6 px-16 rounded-full shadow-2xl hover:scale-105 transition">
            Download PDF Report
          </button>
        </div>

        {!isPaid && (
          <div className="bg-gradient-to-r from-orange-600/50 to-purple-800/50 rounded-3xl p-12 text-center border border-orange-500/50">
            <h3 className="text-4xl font-black mb-6">Unlock Full Review</h3>
            <p className="text-2xl mb-8">Get savings estimates & appeal help</p>
            <button onClick={onUpgrade} className="bg-white text-purple-800 font-black text-2xl py-6 px-16 rounded-full shadow-2xl hover:scale-110 transition">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
