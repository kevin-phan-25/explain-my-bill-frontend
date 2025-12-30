// src/components/ExplanationCard.js
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onAnalyzeAnother }) {
  const [showExplanation, setShowExplanation] = useState(true);
  const [showNextSteps, setShowNextSteps] = useState(true);
  const [showRawText, setShowRawText] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const safe = useMemo(() => {
    const structured = result?.pages?.[0]?.structured || {};
    const keyAmounts = structured.keyAmounts || {};
    const entries = Object.values(keyAmounts).filter(f => f && f.label);

    return {
      entries,
      summary: structured.summary || "Your bill has been analyzed.",
      explanation: structured.explanation || "See breakdown below.",
      nextSteps: structured.nextSteps || [],
      rawText: result?.pages?.[0]?.rawText || "",
    };
  }, [result]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text("ExplainMyBill Report", 20, y); y += 15;
    doc.setFontSize(11);
    doc.text(safe.summary, 20, y, { maxWidth: 170 }); y += 20;

    safe.entries.forEach(f => {
      doc.setFontSize(12);
      doc.text(`${f.label}: ${f.value}`, 30, y); y += 10;
    });

    doc.save("explainmybill_report.pdf");
  };

  const getStyle = (c) => {
    const pct = Math.round((c || 0) * 100);
    if (pct >= 85) return { color: "#10b981", label: "High confidence" };
    if (pct >= 60) return { color: "#f59e0b", label: "Moderate confidence" };
    return { color: "#ef4444", label: "Low confidence — double-check" };
  };

  // Helper to highlight important numbers in explanation text
  const highlightNumbers = (text) => {
    if (!text) return null;
    return text.split(/(\$[0-9,]+\.?\d*)/g).map((part, i) => {
      if (/^\$[0-9,]+\.?\d*$/.test(part)) {
        return <span key={i} className="font-black text-2xl text-indigo-600">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Modern Header */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-pink-600 p-1 shadow-2xl">
        <div className="bg-white rounded-[26px] p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Your Bill Explained
              </h1>
              <p className="text-gray-600 mt-3 max-w-lg">
                We instantly analyzed your bill with care. Nothing is stored — your privacy is protected.
              </p>
            </div>

            {/* Reduced Analyze Another Bill button (50% smaller) */}
            <button
              onClick={onAnalyzeAnother || (() => location.reload())}
              className="inline-flex items-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-5 py-2.5 rounded-full font-bold text-base hover:bg-indigo-50 transition"
            >
              <span className="text-lg">←</span>
              Analyze Another Bill
            </button>
          </div>

          {/* Popping Trust Badges – More Visual Appeal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 rounded-2xl shadow-md border border-green-200">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ✓
              </div>
              <span className="font-bold text-gray-800">No account needed</span>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 rounded-2xl shadow-md border border-green-200">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ✓
              </div>
              <span className="font-bold text-gray-800">Deleted instantly</span>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 rounded-2xl shadow-md border border-green-200">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ✓
              </div>
              <span className="font-bold text-gray-800">Clear evidence shown</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center mt-8">
            <button
              onClick={() => setShowHelp(true)}
              className="text-indigo-600 font-medium underline hover:no-underline"
            >
              How confidence works
            </button>

            {/* Professional Download Report Button */}
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Professional Report (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Key Amount Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {safe.entries.map(field => {
          const style = getStyle(field.confidence);
          const pct = Math.round((field.confidence || 0) * 100);

          return (
            <div key={field.label} className="bg-white rounded-2xl shadow-lg p-6 border-t-4" style={{ borderTopColor: style.color }}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{field.label}</h3>
              <p className="text-4xl font-black text-gray-900 mb-6">{field.value}</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <span className="font-bold text-gray-900">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-700 ${style.bgBar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">{style.text}</p>
                </div>

                {field.citations?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Found on these lines:</p>
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

      {/* Plain English Summary – Numbers Highlighted */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full px-8 py-5 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900">Plain English Summary</h2>
          <span className="text-3xl text-gray-400 font-light">{showExplanation ? "−" : "+"}</span>
        </button>

        {showExplanation && (
          <div className="px-8 pb-8 pt-4 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">{safe.summary}</p>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
              <p className="text-lg text-gray-800 leading-loose">
                {highlightNumbers(safe.explanation)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowNextSteps(!showNextSteps)}
          className="w-full px-8 py-5 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
          <span className="text-3xl text-gray-400 font-light">{showNextSteps ? "−" : "+"}</span>
        </button>

        {showNextSteps && (
          <div className="px-8 pb-8 pt-4 space-y-5">
            {safe.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-5 p-5 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl border border-indigo-100">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                  {i + 1}
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">{step}</p>
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
          {showRawText ? "← Hide extracted text" : "Show full extracted text (for verification)"}
        </button>

        {showRawText && (
          <pre className="mt-4 p-6 bg-white rounded-xl text-sm text-gray-700 overflow-x-auto border">
            {safe.rawText || "No raw text available."}
          </pre>
        )}
      </div>

      {/* Confidence Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Confidence Explained</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
                <div><strong>High (85%+)</strong><p className="text-sm text-gray-600">Clear label and exact match</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                <div><strong>Moderate (60–84%)</strong><p className="text-sm text-gray-600">Good but from image scan</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                <div><strong>Low (&lt;60%)</strong><p className="text-sm text-gray-600">Uncertain — always verify</p></div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
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
