import React from "react";

function confidenceColor(c) {
  if (c >= 0.8) return "bg-green-500";
  if (c >= 0.5) return "bg-yellow-400";
  return "bg-red-500";
}

function confidenceLabel(c) {
  if (c >= 0.8) return "High confidence";
  if (c >= 0.5) return "Medium confidence";
  return "Low confidence";
}

export default function ConfidenceHeatMap({ keyAmounts }) {
  if (!keyAmounts || typeof keyAmounts !== "object") return null;

  const entries = Object.entries(keyAmounts).filter(
    ([_, v]) => v && typeof v === "object" && "confidence" in v
  );

  if (entries.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-bold text-center">Confidence by Field</h3>

      {entries.map(([key, data]) => {
        const pct = Math.round((data.confidence || 0) * 100);

        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <span>{pct}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`${confidenceColor(
                  data.confidence
                )} h-3 transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-gray-600">
              {confidenceLabel(data.confidence)}
              {data.source && ` • Source: ${data.source}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
