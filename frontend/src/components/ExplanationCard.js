import React, { useState } from "react";
import jsPDF from "jspdf";

// Rotating Chevron Icon (smaller)
const ChevronDown = ({ isOpen }) => (
  <svg
    className={`w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-500 ease-out ${
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

  // Potential Savings logic
  const potentialSavingsValue = mainData?.potentialSavings 
    ? mainData.potentialSavings 
    : isPaid 
      ? "Calculated in full report" 
      : "Upgrade to unlock";

  const metrics = [
    {
      label: "Total Billed Charges",
      value: keyAmounts.totalCharges || "Not detected",
      conf: confidences.totalCharges,
    },
    {
      label: "Insurance Paid",
      value: keyAmounts.insurancePaid || "Not detected",
      conf: confidences.insurancePaid,
    },
    {
      label: "Patient Responsibility",
      value: keyAmounts.patientResponsibility || "Not detected",
      conf: confidences.patientResponsibility,
    },
    {
      label: "Potential Savings",
      value: potentialSavingsValue,
      conf: null,
    },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    doc.setFillColor(15, 25, 60);
    doc.rect(0, 0, pageWidth, 60, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Bill Review Report", margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(130, 200, 255);
    doc.text("Clear • Accurate • Patient-Focused", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(180, 220, 255);
    doc.text(
      `Report Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      margin,
      y
    );
    y += 20;

    if (Object.keys(keyAmounts).length > 0) {
      doc.setFillColor(20, 35, 80);
      doc.roundedRect(margin - 5, y - 15, pageWidth - 2 * margin + 10, 90, 12, 12, "F");
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
        { label: "Your Responsibility", value: keyAmounts.patientResponsibility || "Not detected", conf: confidences.patientResponsibility },
      ];

      doc.setFontSize(13);
      amounts.forEach((item) => {
        const confText = item.conf !== undefined && item.conf !== null
          ? item.conf >= 80 ? "High Confidence" : item.conf >= 50 ? "Medium Confidence" : "Low Confidence"
          : "";

        doc.setFont("helvetica", "bold");
        doc.setTextColor(140, 220, 255);
        doc.text(`${item.label}:`, margin + 5, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text(`${item.value}`, margin + 95, y);

        if (confText) {
          doc.setFontSize(10);
          doc.setTextColor(180, 240, 255);
          doc.text(confText, margin + 95, y + 8);
          doc.setFontSize(13);
        }
        y += 24;
      });
      y += 10;
    }

    doc.setFillColor(25, 60, 100);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 35, 10, 10, "F");
    y += 8;

    doc.setTextColor(120, 255, 200);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Potential Savings", margin, y);
    y += 12;

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(potentialSavingsValue, margin + 5, y);
    y += 20;

    if (mainData?.services?.length > 0) {
      doc.setFillColor(25, 40, 90);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 20 + mainData.services.length * 9, 10, 10, "F");
      y += 8;

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("Services & Procedures", margin, y);
      y += 14;

      doc.setFontSize(11);
      mainData.services.forEach((service) => {
        const lines = doc.splitTextToSize(service, pageWidth - 2 * margin - 20);
        doc.text(`• ${lines.join("\n  ")}`, margin + 8, y);
        y += lines.length * 7 + 6;
      });
      y += 10;
    }

    if (mainData?.summary || fallbackExplanation) {
      doc.setFillColor(30, 45, 100);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 60, 10, 10, "F");
      y += 8;

      doc.setTextColor(150, 230, 255);
      doc.setFontSize(18);
      doc.text("Key Findings", margin, y);
      y += 14;

      doc.setFontSize(12);
      doc.setTextColor(220, 240, 255);
      const text = mainData?.summary || fallbackExplanation;
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 8 + 15;
    }

    if (isPaid && mainData?.redFlags?.length > 0) {
      doc.setFillColor(90, 20, 40);
      doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 25 + mainData.redFlags.length * 10, 10, 10, "F");
      y += 8;

      doc.setTextColor(255, 140, 140);
      doc.setFontSize(18);
      doc.text("Important Alerts", margin, y);
      y += 14;

      doc.setFontSize(11);
      mainData.redFlags.forEach((flag) => {
        const lines = doc.splitTextToSize(flag, pageWidth - 2 * margin - 20);
        doc.text(`• ${lines.join("\n  ")}`, margin + 8, y);
        y += lines.length * 7 + 6;
      });
      y += 10;
    }

    doc.setFillColor(20, 70, 60);
    doc.roundedRect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 80, 10, 10, "F");
    y += 8;

    doc.setTextColor(140, 255, 200);
    doc.setFontSize(18);
    doc.text("Next Steps", margin, y);
    y += 14;

    const steps = mainData?.nextSteps || [
      "Request an itemized bill from your provider",
      "Compare charges at FairHealthConsumer.org",
      "Contact your insurance company using the claim number",
      "File an appeal if you spot errors — many patients succeed",
    ];

    doc.setFontSize(11);
    doc.setTextColor(200, 255, 240);
    steps.forEach((step, i) => {
      const lines = doc.splitTextToSize(step, pageWidth - 2 * margin - 20);
      doc.text(`${i + 1}. ${lines.join("\n   ")}`, margin + 8, y);
      y += lines.length * 7 + 6;
    });

    doc.setFillColor(10, 15, 45);
    doc.rect(0, doc.internal.pageSize.getHeight() - 40, pageWidth, 40, "F");
    doc.setTextColor(160, 210, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by ExplainMyBill • Clear Medical Bill Reviews", margin, doc.internal.pageSize.getHeight() - 20);
    doc.text("This report is for informational purposes. Please verify with your provider and insurer.", margin, doc.internal.pageSize.getHeight() - 10);

    doc.save("Medical_Bill_Review_Report.pdf");
  };

  const ConfidenceBadge = ({ score }) => {
    if (score === undefined || score === null) return null;
    const color = score >= 80 ? "text-cyan-400" : score >= 50 ? "text-amber-400" : "text-red-400";
    const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
    return (
      <span className={`text-xs font-bold ${color} bg-white/10 px-3 py-1 rounded-full border border-white/20`}>
        {label} Confidence
      </span>
    );
  };

  const BottomLineStrip = () => {
    const total = keyAmounts.totalCharges || "unknown amount";
    const owe = keyAmounts.patientResponsibility || "unknown amount";

    return (
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 backdrop-blur-xl border border-white/20 p-6 text-center shadow-xl">
        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          <span className="text-cyan-300">Your Bottom Line:</span> Billed{" "}
          <span className="text-red-300 font-extrabold">{total}</span>
          {owe !== "unknown amount" && (
            <>
              {" "}— You currently owe{" "}
              <span className="text-amber-300 font-extrabold">{owe}</span>
            </>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 py-8 px-4 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header – Reduced */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Medical Bill Review
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 font-medium">
            Clear, Accurate, and Easy to Understand
          </p>
        </div>

        {/* Key Metrics Grid – 40% smaller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics.map((item, i) => (
            <div
              key={i}
              className="relative group overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-cyan-500/40 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    {item.label}
                  </p>
                  <ConfidenceBadge score={item.conf} />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white break-words leading-tight">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BottomLineStrip />

        {/* Accordion Sections – Reduced spacing & sizes */}
        <div className="space-y-6 mt-12">
          {/* Key Findings */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-4 text-2xl font-bold text-white">
                <span>✅</span> Key Findings
              </span>
              <ChevronDown isOpen={openSections.includes("summary")} />
            </button>
            {openSections.includes("summary") && (
              <div className="px-8 pb-8 text-white/90 text-base leading-relaxed">
                {mainData?.summaryPoints?.length > 0 ? (
                  <ul className="space-y-4">
                    {mainData.summaryPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="text-cyan-400 text-xl mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : fallbackExplanation ? (
                  <div className="prose prose-invert prose-base max-w-none space-y-4">
                    {fallbackExplanation.split("\n").map((para, i) => para && <p key={i}>{para}</p>)}
                  </div>
                ) : (
                  <p className="italic text-white/60">No detailed findings available at this time.</p>
                )}
              </div>
            )}
          </div>

          {/* Important Alerts – Paid Only */}
          {isPaid && mainData?.redFlags?.length > 0 && (
            <div className="rounded-2xl bg-red-900/30 backdrop-blur-xl border border-red-500/50 shadow-xl shadow-red-500/30 overflow-hidden">
              <button
                onClick={() => toggleSection("redflags")}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-red-900/20 transition"
              >
                <span className="flex items-center gap-4 text-2xl font-bold text-red-300">
                  <span>⚠️</span> Important Alerts
                </span>
                <ChevronDown isOpen={openSections.includes("redflags")} />
              </button>
              {openSections.includes("redflags") && (
                <div className="px-8 pb-8">
                  <ul className="space-y-4">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="bg-red-900/40 p-5 rounded-xl border border-red-500/60 text-white/95 text-base">
                        <span className="font-bold text-red-300">Alert:</span> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
            <button
              onClick={() => toggleSection("nextsteps")}
              className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-4 text-2xl font-bold text-white">
                <span>🎯</span> Next Steps
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
                        "Appeal anything that looks incorrect — many appeals are successful",
                      ]
                  ).map((step, i) => (
                    <li key={i} className="flex items-start gap-5 bg-emerald-900/20 p-5 rounded-xl border border-emerald-500/40">
                      <span className="text-emerald-400 font-black text-xl min-w-8">{i + 1}</span>
                      <span className="text-white/90 text-base">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Download Button – Reduced */}
        <div className="text-center my-12">
          <button
            onClick={handleDownloadPDF}
            className="group inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl py-5 px-12 rounded-full shadow-2xl hover:shadow-cyan-500/60 transition-all duration-500 hover:scale-110"
          >
            <span>📄 Download Your Full Report (PDF)</span>
            <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>

        {/* Upgrade CTA – Smaller */}
        {!isPaid && (
          <div className="mt-16 text-center">
            <div className="rounded-2xl bg-gradient-to-r from-orange-600/40 via-red-600/40 to-purple-800/40 backdrop-blur-xl border border-orange-500/60 p-10 max-w-4xl mx-auto shadow-2xl">
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-6">
                Unlock Full Review & Appeal Help
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Find overcharges • Estimate possible savings • Get help writing an appeal letter
              </p>
              <button
                onClick={onUpgrade}
                className="bg-white text-purple-800 font-bold text-xl py-5 px-12 rounded-full shadow-2xl hover:scale-110 hover:shadow-purple-500/60 transition-all duration-500"
              >
                Upgrade Now – Save Money
              </button>
              <p className="mt-6 text-white/70 text-base">
                30-day money-back guarantee • One-time or unlimited plans
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
