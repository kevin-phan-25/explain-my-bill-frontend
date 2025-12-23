// src/components/ExplanationCard.js
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import PaidFeatures from "./PaidFeatures";

export default function ExplanationCard({ result, onUpgrade, samples }) {
  const [activePage, setActivePage] = useState(0);
  if (!result) return null;

  const { pages, isPaid, paidFeatures } = result;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    pages.forEach((p, i) => {
      doc.setFontSize(16);
      doc.text(`Page ${p.page}`, 10, 20);
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(p.explanation, 180);
      doc.text(splitText, 10, 30);
      if (i < pages.length - 1) doc.addPage();
    });
    doc.save("BillExplanation.pdf");
  };

  const highlightAmounts = (text) => {
    return text
      .replace(/\$\d+(\.\d{2})?/g, (match) => `<span class="text-red-600 font-bold">${match}</span>`)
      .replace(/savings|covered|insurance/gi, (match) => `<span class="text-green-600 font-semibold">${match}</span>`);
  };

  return (
    <div className="mt-12 p-6">
      {/* Summary Card */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 flex justify-center items-center">
          <span className="text-5xl mr-3">📋</span>Your Bill Review
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Quick overview of charges, insurance coverage, your responsibility, and potential savings.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Amount Billed</p>
            <p className="text-xl font-bold text-red-600">{pages[0]?.rawText.match(/\$\d+(\.\d{2})?/) || "$0.00"}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Insurance Covered</p>
            <p className="text-xl font-bold text-green-600">{/* extract from AI text or placeholder */}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Amount You Owe</p>
            <p className="text-xl font-bold text-yellow-700">{/* extract from AI text or placeholder */}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Potential Savings</p>
            <p className="text-xl font-bold text-purple-700">{/* extract from AI text or placeholder */}</p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-xl shadow-lg font-bold hover:scale-105 transform transition"
        >
          Download Full PDF
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex gap-3 flex-wrap mb-6 justify-center">
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              i === activePage ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Page {p.page}
          </button>
        ))}
      </div>

      {/* Active Page Explanation */}
      <div
        className="bg-gray-50 p-6 rounded-2xl shadow-inner text-gray-800 mb-8 whitespace-pre-wrap text-lg"
        dangerouslySetInnerHTML={{ __html: highlightAmounts(pages[activePage].explanation) }}
      />

      {/* Next Steps / Rights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-xl shadow-lg">
          <h4 className="text-2xl font-bold mb-3 flex items-center">
            <span className="text-4xl mr-3">🎯</span>Your Next Steps
          </h4>
          <ul className="list-disc list-inside space-y-2 text-green-800">
            <li>Request an <strong>itemized bill</strong> from your provider if you don't have one</li>
            <li>Compare charges at <a href="https://www.fairhealthconsumer.org" target="_blank" rel="noreferrer" className="underline font-bold">FairHealthConsumer.org</a></li>
            <li>Call your insurance with questions using the claim number</li>
            <li>Appeal if something looks incorrect — many successfully reduce charges</li>
          </ul>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl shadow-lg text-center">
          <h4 className="text-2xl font-bold mb-3">You Have Rights</h4>
          <p className="text-purple-800">
            Medical billing errors are common. You do <strong>not</strong> have to accept surprise charges. Many patients successfully appeal and save hundreds or thousands. We're here to help you understand and fight back if needed.
          </p>
        </div>
      </div>

      {/* Paid Features */}
      {isPaid && paidFeatures && <PaidFeatures features={paidFeatures} />}

      {/* Upgrade CTA */}
      {!isPaid && (
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Don't Pay Unfair Charges</h3>
            <p className="text-xl mb-6 leading-relaxed max-w-2xl mx-auto">
              Unlock expert review to spot red flags, estimate savings, and get a ready-to-send appeal letter.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-red-700 hover:bg-gray-100 font-bold py-5 px-12 rounded-2xl text-2xl shadow-xl transition transform hover:scale-105"
            >
              Get Full Review & Appeal Tools
            </button>
          </div>
        </div>
      )}

      {/* Sample Bills */}
      {samples && samples.length > 0 && (
        <div className="mt-10">
          <h4 className="text-2xl font-bold mb-4">Try a Sample Bill</h4>
          <div className="flex gap-4 flex-wrap">
            {samples.map((s, i) => (
              <button
                key={i}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl shadow-sm"
                onClick={() => s.onClick()}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
