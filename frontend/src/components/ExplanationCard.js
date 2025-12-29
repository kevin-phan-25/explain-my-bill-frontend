import React, { useState } from "react";
import jsPDF from "jspdf";

/* ================= Chevron ================= */
const ChevronDown = ({ isOpen }) => (
  <svg
    className={`w-6 h-6 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ================= Helpers ================= */
const cleanValue = (...values) => {
  for (const v of values) {
    if (v && typeof v === "string" && v.trim() !== "" && !v.toLowerCase().includes("not detected") && !v.toLowerCase().includes("no text")) {
      return v.trim();
    }
  }
  return "Not detected";
};

/* ================= Component ================= */
export default function ExplanationCard({ result, onUpgrade }) {
  const [open, setOpen] = useState(["explanation"]);

  if (!result) return null;

  const { pages = [], isPaid } = result;

  /* ================= Normalize ================= */
  let structured = null;
  let explanationText = "";
  let ocrText = "";

  pages.forEach((p) => {
    if (p?.structured && !structured) structured = p.structured;
    if (p?.explanation) explanationText += `${p.explanation}\n\n`;
    if (p?.rawText) ocrText += `${p.rawText}\n\n`;
  });

  explanationText = explanationText.trim();
  ocrText = ocrText.trim();

  const keyAmounts = structured?.keyAmounts || {};
  const summaryPoints = structured?.summaryPoints || [];

  const totalCharges = cleanValue(keyAmounts.totalCharges, structured?.summary);
  const insurancePaid = cleanValue(keyAmounts.insurancePaid, structured?.summary);
  const patientResponsibility = cleanValue(keyAmounts.patientResponsibility, structured?.summary);
  const potentialSavings = cleanValue(
    structured?.potentialSavings,
    isPaid ? structured?.summary : null
  );

  const finalExplanation =
    cleanValue(explanationText) ||
    cleanValue(structured?.explanation) ||
    cleanValue(structured?.summary) ||
    (ocrText ? "OCR text detected – full AI analysis in progress. Check back soon or upgrade for instant results." : "No bill text detected. Try a clearer image or searchable PDF.");

  /* ================= PDF ================= */
  const handlePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const W = doc.internal.pageSize.getWidth();
    const M = 20;
    let y = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Medical Bill Review Report", M, y);
    y += 14;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated ${new Date().toLocaleDateString()}`, M, y);
    y += 14;

    const rows = [
      ["Total Charges", totalCharges],
      ["Insurance Paid", insurancePaid],
      ["Patient Responsibility", patientResponsibility],
      ["Potential Savings", potentialSavings || (isPaid ? "Calculated" : "Upgrade to view")],
    ];

    rows.forEach(([label, value]) => {
      if (y > 260) { doc.addPage(); y = 30; }
      doc.text(`${label}:`, M, y);
      doc.text(value, M + 70, y);
      y += 8;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Explanation", M, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.splitTextToSize(finalExplanation, W - M * 2).forEach((line) => {
      if (y > 280) { doc.addPage(); y = 30; }
      doc.text(line, M, y);
      y += 6;
    });

    if (ocrText) {
      y += 10;
      if (y > 260) { doc.addPage(); y = 30; }
      doc.setFont("helvetica", "bold");
      doc.text("Raw OCR Text (for reference)", M, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(ocrText, W - M * 2).forEach((line) => {
        if (y > 280) { doc.addPage(); y = 30; }
        doc.text(line, M, y);
        y += 6;
      });
    }

    doc.save("Medical_Bill_Review.pdf");
  };

  /* ================= UI ================= */
  return (
    <div className="bg-slate-900 min-h-screen p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-cyan-400 text-center">
          Medical Bill Review
        </h1>

        <section className="bg-slate-800 rounded-xl">
          <button
            onClick={() =>
              setOpen((o) =>
                o.includes("explanation")
                  ? o.filter((x) => x !== "explanation")
                  : [...o, "explanation"]
              )
            }
            className="w-full flex justify-between p-5 text-lg font-bold"
          >
            Explanation
            <ChevronDown isOpen={open.includes("explanation")} />
          </button>
          {open.includes("explanation") && (
            <div className="p-5 space-y-4 text-white/90">
              {summaryPoints.length > 0 && (
                <>
                  <h3 className="font-bold text-cyan-300">Key Insights</h3>
                  {summaryPoints.map((s, i) => (
                    <p key={i}>• {s}</p>
                  ))}
                </>
              )}
              <p>{finalExplanation}</p>
            </div>
          )}
        </section>

        {ocrText && (
          <section className="bg-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-bold text-yellow-300">
              Raw OCR Text Detected
            </h2>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-white/80 break-words">
              {ocrText}
            </pre>
            <p className="mt-4 text-yellow-200">
              AI analysis is running — full explanation coming soon!
            </p>
          </section>
        )}

        <div className="text-center">
          <button
            onClick={handlePDF}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-full"
          >
            Download PDF Report
          </button>
        </div>

        {!isPaid && (
          <div className="bg-red-900/40 p-6 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-3">
              Unlock Instant Full AI Review & Savings Estimates
            </h3>
            <button
              onClick={onUpgrade}
              className="bg-white text-red-800 px-6 py-3 rounded-full font-bold"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
