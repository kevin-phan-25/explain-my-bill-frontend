import React, { useState } from "react";
import PaidFeatures from "./PaidFeatures";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onUpgrade }) {
  const [activePage, setActivePage] = useState(0);

  if (!result) return null;

  const handleDownload = () => {
    const doc = new jsPDF();
    result.pages.forEach((p, i) => {
      doc.setFontSize(12);
      doc.text(`Page ${p.page}`, 10, 10);
      doc.text(p.explanation || "No explanation", 10, 20);
      if (i < result.pages.length - 1) doc.addPage();
    });
    doc.save("bill_explanation.pdf");
  };

  return (
    <div className="glass-card p-8">
      <h2 className="text-3xl font-bold mb-6">Your Bill Explanation</h2>

      {!result.isPaid && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <p className="text-lg">
            This is a free summary. <strong>Upgrade</strong> for full explanation, red flags, appeal letters, and savings estimates.
          </p>
          <button onClick={onUpgrade} className="btn-primary mt-4">
            Unlock Full Features
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        {result.pages.map((page, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              i === activePage ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Page {page.page}
          </button>
        ))}
      </div>

      <div className="prose prose-lg max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
          {result.pages[activePage].explanation}
        </pre>
      </div>

      {result.isPaid && result.paidFeatures && <PaidFeatures features={result.paidFeatures} />}

      <div className="text-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
