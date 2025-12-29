// src/components/ExplanationCard.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

const Chevron = ({ isOpen }) => (
  <motion.svg
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </motion.svg>
);

export default function ExplanationCard({ result, onUpgrade }) {
  const [open, setOpen] = useState(["summary"]);

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
    let y = 30;
    doc.setFontSize(28);
    doc.text("Medical Bill Review", 20, y);
    y += 20;
    doc.setFontSize(12);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 20, y);
    y += 30;

    if (structured) {
      const items = [
        ["Total Billed", keyAmounts.totalCharges || "Not detected"],
        ["Insurance Paid", keyAmounts.insurancePaid || "Not detected"],
        ["You Owe", keyAmounts.patientResponsibility || "Not detected"],
        ["Potential Savings", potentialSavings || (isPaid ? "Calculated" : "Upgrade")],
      ];
      items.forEach(([label, value]) => {
        doc.text(label + ":", 30, y);
        doc.text(value, 120, y);
        y += 15;
      });
      y += 20;
    }

    doc.setFontSize(18);
    doc.text("Explanation", 20, y);
    y += 15;
    doc.setFontSize(11);
    const exp = explanation || "Analysis complete.";
    doc.splitTextToSize(exp, 170).forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 8;
    });

    doc.save("ExplainMyBill_Report.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-7xl font-black text-center mb-16 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Your Bill Review
        </motion.h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          {[
            { label: "Total Billed", value: keyAmounts.totalCharges || "—", color: "from-cyan-500 to-blue-600" },
            { label: "Insurance Paid", value: keyAmounts.insurancePaid || "—", color: "from-emerald-500 to-teal-600" },
            { label: "You Owe", value: keyAmounts.patientResponsibility || "—", color: "from-orange-500 to-red-600" },
            { label: "Potential Savings", value: potentialSavings || (isPaid ? "Calculated" : "Upgrade"), color: "from-purple-500 to-pink-600" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.08, y: -10 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-2xl opacity-60 group-hover:opacity-90 transition duration-700`} />
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl">
                <p className="text-white/70 text-lg font-bold uppercase tracking-wider mb-4">
                  {item.label}
                </p>
                <p className="text-5xl font-black text-white">
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Accordion Sections */}
        <div className="space-y-10">
          {/* Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/90 to-indigo-900/60 border border-white/10 shadow-2xl"
          >
            <button onClick={() => toggle("explanation")} className="w-full p-10 flex justify-between items-center hover:bg-white/5 transition">
              <div className="flex items-center gap-8">
                <span className="text-5xl">📝</span>
                <h2 className="text-4xl font-bold text-white">Your Explanation</h2>
              </div>
              <Chevron isOpen={open.includes("explanation")} />
            </button>
            {open.includes("explanation") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-10 pb-12 text-white/90"
              >
                {points.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-3xl font-bold text-cyan-300 mb-8">Key Insights</h3>
                    <ul className="space-y-6 text-2xl">
                      {points.map((p, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-6"
                        >
                          <span className="text-cyan-400 text-4xl">•</span>
                          <span>{p}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-8 text-xl leading-relaxed">
                  {explanation.split("\n\n").map((para, i) => para.trim() && (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {para.trim()}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Services */}
          {services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 shadow-2xl"
            >
              <button onClick={() => toggle("services")} className="w-full p-10 flex justify-between items-center hover:bg-white/5 transition">
                <div className="flex items-center gap-8">
                  <span className="text-5xl">🩺</span>
                  <h2 className="text-4xl font-bold text-white">Services Billed</h2>
                </div>
                <Chevron isOpen={open.includes("services")} />
              </button>
              {open.includes("services") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-10 pb-12"
                >
                  <ul className="space-y-5">
                    {services.map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/5 p-6 rounded-2xl text-xl"
                      >
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-gradient-to-br from-red-900/60 to-orange-900/60 border-2 border-red-500/60 shadow-2xl shadow-red-500/30"
            >
              <button onClick={() => toggle("redflags")} className="w-full p-10 flex justify-between items-center hover:bg-red-900/20 transition">
                <div className="flex items-center gap-8">
                  <span className="text-5xl">⚠️</span>
                  <h2 className="text-4xl font-bold text-red-300">Important Alerts</h2>
                </div>
                <Chevron isOpen={open.includes("redflags")} />
              </button>
              {open.includes("redflags") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-10 pb-12"
                >
                  <ul className="space-y-6">
                    {redFlags.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-red-900/50 p-8 rounded-3xl border border-red-500/70 text-2xl"
                      >
                        <span className="font-bold text-red-300">Alert:</span> {f}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Raw Text */}
          {hasRawText && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/50 shadow-2xl"
            >
              <button onClick={() => toggle("raw")} className="w-full p-10 flex justify-between items-center hover:bg-white/5 transition">
                <div className="flex items-center gap-8">
                  <span className="text-5xl">📄</span>
                  <h2 className="text-4xl font-bold text-amber-300">Raw Bill Text</h2>
                </div>
                <Chevron isOpen={open.includes("raw")} />
              </button>
              {open.includes("raw") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-10 pb-12"
                >
                  <pre className="bg-black/40 p-8 rounded-2xl text-sm text-amber-100 whitespace-pre-wrap max-h-96 overflow-auto border border-amber-500/30">
                    {rawText}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-24">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-3xl py-10 rounded-full shadow-2xl hover:shadow-cyan-500/60 transition-all"
          >
            📄 Download Full Report
          </motion.button>

          {!isPaid && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-3xl py-10 rounded-full shadow-2xl hover:shadow-purple-500/60 transition-all"
            >
              🚀 Unlock Full Review
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
