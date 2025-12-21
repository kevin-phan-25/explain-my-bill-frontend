import React from "react";

export default function ExplanationCard({ explanation, isPaid }) {
  return (
    <div className="result-card animate-fadeIn">
      <h2 className="result-title">Bill Explanation</h2>
      <p>{explanation}</p>
      {!isPaid && (
        <p className="upgrade-text">
          Upgrade to get the full detailed explanation.
        </p>
      )}
    </div>
  );
}
