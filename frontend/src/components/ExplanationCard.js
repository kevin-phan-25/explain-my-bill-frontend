// src/components/ExplanationCard.js
import React from "react";
import PaidFeatures from "./PaidFeatures";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Regex patterns for highlighting
const patterns = {
  amount: /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g, // $75.00, $1,200.50
  percentage: /\d{1,3}%/g,                     // 20%, 100%
  keywords: /\b(deductible|copay|insurance|covered|balance|owed|EOB|claim|denied)\b/gi,
};

export default function ExplanationCard({ result, onUpgrade, onUseSample }) {
  if (!result) return null;

  const { explanation, features, isPaid } = result;
  const mainContent = explanation?.trim() || null;

  // ✅ Download explanation as styled PDF using pdf-lib
  const handleDownloadPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = height - 50;

      // Title
      page.drawText("📋 Your Bill Review", {
        x: 50,
        y,
        size: 24,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.5),
      });
      y -= 40;

      // Main content lines
      mainContent.split("\n").forEach((line) => {
        let text = line;

        // Highlight amounts
        text = text.replace(patterns.amount, (m) => `[AMOUNT:${m}]`);
        text = text.replace(patterns.percentage, (m) => `[PERCENT:${m}]`);
        text = text.replace(patterns.keywords, (m) => `[KEYWORD:${m}]`);

        const segments = text.split(/(\[AMOUNT:.*?\]|\[PERCENT:.*?\]|\[KEYWORD:.*?\])/g);

        let x = 50;
        segments.forEach((seg) => {
          if (seg.startsWith("[AMOUNT:")) {
            const val = seg.replace("[AMOUNT:", "").replace("]", "");
            page.drawText(val, { x, y, font: fontBold, size: 12, color: rgb(0.7, 0, 0) });
          } else if (seg.startsWith("[PERCENT:")) {
            const val = seg.replace("[PERCENT:", "").replace("]", "");
            page.drawText(val, { x, y, font: fontBold, size: 12, color: rgb(0, 0.3, 0.7) });
          } else if (seg.startsWith("[KEYWORD:")) {
            const val = seg.replace("[KEYWORD:", "").replace("]", "");
            page.drawText(val, { x, y, font: fontBold, size: 12, color: rgb(0.6, 0.4, 0), });
          } else {
            page.drawText(seg, { x, y, font, size: 12, color: rgb(0, 0, 0) });
          }
          x += font.widthOfTextAtSize(seg, 12);
        });
        y -= 18;
        if (y < 50) {
          // add new page if space runs out
          y = height - 50;
          page = pdfDoc.addPage([600, 800]);
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "Medical_Bill_Explanation.pdf");
    } catch (err) {
      alert("Failed to generate PDF: " + err.message);
    }
  };

  // Highlight important text for UI
  const highlightText = (text) => {
    if (!text) return null;
    const lines = text.split("\n").map((line, idx) => {
      let formatted = line
        .replace(patterns.amount, (m) => `<span class="text-red-600 font-bold">${m}</span>`)
        .replace(patterns.percentage, (m) => `<span class="text-blue-600 font-semibold">${m}</span>`)
        .replace(patterns.keywords, (m) => `<span class="bg-yellow-200 px-1 rounded">${m}</span>`);
      return <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
    return lines;
  };

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      <div className="bg-gray-50 border-l-8 border-gray-700 rounded-2xl p-10 shadow-2xl">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center">
          <span className="text-5xl mr-4">📋</span> Your Bill Review
        </h3>

        {!mainContent && (
          <div className="bg-red-50 p-10 rounded-xl border border-red-400 text-center">
            <p className="text-2xl font-bold text-red-800 mb-4">
              We could not read your bill clearly
            </p>
            <p className="text-gray-700 text-lg mb-6">
              This happens when the image is blurry, low-resolution, or has overlays.
            </p>
            <button
              onClick={onUseSample}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
            >
              Try Sample Bill
            </button>
          </div>
        )}

        {mainContent && (
          <>
            {/* What We Found */}
            <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 mb-8 shadow-lg">
              <h4 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">✅</span> What We Found
              </h4>
              <p className="text-lg text-blue-800 leading-relaxed">
                Your bill includes medical services, insurance adjustments, and your final responsibility. 
                Important numbers and terms are highlighted for quick understanding.
              </p>
            </div>

            {/* Explanation Content */}
            <div className="bg-white p-10 rounded-xl shadow-inner border border-gray-300 text-lg text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
              {highlightText(mainContent)}
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 mb-8 shadow-lg">
              <h4 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">🎯</span> Your Next Steps
              </h4>
              <ul className="text-lg text-green-800 space-y-2 list-disc list-inside">
                <li>Request an <strong>itemized bill</strong> from your provider if you don't have one</li>
                <li>Compare charges at <a href="https://www.fairhealthconsumer.org" target="_blank" rel="noopener noreferrer" className="underline font-bold">FairHealthConsumer.org</a></li>
                <li>Call your insurance with questions using your claim number</li>
                <li>If something looks wrong, appeal — many people successfully reduce or eliminate charges</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-8 mb-8 shadow-lg text-center">
              <h4 className="text-2xl font-bold text-purple-900 mb-4">You Have Rights</h4>
              <p className="text-lg text-purple-800 max-w-3xl mx-auto">
                Medical billing errors are common. You do <strong>not</strong> have to accept overcharges. Many patients successfully appeal and save hundreds or thousands.
              </p>
            </div>

            {/* Download PDF */}
            <div className="text-center mb-10">
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition transform"
              >
                Download Full Explanation PDF
              </button>
            </div>
          </>
        )}
      </div>

      {/* Paid Features */}
      {features && <PaidFeatures features={features} />}

      {/* Upgrade CTA */}
      {!isPaid && mainContent && (
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Don't Pay Unfair Charges</h3>
            <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
              Unlock expert review to spot red flags, estimate savings, and get a ready-to-send appeal letter.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-red-700 hover:bg-gray-100 font-bold py-5 px-12 rounded-2xl text-2xl shadow-xl transition transform hover:scale-105"
            >
              Get My Full Review & Appeal Tools
            </button>
            <p className="mt-6 text-lg opacity-90">One-time or unlimited • 30-day money-back guarantee</p>
          </div>
        </div>
      )}
    </div>
  );
}
