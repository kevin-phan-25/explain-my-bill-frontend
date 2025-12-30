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
      "We’ve read your bill and broken down the most important amounts below.";
    const nextSteps = Array.isArray(structured.nextSteps)
      ? structured.nextSteps
      : [
          "Compare this with any Explanation of Benefits (EOB) from your insurance.",
          "Contact your provider or insurer if anything looks incorrect.",
          "Keep this for your records.",
        ];
    const confidenceMeta = structured.confidenceMeta || {};
    const rawText = page0.rawText || "";
    const extractorUsed =
      confidenceMeta.extractorUsed ||
      result?.extraction?.extractorUsed ||
      confidenceMeta.sourceType ||
      "document";

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
      extractorUsed,
    };
  }, [result]);

  if (!safe.hasData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600">No readable data was found in your bill.</p>
          <p className="text-sm text-gray-500 mt-4">
            Try uploading a clearer image or the original PDF from your provider.
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
        doc.text(`Confidence: ${pct}% • Source: ${field.source || "document"}`, 30, y);
        y += 12;
      });

      doc.save("ExplainMyBill_Report.pdf");
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const getConfidenceColor = (confidence) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 85) return "green";
    if (pct >= 60) return "yellow";
    return "red";
  };

  const getConfidenceLabel = (confidence) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 85) return "High confidence";
    if (pct >= 60) return "Moderate confidence";
    return "Low confidence – please double-check";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Trust Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your Bill Explained
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          We’ve carefully read your medical bill and highlighted the most important amounts.
          Everything is processed instantly on a secure server — nothing is stored.
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-green-600 text-xl">✓</span>
            No account needed
          </span>
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-green-600 text-xl">✓</span>
            Your bill is deleted immediately
          </span>
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-green-600 text-xl">✓</span>
            Used by thousands securely
          </span>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setShowConfidenceHelp(true)}
            className="text-indigo-700 underline hover:no-underline"
          >
            How do we calculate confidence?
          </button>
          <button
            onClick={downloadPDF}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 shadow-md"
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Key Amounts – Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {safe.entries.map((field) => {
          const color = getConfidenceColor(field.confidence || 0);
          const label = getConfidenceLabel(field.confidence || 0);
          const pct = Math.round((field.confidence || 0) * 100);

          return (
            <div
              key={field.label}
              className="bg-white rounded-2xl shadow-lg p-8 border-t-8"
              style={{
                borderTopColor:
                  color === "green"
                    ? "#10b981"
                    : color === "yellow"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {field.label}
              </h3>

              <p className="text-4xl font-bold text-gray-900 mb-6">
                {field.value}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          color === "green"
                            ? "#10b981"
                            : color === "yellow"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{label}</p>
                </div>

                {field.reason && (
                  <p className="text-xs text-gray-500 italic">{field.reason}</p>
                )}

                {/* Evidence Citations */}
                {Array.isArray(field.citations) && field.citations.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      We found this amount here:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {field.citations.slice(0, 3).map((c, i) => (
                        <li key={i} className="font-mono break-words">
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex justify-between items-center text-left"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            What this bill means in plain English
          </h2>
          <span className="text-3xl text-gray-400">
            {showExplanation ? "−" : "+"}
          </span>
        </button>

        {showExplanation && (
          <div className="mt-6 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              {safe.summary}
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-gray-800 leading-relaxed">
                {safe.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => setShowNextSteps(!showNextSteps)}
          className="w-full flex justify-between items-center text-left"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Suggested next steps
          </h2>
          <span className="text-3xl text-gray-400">
            {showNextSteps ? "−" : "+"}
          </span>
        </button>

        {showNextSteps && (
          <ul className="mt-6 space-y-4">
            {safe.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-lg">{step}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Raw Text Toggle (for trust) */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="text-indigo-700 font-medium hover:underline"
        >
          {showRawText
            ? "← Hide the full extracted text"
            : "Show the full text we read from your bill (for verification)"}
        </button>

        {showRawText && (
          <pre className="mt-4 p-6 bg-white rounded-xl text-sm text-gray-600 overflow-x-auto border">
            {safe.rawText || "No raw text available."}
          </pre>
        )}
      </div>

      {/* Confidence Help Modal */}
      {showConfidenceHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-4">How Confidence Works</h3>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0"></span>
                <div>
                  <strong>High (85%+)</strong>: Clear label + exact match + strong evidence
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-yellow-500 rounded-full flex-shrink-0"></span>
                <div>
                  <strong>Moderate (60–84%)</strong>: Good match but from image OCR or less clear label
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0"></span>
                <div>
                  <strong>Low (&lt;60%)</strong>: Possible match but uncertain — always double-check
                </div>
              </li>
            </ul>
            <button
              onClick={() => setShowConfidenceHelp(false)}
              className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 mt-12">
        <p>
          ExplainMyBill is an educational tool • Not medical or legal advice •
          Not HIPAA-certified
        </p>
        <p className="mt-2">
          Always verify amounts with your provider and insurance before paying.
        </p>
      </div>
    </div>
  );
}
