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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-pink-600 p-1 shadow-2xl">
        <div className="bg-white rounded-[26px] p-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Your Bill Explained
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                We read your bill carefully. Nothing is stored — your privacy is 100% protected.
              </p>
            </div>
            <button
              onClick={onAnalyzeAnother || (() => location.reload())}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition"
            >
              ← Analyze Another Bill
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-10">
            {["No account needed", "Deleted instantly", "Evidence shown"].map((t, i) => (
              <div key={i} className="flex items-center gap-4 bg-green-50 px-6 py-4 rounded-2xl">
                <span className="text-3xl">✓</span>
                <span className="font-semibold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Amounts */}
      <div className="grid md:grid-cols-3 gap-8">
        {safe.entries.map(field => {
          const style = getStyle(field.confidence);
          const pct = Math.round((field.confidence || 0) * 100);

          return (
            <div key={field.label} className="bg-white rounded-3xl shadow-2xl p-8 border-t-8" style={{ borderTopColor: style.color }}>
              <h3 className="text-2xl font-bold text-gray-700">{field.label}</h3>
              <p className="text-5xl font-black text-gray-900 mt-4 mb-8">{field.value}</p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-lg mb-2">
                    <span>Confidence</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: style.color }} />
                  </div>
                  <p className="mt-3 font-medium text-gray-700">{style.label}</p>
                </div>

                {field.citations?.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="font-semibold mb-3">We found this on:</p>
                    <ul className="space-y-2 text-sm">
                      {field.citations.slice(0, 3).map((c, i) => (
                        <li key={i} className="font-mono bg-white p-3 rounded-lg border">
                          Line {c.line}: “…{c.text}…”
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

      {/* Explanation & Next Steps */}
      <div className="space-y-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-6">In Plain English</h2>
          <div className="bg-gradient-to-r from-indigo-50 to-pink-50 border-l-8 border-indigo-600 p-8 rounded-r-2xl text-lg leading-relaxed">
            <p className="font-semibold mb-4">{safe.summary}</p>
            <p>{safe.explanation}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-8">Next Steps</h2>
          <div className="space-y-6">
            {safe.nextSteps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start p-6 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-2xl border border-indigo-100">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-pink-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  {i + 1}
                </div>
                <p className="text-lg leading-relaxed flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Text Toggle */}
      <div className="text-center">
        <button onClick={() => setShowRawText(!showRawText)} className="text-indigo-600 font-bold text-lg hover:underline">
          {showRawText ? "Hide" : "Show"} full extracted text for verification
        </button>
        {showRawText && <pre className="mt-6 p-8 bg-gray-100 rounded-2xl text-sm overflow-x-auto">{safe.rawText}</pre>}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-16">
        <p>Educational tool • Not medical or legal advice • Not HIPAA-certified</p>
        <p className="mt-2">Always confirm with your provider and insurer before paying.</p>
      </div>
    </div>
  );
}
