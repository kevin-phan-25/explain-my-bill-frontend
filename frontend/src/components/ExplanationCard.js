import React, { useState } from "react";
import jsPDF from "jspdf";

export default function ExplanationCard({ result, onUpgrade }) {
  const [open, setOpen] = useState(true);
  if (!result) return null;

  const { pages = [], isPaid } = result;
  const structured = pages[0]?.structured || {};
  const explanation = pages.map(p => p.explanation).join("\n\n");

  const keyAmounts = structured.keyAmounts || {};
  const points = structured.summaryPoints || [];
  const potentialSavings = structured.potentialSavings;

  const toggle = () => setOpen(prev => !prev);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text("Bill Review", 20, y); y += 20;
    ["Total Billed", "Insurance Paid", "You Owe"].forEach((l,i)=>{
      const v = i===0 ? keyAmounts.totalCharges : i===1 ? keyAmounts.insurancePaid : keyAmounts.patientResponsibility || "—";
      doc.text(`${l}: ${v}`, 30, y); y+=12;
    });
    y+=20; doc.setFontSize(14); doc.text("Explanation",20,y); y+=12; doc.setFontSize(10);
    explanation.split("\n").forEach(line=>{ if(y>280){doc.addPage();y=20} doc.text(line,20,y); y+=8; });
    doc.save("bill.pdf");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-gradient bg-clip-text text-transparent from-indigo-500 to-purple-500">Your Review</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", value: keyAmounts.totalCharges, color: "blue" },
          { label: "Insurance Paid", value: keyAmounts.insurancePaid, color: "green" },
          { label: "You Owe", value: keyAmounts.patientResponsibility, color: "orange" },
          { label: "Savings", value: potentialSavings || (isPaid ? "Calculated" : "Upgrade"), color: "purple" },
        ].map((card,i)=>(
          <div key={i} className={`bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-xl p-5 text-center`}>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-2xl font-bold">{card.value || "—"}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
        <button onClick={toggle} className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">Explanation</h2>
          <span className="text-2xl">{open ? "−" : "+"}</span>
        </button>
        {open && (
          <div className="mt-4 space-y-3 text-base prose prose-sm dark:prose-invert max-w-none">
            {points.map((p,i)=><p key={i}>• {p}</p>)}
            {explanation.split("\n\n").map((p,i)=>p.trim() && <p key={i}>{p.trim()}</p>)}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={downloadPDF} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition">Download PDF</button>
        {!isPaid && <button onClick={onUpgrade} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition">Unlock Full</button>}
      </div>
    </div>
  );
}
