// src/components/ExplanationCard.js
import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Chevron = ({ isOpen }) => (
  <svg className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function ExplanationCard({ result, onUpgrade }) {
  const [open, setOpen] = useState(["summary", "explanation"]);

  if (!result) return null;

  const { pages = [], isPaid } = result;

  // Normalize
  let structured = null;
  let explanation = "";
  let rawText = "";

  pages.forEach(p => {
    if (p.structured && !structured) structured = p.structured;
    if (p.explanation) explanation += (explanation ? "\n\n" : "") + p.explanation.trim();
    if (p.rawText) rawText += (rawText ? "\n\n" : "") + p.rawText.trim();
  });

  explanation = explanation.trim();
  rawText = rawText.trim();

  const keyAmounts = structured?.keyAmounts || {};
  const points = structured?.summaryPoints || [];
  const services = structured?.services || [];
  const redFlags = structured?.redFlags || [];
  const potentialSavings = structured?.potentialSavings;

  const hasAnalysis = structured || explanation.length > 20;
  const hasRawText = rawText.length > 50;

  const toggle = (section) => {
    setOpen(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFillColor(10, 15, 40);
    doc.rect(0, 0, 210, 60, "F");
    doc.setTextColor(255);
    doc.setFontSize(28);
    doc.text("Your Medical Bill Review", 20, y + 20);
    doc.setFontSize(12);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 20, y + 35);

    y = 80;

    doc.autoTable({
      startY: y,
      head: [["Category", "Amount"]],
      body: [
        ["Total Billed", keyAmounts.totalCharges || "Not detected"],
        ["Insurance Paid", keyAmounts.insurancePaid || "Not detected"],
        ["You Owe", keyAmounts.patientResponsibility || "Not detected"],
        ["Potential Savings", potentialSavings || (isPaid ? "Calculated" : "Upgrade to view")],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 60, 120] },
    });

    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(16);
    doc.text("Explanation", 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.splitTextToSize(explanation || "Analysis complete.", 170).forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 7;
    });

    doc.save("ExplainMyBill_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 py-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 mb-6">
            Your Bill Review
          </h1>
          <p className="text-2xl text-white/80 font-light">
            Clear • Accurate • Actionable
          </p>
        </div>

        {/* Key Financial Summary – Front and Center */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: "Total Billed", value: keyAmounts.totalCharges || "Not detected", color: "from-blue-600 to-cyan-500" },
            { label: "Insurance Paid", value: keyAmounts.insurancePaid || "Not detected", color: "from-green-600 to-emerald-500" },
            { label: "You Owe", value: keyAmounts.patientResponsibility || "Not detected", color: "from-orange-600 to-red-500" },
            { label: "Potential Savings", value: potentialSavings || (isPaid ? "Calculated" : "Upgrade to view"), color: "from-purple-600 to-pink-500" },
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 blur-xl group-hover:opacity-100 transition duration-700`} />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-4">
                  {item.label}
                </p>
                <p className="text-4xl md:text-5xl font-black text-white break-words">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Accordion */}
        <div className="space-y-8">

          {/* Explanation */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 to-indigo-900/50">
            <button onClick={() => toggle("explanation")} className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition">
              <div className="flex items-center gap-6">
                <span className="text-4xl">📝</span>
                <h2 className="text-3xl font-bold text-white">Plain English Explanation</h2>
              </div>
              <Chevron isOpen={open.includes("explanation")} />
            </button>
            {open.includes("explanation") && (
              <div className="p-8 pt-0 text-white/90">
                {points.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-6">Key Takeaways</h3>
                    <ul className="space-y-4 text-xl">
                      {points.map((p, i) => (
                        <li key={i} className="flex gap-5">
                          <span className="text-cyan-400 text-3xl">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-6 text-lg leading-relaxed">
                  {explanation.split("\n\n").map((para, i) => para.trim() && <p key={i}>{para.trim()}</p>)}
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 shadow-2xl">
              <button onClick={() => toggle("services")} className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition">
                <div className="flex items-center gap-6">
                  <span className="text-4xl">🩺</span>
                  <h2 className="text-3xl font-bold text-white">Services Billed</h2>
                </div>
                <Chevron isOpen={open.includes("services")} />
              </button>
              {open.includes("services") && (
                <div className="p-8 pt-0">
                  <ul className="space-y-4">
                    {services.map((s, i) => (
                      <li key={i} className="bg-white/5 p-5 rounded-xl text-lg">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-red-900/60 to-orange-900/60 border-2 border-red-500/60 shadow-2xl shadow-red-500/30">
              <button onClick={() => toggle("redflags")} className="w-full p-8 flex justify-between items-center hover:bg-red-900/20 transition">
                <div className="flex items-center gap-6">
                  <span className="text-4xl">⚠️</span>
                  <h2 className="text-3xl font-bold text-red-300">Important Alerts</h2>
                </div>
                <Chevron isOpen={open.includes("redflags")} />
              </button>
              {open.includes("redflags") && (
                <div className="p-8 pt-0">
                  <ul className="space-y-5">
                    {redFlags.map((f, i) => (
                      <li key={i} className="bg-red-900/50 p-6 rounded-2xl border border-red-500/70 text-xl">
                        <span className="font-bold text-red-300">Alert:</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 shadow-2xl">
            <button onClick={() => toggle("next")} className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition">
              <div className="flex items-center gap-6">
                <span className="text-4xl">🎯</span>
                <h2 className="text-3xl font-bold text-white">What To Do Next</h2>
              </div>
              <Chevron isOpen={open.includes("next")} />
            </button>
            {open.includes("next") && (
              <div className="p-8 pt-0">
                <ol className="space-y-6">
                  {(structured?.nextSteps?.length > 0 ? structured.nextSteps : [
                    "Request an itemized bill from your provider",
                    "Compare charges on FairHealthConsumer.org",
                    "Call your insurance with the claim number",
                    "Appeal anything that looks wrong — many succeed",
                  ]).map((step, i) => (
                    <li key={i} className="flex gap-6 bg-white/5 p-6 rounded-2xl border border-purple-500/30">
                      <span className="font-black text-purple-400 text-3xl">{i + 1}</span>
                      <span className="text-xl text-white/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          <button onClick={downloadPDF} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-2xl py-8 rounded-full shadow-2xl hover:scale-105 transition">
            📄 Download Report
          </button>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-2xl py-8 rounded-full shadow-2xl hover:scale-105 transition">
            ✉️ Generate Appeal Letter
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-2xl py-8 rounded-full shadow-2xl hover:scale-105 transition">
            📊 Export Data
          </button>
        </div>

        {/* Upgrade */}
        {!isPaid && (
          <div className="text-center my-24">
            <div className="inline-block bg-gradient-to-r from-orange-600/60 via-red-600/60 to-purple-800/60 backdrop-blur-2xl rounded-3xl p-16 border-4 border-orange-500/70 shadow-2xl shadow-orange-500/40">
              <h3 className="text-5xl font-black text-white mb-8">
                Unlock Full Power
              </h3>
              <p className="text-2xl text-white/90 mb-12 max-w-2xl">
                Instant red flags • Precise savings • Appeal letter generator
              </p>
              <button onClick={onUpgrade} className="bg-white text-purple-800 font-black text-3xl py-8 px-24 rounded-full shadow-2xl hover:scale-110 transition">
                Upgrade Now
              </button>
              <p className="mt-8 text-white/70 text-xl">30-day money-back • One-time or unlimited</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
