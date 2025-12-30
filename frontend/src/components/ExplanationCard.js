// src/components/ExplanationCard.js
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result }) {
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <p className="text-xl text-gray-700">No readable data was found in your bill.</p>
          <p className="text-gray-500 mt-4">
            Try uploading a clearer photo or the original PDF from your provider portal.
          </p>
        </div>
      </div>
    );
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(20);
      doc.text("ExplainMyBill Report", 20, y);
      y += 15;

      doc.setFontSize(10);
      doc.text("Educational tool only • Always verify with your provider", 20, y);
      y += 15;

      doc.setFontSize(14);
      doc.text("Summary", 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.text(safe.summary, 20, y, { maxWidth: 170 });
      y += 20;

      doc.setFontSize(14);
      doc.text("Key Amounts", 20, y);
      y += 10;

      safe.entries.forEach((field) => {
        const pct = Math.round((field.confidence || 0) * 100);
        doc.setFontSize(12);
        doc.text(`${field.label}: ${field.value}`, 30, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Confidence: ${pct}%`, 30, y);
        y += 12;
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
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Trust & Header */}
      <div className="bg-white rounded-3xl shadow-xl p-10 border-t-8 border-indigo-600">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Bill Explained
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-4xl">
          We’ve carefully read your medical bill and highlighted the most important amounts.
          Your document is processed instantly and securely — nothing is ever stored.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-4 bg-green-50 px-6 py-4 rounded-2xl">
            <span className="text-3xl">✓</span>
            <span className="font-medium text-gray-800">No account required</span>
          </div>
          <div className="flex items-center gap-4 bg-green-50 px-6 py-4 rounded-2xl">
            <span className="text-3xl">✓</span>
            <span className="font-medium text-gray-800">Deleted immediately after processing</span>
          </div>
          <div className="flex items-center gap-4 bg-green-50 px-6 py-4 rounded-2xl">
            <span className="text-3xl">✓</span>
            <span className="font-medium text-gray-800">Transparent evidence shown</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowConfidenceHelp(true)}
            className="text-indigo-700 font-medium underline hover:no-underline"
          >
            How do we calculate confidence?
          </button>
          <button
            onClick={downloadPDF}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-700 shadow-lg"
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Key Amounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {safe.entries.map((field) => {
          const style = getConfidenceStyle(field.confidence || 0);
          const pct = Math.round((field.confidence || 0) * 100);

          return (
            <div
              key={field.label}
              className="bg-white rounded-3xl shadow-xl p-8 border-t-8"
              style={{ borderTopColor: style.borderColor }}
            >
              <h3 className="text-xl font-semibold text-gray-600 mb-3">
                {field.label}
              </h3>

              <p className="text-5xl font-bold text-gray-900 mb-8">
                {field.value}
              </p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Confidence</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-700 ${style.bgBar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    {style.text}
                  </p>
                </div>

                {/* Show evidence if available */}
                {Array.isArray(field.citations) && field.citations.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="font-medium text-gray-700 mb-3">
                      We found this amount on these lines:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {field.citations.slice(0, 3).map((c, i) => (
                        <li key={i} className="font-mono bg-white px-3 py-2 rounded-lg border">
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

      {/* Plain English Explanation */}
      <div className="bg-white rounded-3xl shadow-xl p-10">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex justify-between items-center text-left hover:bg-gray-50 -m-4 p-4 rounded-2xl transition"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            What this bill means in plain English
          </h2>
          <span className="text-4xl text-gray-400 font-light">
            {showExplanation ? "−" : "+"}
          </span>
        </button>

        {showExplanation && (
          <div className="mt-8 space-y-8">
            <p className="text-xl text-gray-800 leading-relaxed">
              {safe.summary}
            </p>

            <div className="bg-indigo-50 border-l-8 border-indigo-600 p-8 rounded-r-2xl">
              <p className="text-lg text-gray-800 leading-relaxed">
                {safe.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps – More Visual */}
      <div className="bg-white rounded-3xl shadow-xl p-10">
        <button
          onClick={() => setShowNextSteps(!showNextSteps)}
          className="w-full flex justify-between items-center text-left hover:bg-gray-50 -m-4 p-4 rounded-2xl transition"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Suggested next steps
          </h2>
          <span className="text-4xl text-gray-400 font-light">
            {showNextSteps ? "−" : "+"}
          </span>
        </button>

        {showNextSteps && (
          <div className="mt-8 space-y-6">
            {safe.nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-8 border-indigo-600"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  {i + 1}
                </div>
                <p className="text-lg text-gray-800 leading-relaxed flex-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Text Toggle */}
      <div className="bg-gray-100 rounded-3xl p-8">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="text-indigo-700 font-semibold text-lg hover:underline"
        >
          {showRawText
            ? "← Hide the full text we read from your bill"
            : "Show the full text we read from your bill (for verification)"}
        </button>

        {showRawText && (
          <pre className="mt-6 p-8 bg-white rounded-2xl text-sm text-gray-700 overflow-x-auto border shadow-inner">
            {safe.rawText || "No raw text available."}
          </pre>
        )}
      </div>

      {/* Confidence Help Modal */}
      {showConfidenceHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10">
            <h3 className="text-3xl font-bold mb-8">How Confidence Works</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div>
                  <strong className="text-lg">High confidence (85%+)</strong>
                  <p className="text-gray-700 mt-1">
                    Clear label, exact amount match, and strong supporting evidence in the document.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex-shrink-0"></div>
                <div>
                  <strong className="text-lg">Moderate confidence (60–84%)</strong>
                  <p className="text-gray-700 mt-1">
                    Good match, but from scanned image or slightly less clear labeling.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 bg-red-500 rounded-full flex-shrink-0"></div>
                <div>
                  <strong className="text-lg">Low confidence (below 60%)</strong>
                  <p className="text-gray-700 mt-1">
                    Possible match but uncertain — always double-check with your provider.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConfidenceHelp(false)}
              className="mt-10 w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold hover:bg-indigo-700"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 mt-16">
        <p className="text-sm">
          ExplainMyBill is an educational tool • Not medical, legal, or billing advice • Not HIPAA-certified
        </p>
        <p className="text-sm mt-2">
          Always verify all amounts with your healthcare provider and insurance company before paying.
        </p>
      </div>
    </div>
  );
}
