import React, { useState } from "react";
import jsPDF from "jspdf";

export default function DisputeLetterGenerator({ field, value, confidence }) {
  const [open, setOpen] = useState(false);

  if (!field || confidence == null) return null;

  const generateLetter = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(14);
    doc.text("Billing Inquiry / Dispute Letter", 20, y);
    y += 15;

    doc.setFontSize(11);
    doc.text(
      "This letter is provided for educational purposes only and does not constitute legal advice.",
      20,
      y
    );
    y += 15;

    doc.text("To Whom It May Concern,", 20, y);
    y += 10;

    doc.text(
      `I am writing to request clarification regarding the following charge on my medical bill:`,
      20,
      y
    );
    y += 10;

    doc.text(
      `• Charge: ${field.replace(/([A-Z])/g, " $1")}`,
      20,
      y
    );
    y += 8;

    doc.text(`• Amount listed: ${value}`, 20, y);
    y += 8;

    doc.text(
      `This charge was identified with a confidence score of ${Math.round(
        confidence * 100
      )}%, indicating it may require manual verification.`,
      20,
      y
    );
    y += 12;

    doc.text(
      "I respectfully request an itemized explanation and any supporting documentation related to this charge.",
      20,
      y
    );
    y += 15;

    doc.text("Thank you for your assistance.", 20, y);
    y += 20;

    doc.text("Sincerely,", 20, y);
    y += 10;
    doc.text("[Your Name]", 20, y);

    doc.save("billing-inquiry-letter.pdf");
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-indigo-600 hover:underline"
      >
        {open ? "Hide dispute letter" : "Generate dispute letter"}
      </button>

      {open && (
        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-xs text-gray-700 mb-2">
            This creates a general billing inquiry letter you can customize.
          </p>
          <button
            onClick={generateLetter}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm"
          >
            Download Letter (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
