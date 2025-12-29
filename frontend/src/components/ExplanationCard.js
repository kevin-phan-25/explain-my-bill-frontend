import React, { useState } from "react";
import jsPDF from "jspdf";
import ConfidenceHeatMap from "./ConfidenceHeatMap";
import ConfidenceTooltip from "./ConfidenceTooltip";
import ConfidenceLegendModal from "./ConfidenceLegendModal";
import LowConfidenceFlag from "./LowConfidenceFlag";
import FieldAIExplanation from "./FieldAIExplanation";
import ReportIncorrectAmount from "./ReportIncorrectAmount";
import ConfidenceGate from "./ConfidenceGate";
import DisputeLetterGenerator from "./DisputeLetterGenerator";

export default function ExplanationCard({ result }) {
  const [open, setOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [hovered, setHovered] = useState(null);

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

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6 relative">
      <h2 className="text-3xl font-bold text-center">Your Bill Explained</h2>

      <p className="text-xs text-center text-gray-500">
        Educational use only. No medical, legal, or billing advice. Files are
        processed transiently and never stored.
      </p>

      <button
        onClick={() => setShowLegend(true)}
        className="text-sm text-indigo-600 underline text-center block"
      >
        What do confidence scores mean?
      </button>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(keyAmounts).map(([k, v]) => {
          if (!v || typeof v !== "object") return null;

          return (
            <div
              key={k}
              className="bg-indigo-100 rounded-xl p-4 text-center relative"
              onMouseEnter={() => setHovered(k)}
              onMouseLeave={() => setHovered(null)}
            >
              <p className="text-sm capitalize">
                {k.replace(/([A-Z])/g, " $1")}
              </p>

              <ConfidenceGate confidence={v.confidence}>
                <p className="text-xl font-bold">{v.value || "—"}</p>
              </ConfidenceGate>

              <p className="text-xs text-gray-600 mt-1">
                {Math.round((v.confidence || 0) * 100)}% confidence
              </p>

              <LowConfidenceFlag confidence={v.confidence} />
              <FieldAIExplanation explanation={v.aiExplanation} />

              <ReportIncorrectAmount field={k} value={v.value} />
              <DisputeLetterGenerator
                field={k}
                value={v.value}
                confidence={v.confidence}
              />

              {hovered === k && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2">
                  <ConfidenceTooltip
                    confidence={v.confidence}
                    source={v.source}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfidenceHeatMap keyAmounts={keyAmounts} />

      <button
        onClick={() => setOpen(!open)}
        className="font-bold flex justify-between w-full"
      >
        Explanation <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-2">
          {points.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
          <p className="whitespace-pre-wrap">{explanation}</p>

          {nextSteps.length > 0 && (
            <>
              <p className="font-bold mt-2">Next Steps:</p>
              {nextSteps.map((s, i) => (
                <p key={i}>• {s}</p>
              ))}
            </>
          )}
        </div>
      )}

      {showLegend && (
        <ConfidenceLegendModal onClose={() => setShowLegend(false)} />
      )}
    </div>
  );
}
