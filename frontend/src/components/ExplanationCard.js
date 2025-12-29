import React, { useState } from "react";
import jsPDF from "jspdf";
import ConfidenceHeatMap from "./ConfidenceHeatMap";

export default function ExplanationCard({ result }) {
  const [open, setOpen] = useState(true);

  if (!result?.pages?.length) {
    return <p className="text-center">No data returned.</p>;
  }

  const page = result.pages[0];
  const structured = page.structured || {};
  const explanation =
    structured.explanation || result.explanation || "No explanation available.";
  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];
  const nextSteps = structured.nextSteps || [];

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text("Bill Explanation", 20, y);
    y += 15;

    Object.entries(keyAmounts).forEach(([k, v]) => {
      if (!v || typeof v !== "object") return;

      const line = `${k}: ${v.value || "—"} (${Math.round(
        (v.confidence || 0) * 100
      )}% confidence)`;

      doc.splitTextToSize(line, 170).forEach((l) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(l, 20, y);
        y += 8;
      });
      y += 4;
    });

    y += 10;

    explanation.split("\n").forEach((line) => {
      doc.splitTextToSize(line, 170).forEach((l) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(l, 20, y);
        y += 8;
      });
    });

    if (points.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text("Summary Points:", 20, y);
      y += 8;

      points.forEach((p) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text("• " + p, 20, y);
        y += 7;
      });
    }

    if (nextSteps.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text("Next Steps:", 20, y);
      y += 8;

      nextSteps.forEach((step) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text("• " + step, 20, y);
        y += 7;
      });
    }

    doc.save("bill-explanation.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-3xl font-bold text-center">Your Bill Explained</h2>

      {/* Key Amounts */}
      {Object.keys(keyAmounts).length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(keyAmounts).map(([k, v]) => {
            if (!v || typeof v !== "object") return null;
            return (
              <div
                key={k}
                className="bg-indigo-100 rounded-xl p-4 text-center"
              >
                <p className="text-sm capitalize">
                  {k.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xl font-bold">{v.value || "—"}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((v.confidence || 0) * 100)}% confidence
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔥 Confidence Heat Map */}
      <ConfidenceHeatMap keyAmounts={keyAmounts} />

      <button
        onClick={() => setOpen(!open)}
        className="font-bold flex justify-between w-full"
      >
        Explanation <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-2">
          {points.length > 0 &&
            points.map((p, i) => <p key={i}>• {p}</p>)}

          <p className="whitespace-pre-wrap">{explanation}</p>

          {nextSteps.length > 0 && (
            <>
              <p className="font-bold mt-2">Next Steps:</p>
              {nextSteps.map((step, i) => (
                <p key={i}>• {step}</p>
              ))}
            </>
          )}
        </div>
      )}

      <button
        onClick={downloadPDF}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl"
      >
        Download PDF
      </button>
    </div>
  );
}
