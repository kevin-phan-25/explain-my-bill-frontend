import React from "react";

export default function ConfidenceLegendModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-center">
          Confidence Score Guide
        </h2>

        <div className="space-y-3 text-sm">
          <p>🟢 <strong>80–100%</strong> — Very reliable extraction</p>
          <p>🟡 <strong>50–79%</strong> — Likely correct, verify if important</p>
          <p>🔴 <strong>Below 50%</strong> — May be incorrect or incomplete</p>
        </div>

        <p className="text-gray-600 text-sm">
          Confidence is calculated using text clarity, document structure,
          keyword proximity, and AI agreement.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
