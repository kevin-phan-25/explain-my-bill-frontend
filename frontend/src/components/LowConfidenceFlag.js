import React from "react";

export default function LowConfidenceFlag({ confidence }) {
  if (confidence == null || confidence >= 0.5) return null;

  return (
    <div className="mt-1 text-xs text-red-700 flex items-center gap-1">
      ⚠️ <span>Low confidence — verify this amount</span>
    </div>
  );
}
