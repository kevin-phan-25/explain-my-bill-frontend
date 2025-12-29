import React, { useState } from "react";
import jsPDF from "jspdf";

const Chevron = ({ isOpen }) => (
  <svg className={`w-5 h-5 text-white transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    if (p.explanation) explanation += (explanation ? "\n\n" : "") + p.explanation.trim();
    if (p.rawText) rawText += (rawText ? "\n\n" : "") + p.rawText.trim();
  });

  const keyAmounts = structured?.keyAmounts || {};
  const points = structured?.summaryPoints || [];
  const services = structured?.services || [];
  const redFlags = structured?.redFlags || [];
  const potentialSavings = structured?.potentialSavings;

  const hasText = explanation.length > 20 || rawText.length > 50;

  const toggle = (sec) => setOpen(prev => prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text("Bill Review", 20, y);
    y += 20;

    if (structured) {
      ["Total Billed", "Insurance Paid", "You Owe", "Potential Savings"].forEach((label, i) => {
        const value = i === 0 ? keyAmounts.totalCharges :
                      i === 1 ? keyAmounts.insurancePaid :
                      i === 2 ? keyAmounts.patientResponsibility :
                      potentialSavings || (isPaid ? "Calculated" : "Upgrade");
        doc.text(`${label}: ${value || "—"}`, 30, y);
        y += 12;
      });
      y += 20;
    }

    doc.setFontSize(16);
    doc.text("Explanation", 20, y);
    y += 12;
    doc.setFontSize(11);
    (explanation || rawText || "Analysis complete.").split("\n").forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 8;
    });

    doc.save("ExplainMyBill.pdf");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center text-blue-900">Your Bill Review</h1>

      {/* Key Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Billed", value: keyAmounts.totalCharges || "—" },
          { label: "Insurance Paid", value: keyAmounts.insurancePaid || "—" },
          { label: "You Owe", value: keyAmounts.patientResponsibility || "—" },
          { label: "Savings", value: potentialSavings || (isPaid ? "Calculated" : "Upgrade") },
        ].map((item, i) => (
          <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 text-center shadow">
            <p className="text-sm font-medium text-blue-700">{item.label}</p>
            <p className="text-3xl font-black text-blue-900 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button onClick={() => toggle("main")} className="w-full flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Explanation</h2>
          <Chevron isOpen={open.includes("main")} />
        </button>
        {open.includes("main") && (
          <div className="space-y-4 text-lg">
            {points.length > 0 && (
              <ul className="space-y-3">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-blue-600">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="prose max-w-none">
              {(explanation || rawText || "Analysis complete.").split("\n\n").map((p, i) => p.trim() && <p key={i}>{p.trim()}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* Services & Red Flags (compact) */}
      {services.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-bold text-xl mb-3">Services</h3>
          <ul className="space-y-2">
            {services.map((s, i) => <li key={i} className="text-gray-700">• {s}</li>)}
          </ul>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-6">
          <h3 className="font-bold text-xl text-red-800 mb-3">Alerts</h3>
          <ul className="space-y-2">
            {redFlags.map((f, i) => <li key={i} className="text-red-700">• {f}</li>)}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={downloadPDF} className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
          Download Report
        </button>
        {!isPaid && (
          <button onClick={onUpgrade} className="flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition">
            Unlock Full Review
          </button>
        )}
      </div>
    </div>
  );
}
