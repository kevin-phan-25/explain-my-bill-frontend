// src/components/ExplanationCard.js
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onAnalyzeAnother }) {
  const [showExplanation, setShowExplanation] = useState(true);
  const [showNextSteps, setShowNextSteps] = useState(true);
  const [showRawText, setShowRawText] = useState(false);
  const [showConfidenceHelp, setShowConfidenceHelp] = useState(false);

  const safe = useMemo(() => {
    const pages = result?.pages || [];
    const page0 = pages[0] || {};
    const structured = page0.structured || {};
    const keyAmounts = structured.keyAmounts || {};
    const summary = structured.summary || "Your bill has been analyzed.";
    const explanation =
      structured.explanation ||
      "We’ve read your bill and highlighted the most important amounts below.";
    const nextSteps = Array.isArray(structured.nextSteps)
      ? structured.nextSteps
      : [
          "Compare this with your Explanation of Benefits (EOB) from your insurance company.",
          "Contact your provider or insurer if anything seems incorrect.",
          "Keep this report for your records.",
        ];
    const confidenceMeta = structured.confidenceMeta || {};
    const rawText = page0.rawText || "";

    const entries = Object.entries(keyAmounts)
      .filter(([, v]) => v && typeof v === "object" && v.label)
      .map(([key, v]) => ({
        key,
        ...v,
      }));

    return {
      hasData: entries.length > 0 || rawText,
      entries,
      summary,
      explanation,
      nextSteps,
      confidenceMeta,
      rawText,
    };
  }, [result]);

  if (!safe.hasData) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-lg text-gray-700">No readable data was found in your bill.</p>
          <p className="text-gray-500 mt-3">
            Try uploading a clearer photo or the original PDF.
          </p>
        </div>
      </div>
    );
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 15;

      doc.setFontSize(18);
      doc.text("ExplainMyBill Report", 15, y);
      y += 12;

      doc.setFontSize(9);
      doc.text("Educational tool only • Always verify with your provider", 15, y);
      y += 12;

      doc.setFontSize(13);
      doc.text("Summary", 15, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(safe.summary, 15, y, { maxWidth: 180 });
      y += 18;

      doc.setFontSize(13);
      doc.text("Key Amounts", 15, y);
      y += 8;

      safe.entries.forEach((field) => {
        const pct = Math.round((field.confidence || 0) * 100);
        doc.setFontSize(11);
        doc.text(`${field.label}: ${field.value}`, 25, y);
        y += 7;
        doc.setFontSize(9);
        doc.text(`Confidence: ${pct}%`, 25, y);
        y += 10;
      });

      doc.save("ExplainMyBill_Report.pdf");
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const getConfidenceStyle = (confidence) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 85) {
      return {
        borderColor: "#10b981",
        bgBar: "bg-emerald-500",
        text: "High confidence",
      };
    }
    if (pct >= 60) {
      return {
        borderColor: "#f59e0b",
        bgBar: "bg-amber-500",
        text: "Moderate confidence",
      };
    }
    return {
      borderColor: "#ef4444",
      bgBar: "bg-red-500",
      text: "Low confidence – double-check",
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Lively Modern Header with Analyze Another Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
        <div className="rounded-[22px] bg-white p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Your Bill Explained
              </h1>
              <p className="text-gray-600 mt-3 max-w-lg">
                We instantly analyzed your bill with care. Nothing is stored — your privacy is protected.
              </p>
            </div>

            {/* Fancy Analyze Another Button – in the original spot, centered on mobile */}
            <div className="flex justify-center md:justify-end">
              <button
                onClick={onAnalyzeAnother || (() => window.location.reload())}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span className="text-2xl">←</span>
                Analyze Another Bill
              </button>
            </div>

            <div className="text-6xl hidden md:block">💡</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-2xl">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-gray-800 text-sm">No account needed</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-2xl">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-gray-800 text-sm">Deleted instantly</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-2xl">
              <span className="text-2xl">✓</span>
              <span className="font-semibold text-gray-800 text-sm">Clear evidence shown</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setShowConfidenceHelp(true)}
              className="text-indigo-600 font-medium underline hover:no-underline"
            >
              How confidence works
            </button>
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-shadow"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the content remains unchanged */}
      {/* Compact Key Amount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {safe.entries.map((field) => {
          const style = getConfidenceStyle(field.confidence || 0);
          const pct = Math.round((field.confidence || 0) * 100);

          return (
            <div
              key={field.label}
              className="bg-white rounded-2xl shadow-lg p-6 border-t-4"
              style={{ borderTopColor: style.borderColor }}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {field.label}
              </h3>

              <p className="text-4xl font-black text-gray-900 mb-6">
                {field.value}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <span className="font-bold text-gray-900">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${style.bgBar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {style.text}
                  </p>
                </div>

                {Array.isArray(field.citations) && field.citations.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Found on these lines:
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {field.citations.slice(0, 3).map((c, i) => (
                        <li key={i} className="font-mono bg-white px-3 py-1 rounded border">
                          Line {c.line}: “…{c.text.trim()}…”
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full px-8 py-5 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Plain English Summary
          </h2>
          <span className="text-3xl text-gray-400 font-light">
            {showExplanation ? "−" : "+"}
          </span>
        </button>

        {showExplanation && (
          <div className="px-8 pb-8 pt-4 space-y-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              {safe.summary}
            </p>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
              <p className="text-gray-800 leading-relaxed">
                {safe.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps – Modern & Lively */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowNextSteps(!showNextSteps)}
          className="w-full px-8 py-5 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Next Steps
          </h2>
          <span className="text-3xl text-gray-400 font-light">
            {showNextSteps ? "−" : "+"}
          </span>
        </button>

        {showNextSteps && (
          <div className="px-8 pb-8 pt-4 space-y-5">
            {safe.nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-5 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl border border-indigo-100"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                  {i + 1}
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Text */}
      <div className="bg-gray-100 rounded-2xl p-6">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="text-indigo-600 font-semibold hover:underline"
        >
          {showRawText
            ? "← Hide extracted text"
            : "Show full extracted text (for verification)"}
        </button>

        {showRawText && (
          <pre className="mt-4 p-6 bg-white rounded-xl text-sm text-gray-700 overflow-x-auto border">
            {safe.rawText || "No raw text available."}
          </pre>
        )}
      </div>

      {/* Confidence Modal */}
      {showConfidenceHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Confidence Explained</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
                <div>
                  <strong>High (85%+)</strong>
                  <p className="text-sm text-gray-600">Clear label and exact match</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                <div>
                  <strong>Moderate (60–84%)</strong>
                  <p className="text-sm text-gray-600">Good but from image scan</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                <div>
                  <strong>Low (&lt;60%)</strong>
                  <p className="text-sm text-gray-600">Uncertain — always verify</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConfidenceHelp(false)}
              className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-3 rounded-xl font-bold"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-12">
        <p>Educational tool • Not medical/legal advice • Not HIPAA-certified</p>
        <p className="mt-1">Always confirm with your provider before paying.</p>
      </div>
    </div>
  );
}
