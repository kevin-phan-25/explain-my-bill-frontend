import React from "react";

export default function ConfidenceGate({ confidence, children }) {
  if (confidence == null || confidence >= 0.5) {
    return children;
  }

  return (
    <div className="border border-yellow-300 bg-yellow-50 rounded-xl p-4">
      <p className="text-sm font-semibold text-yellow-800">
        ⚠️ Low confidence extraction
      </p>
      <p className="text-xs text-yellow-700 mt-1">
        This value may be incomplete or incorrect.  
        Please verify against your original bill.
      </p>

      <div className="mt-3 opacity-60">{children}</div>
    </div>
  );
}
