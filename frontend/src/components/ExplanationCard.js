import React, { useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result }) {
  const [open, setOpen] = useState(true);

  if (!result?.pages?.length) {
    return <p className="text-center">No data returned.</p>;
  }

  const page = result.pages[0];
  const structured = page.structured || {};

  const explanation =
    structured.explanation ||
    result.explanation ||
    "No explanation available.";

  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text("Bill Explanation", 20, y);
    y += 15;

    Object.entries(keyAmounts).forEach(([k, v]) => {
      doc.text(`${k}: ${v || "—"}`, 20, y);
      y += 10;
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;
    explanation.split("\n").forEach((line) => {
      const lines = doc.splitTextToSize(line, 170);
      lines.forEach((subLine) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(subLine, 20, y);
        y += 8;
      });
    });

    doc.save("bill.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-3xl font-bold text-center">Your Bill Explained</h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(keyAmounts).map(([k, v]) => (
          <div key={k} className="bg-indigo-100 rounded-xl p-4 text-center">
            <p className="text-sm">{k}</p>
            <p className="text-xl font-bold">{v || "—"}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="font-bold flex justify-between w-full"
      >
        Explanation <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-2">
          {points.length > 0 && points.map((p, i) => <p key={i}>• {p}</p>)}
          <p className="whitespace-pre-wrap">{explanation}</p>
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
