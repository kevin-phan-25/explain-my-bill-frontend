import React, { useState } from "react";
import jsPDF from "jspdf";

// Rotating Chevron Icon
const ChevronDown = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 sm:w-8 sm:h-8 text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function ExplanationCard({ result, onUpgrade }) {
  const [openSections, setOpenSections] = useState(["summary"]);

  if (!result) return null;

  const { explanation = "No explanation available", pages = [], isPaid } = result;

  // Parse structured data with robust fallback
  let mainData = null;
  let fallbackExplanation = explanation;

  if (pages.length > 0) {
    for (const p of pages) {
      if (p.structured && typeof p.structured === "object") {
        mainData = p.structured;
        break;
      }
      if (p.explanation) {
        fallbackExplanation = p.explanation;
      }
    }
  }

  // Fallback key amounts if structured data is missing
  const keyAmounts = mainData?.keyAmounts || {};
  const confidences = mainData?.confidences || {};

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 25;

    // Premium Header
    doc.setFillColor(20, 15, 60);
    doc.rect(0, 0, pageWidth, 55, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Bill Intelligence Report", margin, y);
    y += 12;

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 220, 255);
    doc.text("Precision Analysis • Confidence Verified • Secure Processing", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(180, 220, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    doc.text("Confidence: 🟢 High (80–100%)   🟡 Medium (50–79%)   🔴 Low (<50%)", margin, y + 8);
    y += 25;

    // Financial Summary
    if (keyAmounts || confidences) {
      doc.setFillColor(15, 10, 50);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 75, 10, 10, "F");
      y += 5;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Overview", margin, y);
      y += 15;

      const amounts = [
        { label: "Total Charges", value: keyAmounts.totalCharges || "Not detected", conf: confidences.totalCharges },
        { label: "Insurance Paid", value: keyAmounts.insurancePaid || "Not detected", conf: confidences.insurancePaid },
        { label: "Insurance Adjusted", value: keyAmounts.insuranceAdjusted || "Not listed", conf: null },
        { label: "Patient Responsibility", value: keyAmounts.patientResponsibility || "Not detected", conf: confidences.patientResponsibility },
      ];

      doc.setFontSize(13);
      amounts.forEach((item) => {
        const confBadge = item.conf !== undefined && item.conf !== null
          ? item.conf >= 80 ? "🟢" : item.conf >= 50 ? "🟡" : "🔴"
          : "";

        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 230, 255);
        doc.text(`${item.label}:`, margin + 5, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text(item.value, margin + 85, y);

        if (confBadge) {
          doc.setFontSize(11);
          doc.setTextColor(item.conf >= 80 ? 100, 255, 150 : item.conf >= 50 ? 255, 255, 120 : 255, 120, 120);
          doc.text(`${confBadge} ${item.conf}% Confidence`, margin + 85, y + 7);
          doc.setFontSize(13);
        }

        y += 20;
      });
      y += 10;
    }

    // Services
    if (mainData?.services?.length > 0) {
      doc.setFillColor(20, 15, 70);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 15 + mainData.services.length * 9, 8, 8, "F");
      y += 5;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Services & Procedures", margin, y);
      y += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      mainData.services.forEach((service) => {
        const lines = doc.splitTextToSize(service, pageWidth - 2 * margin - 20);
        doc.text(`• ${lines[0]}`, margin + 8, y);
        lines.slice(1).forEach(line => {
          y += 7;
          doc.text(line, margin + 12, y);
        });
        y += 9;
      });
      y += 10;
    }

    // Executive Summary
    if (mainData?.summary) {
      doc.setFillColor(25, 20, 80);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 50, 8, 8, "F");
      y += 5;

      doc.setTextColor(180, 240, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", margin, y);
      y += 12;

      doc.setFontSize(12);
      doc.setTextColor(220, 240, 255);
      const summaryLines = doc.splitTextToSize(mainData.summary, pageWidth - 2 * margin - 15);
      doc.text(summaryLines, margin + 5, y);
      y += summaryLines.length * 8 + 15;
    }

    // Detailed Explanation
    doc.setFillColor(10, 8, 50);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 90, 8, 8, "F");
    y += 5;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Analysis", margin, y);
    y += 12;

    const explanationText = mainData?.explanation || fallbackExplanation || "Analysis complete.";
    const explanationLines = doc.splitTextToSize(explanationText, pageWidth - 2 * margin - 15);
    doc.setFontSize(11);
    doc.setTextColor(200, 230, 255);
    doc.text(explanationLines, margin + 5, y);
    y += explanationLines.length * 7 + 20;

    // Critical Alerts
    if (isPaid && mainData?.redFlags?.length > 0) {
      doc.setFillColor(90, 15, 40);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 20 + mainData.redFlags.length * 10, 8, 8, "F");
      y += 5;

      doc.setTextColor(255, 120, 120);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("⚠️ Critical Alerts", margin, y);
      y += 14;

      doc.setFontSize(11);
      mainData.redFlags.forEach((flag) => {
        const flagLines = doc.splitTextToSize(flag, pageWidth - 2 * margin - 20);
        doc.text(`• ${flagLines[0]}`, margin + 8, y);
        flagLines.slice(1).forEach(line => {
          y += 7;
          doc.text(line, margin + 12, y);
        });
        y += 10;
      });
      y += 10;
    }

    // Recommended Actions
    doc.setFillColor(10, 60, 40);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 70, 8, 8, "F");
    y += 5;

    doc.setTextColor(120, 255, 180);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("🎯 Recommended Actions", margin, y);
    y += 14;

    const steps = mainData?.nextSteps || [
      "Request a detailed itemized bill from your provider",
      "Compare charges on FairHealthConsumer.org",
      "Call your insurance using the claim number",
      "Appeal anything that looks wrong — many succeed!"
    ];

    doc.setFontSize(11);
    doc.setTextColor(200, 255, 230);
    steps.forEach((step, i) => {
      const stepLines = doc.splitTextToSize(step, pageWidth - 2 * margin - 20);
      doc.text(`${i + 1}. ${stepLines[0]}`, margin + 8, y);
      stepLines.slice(1).forEach(line => {
        y += 7;
        doc.text(line, margin + 15, y);
      });
      y += 10;
    });

    // Premium Footer
    doc.setFillColor(15, 10, 60);
    doc.rect(0, pageHeight - 35, pageWidth, 35, "F");

    doc.setTextColor(150, 200, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by ExplainMyBill • Precision Intelligence Engine", margin, pageHeight - 18);
    doc.setFontSize(10);
    doc.text("This report is for informational purposes only. Always verify with your healthcare provider and insurer.", margin, pageHeight - 10);

    doc.save("Medical_Bill_Intelligence_Report.pdf");
  };

  const ConfidenceBadge = ({ score }) => {
    if (score === undefined || score === null) return null;
    const color = score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
    return <span className={`text-xs font-bold ${color}`}>Confidence: {score}%</span>;
  };

  const BottomLineStrip = () => {
    const total = keyAmounts.totalCharges || "unknown amount";
    const owe = keyAmounts.patientResponsibility || "unknown amount";

    return (
      <div className="mt-6 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-5 text-center">
        <p className="text-lg sm:text-xl font-bold text-white">
          💡 <span className="text-cyan-300">Bottom line:</span> You were charged{" "}
          <span className="text-red-300 font-extrabold">{total}</span>
          {owe !== "unknown amount" && (
            <>
              {" "}and likely owe{" "}
              <span className="text-green-300 font-extrabold">{owe}</span>.
            </>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl">🔍</span>
            Your Medical Bill Review
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80">Clear • Actionable • Precision Engineered</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          {[
            { label: "Total Charges", value: keyAmounts.totalCharges || "Not detected", conf: confidences.totalCharges },
            { label: "Insurance Paid", value: keyAmounts.insurancePaid || "Not detected", conf: confidences.insurancePaid },
            { label: "You Owe", value: keyAmounts.patientResponsibility || "Not detected", conf: confidences.patientResponsibility },
            { label: "Potential Savings", value: isPaid ? "Estimate soon" : "???", conf: null },
          ].map((item, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/30 shadow-xl hover:shadow-cyan-500/50 transition-all duration-400 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${i < 3 
                ? (i === 0 ? 'from-red-600 to-orange-600' : i === 1 ? 'from-green-600 to-emerald-600' : 'from-amber-600 to-yellow-600')
                : 'from-cyan-600 to-blue-600'} opacity-70`} />
              <div className="relative p-0.5">
                <div className="bg-white/10 backdrop-blur rounded-t-xl sm:rounded-t-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex justify-between items-center">
                  <p className="text-white/80 text-xs sm:text-xs font-semibold tracking-wide">{item.label}</p>
                  <ConfidenceBadge score={item.conf} />
                </div>
              </div>
              <div className="relative px-3 sm:px-5 py-5 sm:py-7 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg glow break-words">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BottomLineStrip />

        <div className="space-y-4 sm:space-y-5 mt-8">
          {/* What We Found */}
          <div className="rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-5 sm:px-7 py-3 sm:py-5 text-left flex items-center justify-between text-lg sm:text-xl text-white hover:text-cyan-300 transition"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">✅</span> Key Insights
              </span>
              <ChevronDown isOpen={openSections.includes("summary")} />
            </button>
            {openSections.includes("summary") && (
              <div className="px-5 sm:px-7 pb-5 sm:pb-7 text-white/90 text-sm sm:text-base leading-relaxed">
                {mainData?.summaryPoints && mainData.summaryPoints.length > 0 ? (
                  <ul className="space-y-3">
                    {mainData.summaryPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-cyan-400 text-lg mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : fallbackExplanation ? (
                  <div className="prose prose-invert max-w-none">
                    {fallbackExplanation.split("\n").map((para, i) => (
                      <p key={i} className="mb-3">{para || <br />}</p>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-white/60">
                    Your bill has been processed. Try uploading a clearer document for more detailed insights.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Critical Alerts */}
          {isPaid && mainData?.redFlags?.length > 0 && (
            <div className="rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-white/5 border border-red-500/50 shadow-2xl shadow-red-500/20 overflow-hidden">
              <button
                onClick={() => toggleSection("redflags")}
                className="w-full px-5 sm:px-7 py-3 sm:py-5 text-left flex items-center justify-between text-lg sm:text-xl text-white hover:text-red-300 transition"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">⚠️</span> Critical Alerts
                </span>
                <ChevronDown isOpen={openSections.includes("redflags")} />
              </button>
              {openSections.includes("redflags") && (
                <div className="px-5 sm:px-7 pb-5 sm:pb-7">
                  <ul className="space-y-4 text-white/90 text-sm sm:text-base">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-3 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                        <span className="text-red-400 text-lg font-bold">!</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommended Actions */}
          <div className="rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("nextsteps")}
              className="w-full px-5 sm:px-7 py-3 sm:py-5 text-left flex items-center justify-between text-lg sm:text-xl text-white hover:text-green-300 transition"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🎯</span> Recommended Actions
              </span>
              <ChevronDown isOpen={openSections.includes("nextsteps")} />
            </button>
            {openSections.includes("nextsteps") && (
              <div className="px-5 sm:px-7 pb-5 sm:pb-7">
                <ol className="space-y-4 text-white/90 text-sm sm:text-base">
                  {(mainData?.nextSteps && mainData.nextSteps.length > 0
                    ? mainData.nextSteps
                    : [
                        "Request a detailed itemized bill from your provider",
                        "Compare charges on FairHealthConsumer.org",
                        "Call your insurance using the claim number",
                        "Appeal anything that looks wrong — many succeed!"
                      ]
                  ).map((step, i) => (
                    <li key={i} className="flex items-start gap-4 bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                      <span className="text-green-400 text-lg font-bold min-w-[1.8rem]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                {!isPaid && (!mainData?.nextSteps || mainData.nextSteps.length === 0) && (
                  <p className="mt-6 text-center text-white/70 text-sm italic">
                    Upgrade for personalized, bill-specific actions and professional appeal support.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center my-10 sm:my-14">
          <button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-cyan-600 to-purple-700 text-white font-bold py-4 sm:py-5 px-10 sm:px-16 rounded-3xl shadow-2xl hover:shadow-cyan-500/70 transition-all hover:scale-105 text-lg sm:text-xl tracking-wide"
          >
            📄 Download Intelligence Report (PDF)
          </button>
        </div>

        {!isPaid && (
          <div className="mt-12 sm:mt-16 text-center">
            <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40 p-8 sm:p-12 max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                Unlock Professional Review & Appeal Support
              </h3>
              <p className="text-base sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto px-4">
                Detect hidden overcharges • Estimate savings • Receive a ready-to-send appeal letter
              </p>
              <button
                onClick={onUpgrade}
                className="bg-white text-red-600 font-bold py-5 sm:py-6 px-12 sm:px-16 rounded-2xl text-xl sm:text-2xl shadow-2xl hover:scale-110 transition-transform"
              >
                Upgrade Now – Protect Your Wallet
              </button>
              <p className="mt-8 text-white/70 text-sm sm:text-lg">30-day money-back • One-time or unlimited plans</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glow {
          text-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
        }
        .break-words {
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}