import React, { useState } from "react";
import jsPDF from "jspdf";

// Rotating Chevron Icon
const ChevronDown = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 sm:w-8 sm:h-8 text-white transition-transform duration-500 ease-out ${
      isOpen ? "rotate-180" : ""
    }`}
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
    let y = 30;

    // Header Background
    doc.setFillColor(10, 15, 40);
    doc.rect(0, 0, pageWidth, 60, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Bill Intelligence Report", margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(100, 200, 255);
    doc.text("AI-Powered • Precision Verified • Privacy Protected", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(180, 220, 255);
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 20;

    // Financial Overview
    if (Object.keys(keyAmounts).length > 0) {
      doc.setFillColor(15, 20, 60);
      doc.roundedRect(margin - 5, y - 15, pageWidth - 2 * margin + 10, 85, 12, 12, "F");
      y += 5;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Summary", margin, y);
      y += 18;

      const amounts = [
        { label: "Total Billed Charges", value: keyAmounts.totalCharges || "Not detected", conf: confidences.totalCharges },
        { label: "Insurance Payment", value: keyAmounts.insurancePaid || "Not detected", conf: confidences.insurancePaid },
        { label: "Insurance Adjustment", value: keyAmounts.insuranceAdjusted || "Not listed", conf: null },
        { label: "Patient Responsibility", value: keyAmounts.patientResponsibility || "Not detected", conf: confidences.patientResponsibility },
      ];

      doc.setFontSize(13);
      amounts.forEach((item) => {
        const confBadge = item.conf !== undefined && item.conf !== null
          ? item.conf >= 80 ? "🟢 High" : item.conf >= 50 ? "🟡 Medium" : "🔴 Low"
          : "";

        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 220, 255);
        doc.text(`${item.label}:`, margin + 5, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text(`${item.value}`, margin + 90, y);

        if (confBadge) {
          doc.setFontSize(10);
          doc.setTextColor(item.conf >= 80 ? 100, 255, 150 : item.conf >= 50 ? 255, 255, 100 : 255, 150, 150);
          doc.text(`${confBadge} Confidence`, margin + 90, y + 8);
          doc.setFontSize(13);
        }
        y += 22;
      });
      y += 15;
    }

    // Services
    if (mainData?.services?.length > 0) {
      doc.setFillColor(20, 25, 70);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 20 + mainData.services.length * 8, 10, 10, "F");
      y += 8;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("Procedures & Services", margin, y);
      y += 12;

      doc.setFontSize(11);
      mainData.services.forEach((service) => {
        const lines = doc.splitTextToSize(service, pageWidth - 2 * margin - 20);
        doc.text(`• ${lines.join("\n  ")}`, margin + 8, y);
        y += lines.length * 7 + 5;
      });
      y += 10;
    }

    // Executive Summary
    if (mainData?.summary) {
      doc.setFillColor(25, 30, 90);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 60, 10, 10, "F");
      y += 8;

      doc.setTextColor(140, 230, 255);
      doc.setFontSize(18);
      doc.text("Executive Summary", margin, y);
      y += 12;

      doc.setFontSize(12);
      doc.setTextColor(220, 240, 255);
      const lines = doc.splitTextToSize(mainData.summary, pageWidth - 2 * margin - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 8 + 15;
    }

    // Detailed Analysis
    doc.setFillColor(12, 18, 55);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 80, 10, 10, "F");
    y += 8;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Detailed Intelligence Analysis", margin, y);
    y += 12;

    const explanationText = mainData?.explanation || fallbackExplanation || "Analysis completed successfully.";
    const expLines = doc.splitTextToSize(explanationText, pageWidth - 2 * margin - 10);
    doc.setFontSize(11);
    doc.setTextColor(200, 230, 255);
    doc.text(expLines, margin + 5, y);
    y += expLines.length * 7 + 20;

    // Critical Alerts (Paid only)
    if (isPaid && mainData?.redFlags?.length > 0) {
      doc.setFillColor(80, 15, 35);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 25 + mainData.redFlags.length * 10, 10, 10, "F");
      y += 8;

      doc.setTextColor(255, 100, 100);
      doc.setFontSize(18);
      doc.text("⚠️ Critical Findings", margin, y);
      y += 14;

      doc.setFontSize(11);
      mainData.redFlags.forEach((flag) => {
        const lines = doc.splitTextToSize(flag, pageWidth - 2 * margin - 20);
        doc.text(`• ${lines.join("\n  ")}`, margin + 8, y);
        y += lines.length * 7 + 6;
      });
      y += 10;
    }

    // Recommended Actions
    doc.setFillColor(15, 60, 50);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 80, 10, 10, "F");
    y += 8;

    doc.setTextColor(100, 255, 180);
    doc.setFontSize(18);
    doc.text("🎯 Recommended Next Steps", margin, y);
    y += 14;

    const steps = mainData?.nextSteps || [
      "Request an itemized bill from your provider",
      "Compare charges at FairHealthConsumer.org",
      "Contact your insurer with the claim number provided",
      "File an appeal if discrepancies are found — success rate is high",
    ];

    doc.setFontSize(11);
    doc.setTextColor(200, 255, 240);
    steps.forEach((step, i) => {
      const lines = doc.splitTextToSize(step, pageWidth - 2 * margin - 20);
      doc.text(`${i + 1}. ${lines.join("\n   ")}`, margin + 8, y);
      y += lines.length * 7 + 6;
    });

    // Footer
    doc.setFillColor(10, 12, 35);
    doc.rect(0, pageHeight - 40, pageWidth, 40, "F");
    doc.setTextColor(150, 200, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by ExplainMyBill • Advanced Medical Intelligence Engine", margin, pageHeight - 20);
    doc.text("This report is informational. Always verify with your provider and insurer.", margin, pageHeight - 10);

    doc.save("Medical_Bill_Intelligence_Report.pdf");
  };

  const ConfidenceBadge = ({ score }) => {
    if (score === undefined || score === null) return null;
    const color = score >= 80 ? "text-cyan-300" : score >= 50 ? "text-yellow-300" : "text-red-300";
    const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
    return (
      <span className={`text-xs font-bold ${color} bg-black/30 px-2 py-1 rounded-full`}>
        {label} Confidence
      </span>
    );
  };

  const BottomLineStrip = () => {
    const total = keyAmounts.totalCharges || "unknown amount";
    const owe = keyAmounts.patientResponsibility || "unknown amount";

    return (
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-xl border border-white/20 p-8 text-center shadow-2xl">
        <p className="text-2xl sm:text-3xl font-bold text-white leading-relaxed">
          <span className="text-cyan-200">Bottom Line:</span> You were billed{" "}
          <span className="text-red-300 font-extrabold text-3xl sm:text-4xl">{total}</span>
          {owe !== "unknown amount" && (
            <>
              {" "}and are responsible for{" "}
              <span className="text-amber-300 font-extrabold text-3xl sm:text-4xl">{owe}</span>.
            </>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-12 px-4 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            🔍 Medical Bill Intelligence Report
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-medium">
            AI-Driven • Clinically Accurate • Privacy First
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Billed Charges", value: keyAmounts.totalCharges || "Not detected", conf: confidences.totalCharges },
            { label: "Insurance Paid", value: keyAmounts.insurancePaid || "Not detected", conf: confidences.insurancePaid },
            { label: "Patient Responsibility", value: keyAmounts.patientResponsibility || "Not detected", conf: confidences.patientResponsibility },
            { label: "Potential Savings", value: isPaid ? "Analysis in progress" : "Upgrade to unlock", conf: null },
          ].map((item, i) => (
            <div
              key={i}
              className="relative group overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">{item.label}</p>
                  <ConfidenceBadge score={item.conf} />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white break-words">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BottomLineStrip />

        <div className="space-y-6 mt-12">
          {/* Key Insights */}
          <div className="rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-4 text-2xl font-bold text-white">
                <span>✅</span> Key Insights & Findings
              </span>
              <ChevronDown isOpen={openSections.includes("summary")} />
            </button>
            {openSections.includes("summary") && (
              <div className="px-8 pb-8 text-white/90 text-base leading-relaxed">
                {mainData?.summaryPoints?.length > 0 ? (
                  <ul className="space-y-4">
                    {mainData.summaryPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="text-cyan-400 text-xl mt-1">▸</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="prose prose-invert max-w-none space-y-4">
                    {fallbackExplanation.split("\n").map((para, i) => para && <p key={i}>{para}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Critical Alerts - Paid Only */}
          {isPaid && mainData?.redFlags?.length > 0 && (
            <div className="rounded-3xl backdrop-blur-2xl bg-red-900/20 border border-red-500/40 shadow-2xl shadow-red-500/20 overflow-hidden">
              <button
                onClick={() => toggleSection("redflags")}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-red-900/20 transition"
              >
                <span className="flex items-center gap-4 text-2xl font-bold text-red-300">
                  <span>⚠️</span> Critical Alerts Detected
                </span>
                <ChevronDown isOpen={openSections.includes("redflags")} />
              </button>
              {openSections.includes("redflags") && (
                <div className="px-8 pb-8">
                  <ul className="space-y-4">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="bg-red-900/30 p-5 rounded-2xl border border-red-500/50 text-white/90">
                        <span className="font-bold text-red-300">Warning:</span> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommended Actions */}
          <div className="rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
            <button
              onClick={() => toggleSection("nextsteps")}
              className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-4 text-2xl font-bold text-white">
                <span>🎯</span> Recommended Actions
              </span>
              <ChevronDown isOpen={openSections.includes("nextsteps")} />
            </button>
            {openSections.includes("nextsteps") && (
              <div className="px-8 pb-8">
                <ol className="space-y-5">
                  {(mainData?.nextSteps?.length > 0
                    ? mainData.nextSteps
                    : [
                        "Request a detailed itemized bill from your provider",
                        "Compare charges on FairHealthConsumer.org",
                        "Call your insurance using the claim number",
                        "Appeal anything that looks wrong — many succeed!",
                      ]
                  ).map((step, i) => (
                    <li key={i} className="flex items-start gap-5 bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold text-xl min-w-8">{i + 1}</span>
                      <span className="text-white/90 text-base">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center my-16">
          <button
            onClick={handleDownloadPDF}
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl py-6 px-16 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-105"
          >
            <span>📄 Download Full Intelligence Report (PDF)</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>

        {/* Upgrade CTA - Free Users */}
        {!isPaid && (
          <div className="mt-20 text-center">
            <div className="rounded-3xl backdrop-blur-2xl bg-gradient-to-r from-orange-600/30 via-red-600/30 to-purple-700/30 border border-orange-500/50 p-12 max-w-5xl mx-auto shadow-2xl">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
                Unlock Full Intelligence & Appeal Support
              </h3>
              <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
                Detect overcharges • Estimate savings • Get professional appeal letters • Win disputes
              </p>
              <button
                onClick={onUpgrade}
                className="bg-white text-purple-700 font-bold text-2xl py-6 px-20 rounded-full shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all duration-500"
              >
                Upgrade Now – Protect Your Finances
              </button>
              <p className="mt-8 text-white/70 text-lg">30-day money-back guarantee • One-time or unlimited plans</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
}