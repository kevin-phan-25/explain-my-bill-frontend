// src/components/ExplanationCard.js
import React, { useState } from 'react';
import PaidFeatures from './PaidFeatures';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export default function ExplanationCard({ result, onUpgrade }) {
  const [activePage, setActivePage] = useState(0);

  if (!result) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    let yOffset = 40;

    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text("Your Bill Explanation", 40, yOffset);
    yOffset += 40;

    result.pages.forEach((page, i) => {
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text(`Page ${page.page}`, 40, yOffset);
      yOffset += 24;

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);

      const lines = doc.splitTextToSize(page.explanation, 500);
      lines.forEach((line) => {
        if (yOffset > 750) {
          doc.addPage();
          yOffset = 40;
        }
        doc.text(line, 40, yOffset);
        yOffset += 16;
      });

      yOffset += 20;
    });

    doc.save('Bill_Explanation.pdf');
  };

  return (
    <div className="glass-card p-8 shadow-2xl rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
        📋 Your Bill Explanation
      </h2>

      {!result.isPaid && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-6 mb-8 shadow-inner">
          <p className="text-lg text-gray-800">
            This is a <strong>free summary</strong>. Upgrade for the full detailed explanation, including red flags, appeal letters, and more.
          </p>
          <button
            onClick={onUpgrade}
            className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-shadow shadow-md"
          >
            Unlock Full Features
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {result.pages.map((page, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`px-5 py-2 rounded-xl font-medium transition ${
              i === activePage
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          >
            Page {page.page}
          </button>
        ))}
      </div>

      <div className="prose prose-lg max-w-none mb-6">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
          {result.pages[activePage].explanation}
        </pre>
      </div>

      {result.pages.length > 0 && (
        <div className="text-center mb-8">
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
          >
            📥 Download Full Explanation as PDF
          </button>
        </div>
      )}

      {result.isPaid && result.paidFeatures && (
        <div className="mt-8">
          <PaidFeatures features={result.paidFeatures} />
        </div>
      )}
    </div>
  );
}
