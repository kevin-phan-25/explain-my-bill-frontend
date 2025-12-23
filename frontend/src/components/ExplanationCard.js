import React, { useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onUpgrade, onUseSample }) {
  if (!result) return null;

  const { explanation, pages = [], isPaid } = result;
  const [openSections, setOpenSections] = useState(["summary"]);

  // Try to parse structured data (from new backend)
  const structuredPages = pages
    .map((p) => {
      try {
        return typeof p.structured === "object" ? p.structured : JSON.parse(p.explanation || "{}");
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const hasStructured = structuredPages.length > 0;
  const mainData = hasStructured ? structuredPages[0] : null;

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const text = explanation || "Medical Bill Explanation";
    doc.text(text, 15, 15);
    doc.save("Medical_Bill_Explanation.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            🔍 Your Medical Bill Review
          </h1>
          <p className="text-lg md:text-xl text-white/80">AI-powered • Clear • Actionable</p>
        </div>

        {/* Key Metrics Grid */}
        {mainData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Charges", value: mainData.keyAmounts?.totalCharges || "N/A", gradient: "from-red-500 to-orange-500" },
              { label: "Insurance Paid", value: mainData.keyAmounts?.insurancePaid || "N/A", gradient: "from-green-500 to-emerald-500" },
              { label: "You Owe", value: mainData.keyAmounts?.patientResponsibility || "N/A", gradient: "from-yellow-500 to-amber-500" },
              { label: "Potential Savings", value: isPaid ? "Estimated soon" : "???", gradient: "from-blue-500 to-cyan-500" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-105"
              >
                <div className={`bg-gradient-to-r ${item.gradient} p-1 rounded-t-2xl`}>
                  <div className="bg-black/40 rounded-t-2xl px-6 py-3">
                    <p className="text-white/70 text-sm font-medium">{item.label}</p>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg glow">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accordion Sections */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-8 py-6 text-left flex items-center justify-between text-2xl text-white hover:text-cyan-300 transition"
            >
              <span className="flex items-center gap-4">
                <span className="text-4xl">✅</span> What We Found
              </span>
              <span className={`text-3xl transition-transform ${openSections.includes("summary") ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {openSections.includes("summary") && (
              <div className="px-8 pb-8 text-white/90 text-lg leading-relaxed">
                {hasStructured ? (
                  <>
                    <p className="mb-6">{mainData.summary}</p>
                    {mainData.services?.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {mainData.services.map((s, i) => (
                          <span key={i} className="px-4 py-2 bg-white/20 rounded-full text-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none">{mainData.explanation}</div>
                  </>
                ) : (
                  <p>{explanation || "Loading your bill analysis..."}</p>
                )}
              </div>
            )}
          </div>

          {/* Red Flags - Paid only */}
          {isPaid && mainData?.redFlags?.length > 0 && (
            <div className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
              <button
                onClick={() => toggleSection("redflags")}
                className="w-full px-8 py-6 text-left flex items-center justify-between text-2xl text-white hover:text-red-400 transition"
              >
                <span className="flex items-center gap-4">
                  <span className="text-4xl">⚠️</span> Potential Issues Detected
                </span>
                <span className={`text-3xl transition-transform ${openSections.includes("redflags") ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {openSections.includes("redflags") && (
                <div className="px-8 pb-8">
                  <ul className="space-y-4 text-white/90 text-lg">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="text-red-400 text-2xl mt-1">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("nextsteps")}
              className="w-full px-8 py-6 text-left flex items-center justify-between text-2xl text-white hover:text-green-400 transition"
            >
              <span className="flex items-center gap-4">
                <span className="text-4xl">🎯</span> Recommended Next Steps
              </span>
              <span className={`text-3xl transition-transform ${openSections.includes("nextsteps") ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {openSections.includes("nextsteps") && (
              <div className="px-8 pb-8">
                <ol className="space-y-5 text-white/90 text-lg">
                  {(hasStructured ? mainData.nextSteps : [
                    "Request a detailed itemized bill from your provider",
                    "Compare charges on FairHealthConsumer.org",
                    "Call your insurance using the claim number",
                    "Appeal anything that looks wrong — many succeed!"
                  ]).map((step, i) => (
                    <li key={i} className="flex items-start gap-5">
                      <span className="text-green-400 text-2xl font-bold min-w-[2rem]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center my-12">
          <button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-cyan-500/60 transition-all hover:scale-105 text-xl"
          >
            Download Full Report as PDF
          </button>
        </div>

        {/* Upgrade CTA for free users */}
        {!isPaid && (
          <div className="mt-16 text-center">
            <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40 p-10 max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Unlock Expert Review & Appeal Tools
              </h3>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Spot hidden overcharges • Estimate savings • Get a ready-to-send appeal letter
              </p>
              <button
                onClick={onUpgrade}
                className="bg-white text-red-600 font-bold py-6 px-16 rounded-2xl text-2xl shadow-2xl hover:scale-110 transition-transform"
              >
                Upgrade Now – Save Money Today
              </button>
              <p className="mt-8 text-white/70 text-lg">30-day money-back • One-time or unlimited plans</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glow {
          text-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
