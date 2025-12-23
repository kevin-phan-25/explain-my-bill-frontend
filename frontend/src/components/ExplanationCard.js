import React, { useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onUpgrade }) {
  // All hooks at the top — required by React rules
  const [openSections, setOpenSections] = useState(["summary"]);

  if (!result) return null;

  const { explanation, pages = [], isPaid } = result;

  // Parse structured data from backend
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

  // Toggle accordion sections — NOW USED
  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Professional PDF download — NOW USED
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 120);
    doc.text("Your Medical Bill Review", margin, y);
    y += 12;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} • Dual AI Analysis`, margin, y);
    y += 15;

    if (mainData?.keyAmounts) {
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 80);
      doc.text("Key Financial Summary", margin, y);
      y += 10;

      const amounts = [
        { label: "Total Charges", value: mainData.keyAmounts.totalCharges || "Not specified" },
        { label: "Insurance Paid", value: mainData.keyAmounts.insurancePaid || "Not specified" },
        { label: "Insurance Adjusted", value: mainData.keyAmounts.insuranceAdjusted || "Not specified" },
        { label: "Patient Responsibility", value: mainData.keyAmounts.patientResponsibility || "Not specified" },
      ];

      doc.setFontSize(12);
      doc.setTextColor(0);
      amounts.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${item.label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(item.value, margin + 70, y);
        y += 10;
      });
      y += 8;
    }

    if (mainData?.services?.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 80);
      doc.text("Services Provided", margin, y);
      y += 10;
      doc.setFontSize(11);
      mainData.services.forEach((service) => {
        doc.text(`• ${service}`, margin + 5, y);
        y += 8;
      });
      y += 8;
    }

    if (mainData?.summary) {
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 80);
      doc.text("Summary", margin, y);
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(50);
      const summaryLines = doc.splitTextToSize(mainData.summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 7 + 10;
    }

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 80);
    doc.text("Detailed Explanation", margin, y);
    y += 10;

    const explanationText = mainData?.explanation || explanation || "No detailed explanation available.";
    const lines = doc.splitTextToSize(explanationText, pageWidth - 2 * margin);
    doc.setFontSize(11);
    doc.setTextColor(70);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 15;

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 80);
    doc.text("Recommended Next Steps", margin, y);
    y += 10;

    const steps = hasStructured
      ? mainData.nextSteps
      : [
          "Request a detailed itemized bill from your provider",
          "Compare charges on FairHealthConsumer.org",
          "Call your insurance using the claim number",
          "Appeal anything that looks wrong — many succeed!",
        ];

    doc.setFontSize(11);
    steps.forEach((step, i) => {
      doc.text(`${i + 1}. ${step}`, margin + 5, y);
      y += 8;
    });

    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("This report is for informational purposes only. Always verify with your provider and insurer.", margin, y);

    doc.save("Medical_Bill_Review_Report.pdf");
  };

  // Confidence badge
  const ConfidenceBadge = ({ score }) => {
    if (score === undefined || score === null) return null;
    const color = score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
    return <span className={`text-xs font-bold ${color}`}>Confidence: {score}%</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl">Search</span>
            Your Medical Bill Review
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80">Clear • Actionable • Dual AI Powered</p>
        </div>

        {/* Key Metrics with Confidence */}
        {mainData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
            {[
              { label: "Total Charges", value: mainData.keyAmounts?.totalCharges || "N/A", conf: mainData.confidences?.totalCharges },
              { label: "Insurance Paid", value: mainData.keyAmounts?.insurancePaid || "N/A", conf: mainData.confidences?.insurancePaid },
              { label: "You Owe", value: mainData.keyAmounts?.patientResponsibility || "N/A", conf: mainData.confidences?.patientResponsibility },
              { label: "Potential Savings", value: isPaid ? "Estimate soon" : "???", conf: null },
            ].map((item, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/10 border border-white/30 shadow-2xl hover:shadow-cyan-500/60 transition-all duration-500 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${i < 3 ? ['from-red-600 to-orange-600', 'from-green-600 to-emerald-600', 'from-amber-600 to-yellow-600'][i] : 'from-cyan-600 to-blue-600'} opacity-70`} />
                <div className="relative p-1">
                  <div className="bg-white/10 backdrop-blur rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center">
                    <p className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide">{item.label}</p>
                    <ConfidenceBadge score={item.conf} />
                  </div>
                </div>
                <div className="relative px-4 sm:px-6 py-6 sm:py-10 text-center">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-2xl glow break-all">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accordion Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Summary */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between text-xl sm:text-2xl text-white hover:text-cyan-300 transition"
            >
              <span className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl">Check</span> What We Found
              </span>
              <span className={`text-2xl sm:text-3xl transition-transform ${openSections.includes("summary") ? "rotate-180" : ""}`}>
                Down Arrow
              </span>
            </button>
            {openSections.includes("summary") && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-white/90 text-base sm:text-lg leading-relaxed">
                {hasStructured ? (
                  <>
                    <p className="mb-4 sm:mb-6 font-medium">{mainData.summary}</p>
                    {mainData.services?.length > 0 && (
                      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {mainData.services.map((s, i) => (
                          <span key={i} className="px-4 sm:px-5 py-2 sm:py-3 bg-white/20 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none text-white/90">
                      {mainData.explanation.split("\n").map((para, i) => (
                        <p key={i} className="mb-3 sm:mb-4">{para || <br />}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>{explanation || "Analyzing your bill..."}</p>
                )}
              </div>
            )}
          </div>

          {/* Red Flags */}
          {isPaid && mainData?.redFlags?.length > 0 && (
            <div className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
              <button
                onClick={() => toggleSection("redflags")}
                className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between text-xl sm:text-2xl text-white hover:text-red-400 transition"
              >
                <span className="flex items-center gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl">Warning</span> Potential Issues Detected
                </span>
                <span className={`text-2xl sm:text-3xl transition-transform ${openSections.includes("redflags") ? "rotate-180" : ""}`}>
                  Down Arrow
                </span>
              </button>
              {openSections.includes("redflags") && (
                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                  <ul className="space-y-3 sm:space-y-4 text-white/90 text-base sm:text-lg">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-3 sm:gap-4">
                        <span className="text-red-400 text-xl sm:text-2xl mt-1">•</span>
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
              className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between text-xl sm:text-2xl text-white hover:text-green-400 transition"
            >
              <span className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl">Target</span> Recommended Next Steps
              </span>
              <span className={`text-2xl sm:text-3xl transition-transform ${openSections.includes("nextsteps") ? "rotate-180" : ""}`}>
                Down Arrow
              </span>
            </button>
            {openSections.includes("nextsteps") && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <ol className="space-y-4 sm:space-y-5 text-white/90 text-base sm:text-lg">
                  {(hasStructured ? mainData.nextSteps : [
                    "Request a detailed itemized bill from your provider",
                    "Compare charges on FairHealthConsumer.org",
                    "Call your insurance using the claim number",
                    "Appeal anything that looks wrong — many succeed!"
                  ]).map((step, i) => (
                    <li key={i} className="flex items-start gap-4 sm:gap-5">
                      <span className="text-green-400 text-xl sm:text-2xl font-bold min-w-[2rem]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center my-10 sm:my-16">
          <button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-cyan-600 to-purple-700 text-white font-bold py-4 sm:py-6 px-10 sm:px-16 rounded-3xl shadow-2xl hover:shadow-cyan-500/70 transition-all hover:scale-105 text-lg sm:text-2xl tracking-wide"
          >
            Document Download Professional Report (PDF)
          </button>
        </div>

        {/* Upgrade CTA */}
        {!isPaid && (
          <div className="mt-12 sm:mt-16 text-center">
            <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40 p-8 sm:p-12 max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                Unlock Expert Review & Appeal Tools
              </h3>
              <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
                Spot hidden overcharges • Estimate savings • Get a ready-to-send appeal letter
              </p>
              <button
                onClick={onUpgrade}
                className="bg-white text-red-600 font-bold py-5 sm:py-6 px-12 sm:px-16 rounded-2xl text-xl sm:text-2xl shadow-2xl hover:scale-110 transition-transform"
              >
                Upgrade Now – Save Money Today
              </button>
              <p className="mt-6 sm:mt-8 text-white/70 text-sm sm:text-lg">30-day money-back • One-time or unlimited plans</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glow {
          text-shadow: 0 0 40px rgba(0, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}
