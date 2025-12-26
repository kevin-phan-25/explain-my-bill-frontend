// src/components/ExplanationCard.js
import React, { useState } from "react";
import PaidFeatures from "./PaidFeatures";

export default function ExplanationCard({ result, onUpgrade }) {
  const [openSections, setOpenSections] = useState(["summary"]);

  // Return nothing if result is null or has no meaningful data
  if (!result || (!result.pages?.length && !result.explanation)) return null;

  const { explanation, pages = [], isPaid } = result;

  // Parse structured data
  let mainData = null;
  let fallbackExplanation = null;
  let images = [];

  for (const p of pages) {
    if (p.structured && typeof p.structured === "object") {
      mainData = p.structured;
      images = p.images || []; // capture images if any
      break;
    }
    if (p.explanation) {
      fallbackExplanation = p.explanation;
    }
  }

  if (!mainData && !fallbackExplanation && explanation) {
    fallbackExplanation = explanation;
  }

  if (!mainData && !fallbackExplanation) return null;

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Summary */}
      {mainData?.summary && (
        <div className="mb-4">
          <h2 className="font-bold text-lg cursor-pointer" onClick={() => toggleSection("summary")}>
            Summary
          </h2>
          {openSections.includes("summary") && (
            <p className="mt-2">{mainData.summary}</p>
          )}
        </div>
      )}

      {/* Summary Points */}
      {mainData?.summaryPoints?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("points")}>
            Key Points
          </h3>
          {openSections.includes("points") && (
            <ul className="list-disc list-inside mt-2">
              {mainData.summaryPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Key Amounts */}
      {mainData?.keyAmounts && (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("amounts")}>
            Key Amounts
          </h3>
          {openSections.includes("amounts") && (
            <ul className="mt-2">
              {Object.entries(mainData.keyAmounts).map(([k, v]) => (
                <li key={k}>
                  <span className="font-medium">{k}:</span> {v ?? "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Services */}
      {mainData?.services?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("services")}>
            Services
          </h3>
          {openSections.includes("services") && (
            <ul className="list-disc list-inside mt-2">
              {mainData.services.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Red Flags */}
      {mainData?.redFlags?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("redFlags")}>
            Red Flags
          </h3>
          {openSections.includes("redFlags") && (
            <ul className="list-disc list-inside mt-2">
              {mainData.redFlags.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-md">Attached Images</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Bill Image ${i + 1}`}
                className="w-32 h-32 object-cover rounded shadow"
              />
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {mainData?.explanation || fallbackExplanation ? (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("explanation")}>
            Explanation
          </h3>
          {openSections.includes("explanation") && (
            <p className="mt-2 whitespace-pre-line">
              {mainData?.explanation || fallbackExplanation}
            </p>
          )}
        </div>
      ) : null}

      {/* Next Steps */}
      {mainData?.nextSteps?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-md cursor-pointer" onClick={() => toggleSection("nextSteps")}>
            Next Steps
          </h3>
          {openSections.includes("nextSteps") && (
            <ol className="list-decimal list-inside mt-2">
              {mainData.nextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Paid Upgrade CTA */}
      {!isPaid && onUpgrade && (
        <div className="mt-4">
          <PaidFeatures onUpgrade={onUpgrade} />
        </div>
      )}
    </div>
  );
}
