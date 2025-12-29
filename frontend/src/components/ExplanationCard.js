import React, { useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onUpgrade }) {
  const [openPages, setOpenPages] = useState([]);

  if (!result) return null;

  const { pages = [], isPaid } = result;

  // Combine structured data from all pages
  let structured = null;
  pages.forEach((p) => {
    if (p.structured && !structured) structured = p.structured;
  });

  const keyAmounts = structured?.keyAmounts || {};
  const points = structured?.summaryPoints || [];
  const potentialSavings = structured?.potentialSavings;

  const togglePage = (index) =>
    setOpenPages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text("Bill Review", 20, y);
    y += 20;

    ["Total Billed", "Insurance Paid", "You Owe"].forEach((label, i) => {
      const value =
        i === 0
          ? keyAmounts.totalCharges
          : i === 1
          ? keyAmounts.insurancePaid
          : keyAmounts.patientResponsibility || "—";
      doc.text(`${label}: ${value || "—"}`, 30, y);
      y += 12;
    });

    y += 20;
    doc.setFontSize(14);
    doc.text("Explanation", 20, y);
    y += 12;
    doc.setFontSize(10);

    pages.forEach((page) => {
      const explanation = page.explanation || "Analysis complete.";
      explanation.split("\n\n").forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 8;
      });
      y += 12;
    });

    doc.save("bill.pdf");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Your Review</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium">Total Billed</p>
          <p className="text-2xl font-bold">{keyAmounts.totalCharges || "—"}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium">Insurance Paid</p>
          <p className="text-2xl font-bold">{keyAmounts.insurancePaid || "—"}</p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium">You Owe</p>
          <p className="text-2xl font-bold">{keyAmounts.patientResponsibility || "—"}</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium">Savings</p>
          <p className="text-2xl font-bold">
            {potentialSavings || (isPaid ? "Calculated" : "Upgrade")}
          </p>
        </div>
      </div>

      {/* Pages */}
      {pages.map((page, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <button
            onClick={() => togglePage(index)}
            className="w-full flex justify-between items-center"
          >
            <h2 className="text-xl font-bold">
              Page {index + 1} Explanation
            </h2>
            <span className="text-lg">{openPages.includes(index) ? "−" : "+"}</span>
          </button>
          {openPages.includes(index) && (
            <div className="mt-4 space-y-3 text-base">
              {page.structured?.summaryPoints?.length > 0 && (
                <ul className="mb-3">
                  {page.structured.summaryPoints.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span> {p}
                    </li>
                  ))}
                </ul>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {page.explanation
                  ? page.explanation.split("\n\n").map((p, i) =>
                      p.trim() ? <p key={i}>{p.trim()}</p> : null
                    )
                  : "Analysis complete."}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={downloadPDF}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Download PDF
        </button>
        {!isPaid && (
          <button
            onClick={onUpgrade}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
          >
            Unlock Full
          </button>
        )}
      </div>
    </div>
  );
}
