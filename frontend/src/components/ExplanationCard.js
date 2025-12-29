import React, { useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

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

  const toggle = (s) => setOpen(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 30;
    doc.setFontSize(24);
    doc.text("Your Medical Bill Review", 20, y);
    y += 30;

    ["Total Billed", "Insurance Paid", "You Owe", "Potential Savings"].forEach((label, i) => {
      const val = i === 0 ? keyAmounts.totalCharges :
                  i === 1 ? keyAmounts.insurancePaid :
                  i === 2 ? keyAmounts.patientResponsibility :
                  potentialSavings || (isPaid ? "Calculated" : "Upgrade");
      doc.text(`${label}: ${val || "—"}`, 30, y);
      y += 15;
    });

    y += 20;
    doc.setFontSize(16);
    doc.text("Explanation", 20, y);
    y += 15;
    doc.setFontSize(11);
    (explanation || "Analysis complete.").split("\n").forEach(l => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(l, 20, y);
      y += 8;
    });

    doc.save("ExplainMyBill.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-5xl md:text-6xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        Your Bill Review
      </motion.h1>

      {/* Key Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "Total Billed", value: keyAmounts.totalCharges || "—" },
          { label: "Insurance Paid", value: keyAmounts.insurancePaid || "—" },
          { label: "You Owe", value: keyAmounts.patientResponsibility || "—" },
          { label: "Potential Savings", value: potentialSavings || (isPaid ? "Calculated" : "Upgrade") },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl text-center"
          >
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-3">{item.label}</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/30 shadow-2xl"
      >
        <button onClick={() => toggle("main")} className="w-full flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Plain English Explanation</h2>
          <span className="text-2xl">{open.includes("main") ? "−" : "+"}</span>
        </button>
        {open.includes("main") && (
          <div className="space-y-6 text-lg leading-relaxed">
            {points.length > 0 && (
              <ul className="space-y-4">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-cyan-500 text-2xl">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
            <div>
              {explanation.split("\n\n").map((para, i) => para.trim() && <p key={i} className="mb-4">{para.trim()}</p>)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPDF}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-2xl py-6 rounded-3xl shadow-2xl"
        >
          📄 Download Report
        </motion.button>
        {!isPaid && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgrade}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl py-6 rounded-3xl shadow-2xl"
          >
            🚀 Unlock Full Review
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
