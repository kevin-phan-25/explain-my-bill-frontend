import React from "react";

export default function ConfidenceTooltip({ confidence, source }) {
  if (confidence == null) return null;

  let reason = "High confidence extraction.";
  if (confidence < 0.5) {
    reason =
      "Low confidence due to blurry text, OCR errors, or multiple conflicting values.";
  } else if (confidence < 0.8) {
    reason =
      "Moderate confidence. Detected correctly but may require verification.";
  }

  return (
    <div className="absolute z-20 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-lg">
      <p className="font-bold mb-1">
        Confidence: {Math.round(confidence * 100)}%
      </p>
      <p>{reason}</p>
      {source && <p className="mt-1 text-gray-300">Source: {source}</p>}
    </div>
  );
}
