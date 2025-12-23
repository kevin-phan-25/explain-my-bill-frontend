import React from "react";

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const page = result?.pages?.[0]?.structured;
  const isPaid = result.isPaid;

  return (
    <div className="mt-10 space-y-6">
      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <SummaryBox label="Total Charges" value={page?.keyAmounts?.totalCharges} color="blue" />
        <SummaryBox label="Insurance Paid" value={page?.keyAmounts?.insurancePaid} color="green" />
        <SummaryBox label="You May Owe" value={page?.keyAmounts?.patientResponsibility} color="red" />
      </div>

      {/* EXPLANATION */}
      <div className="bg-white rounded-xl p-6 shadow text-gray-800">
        <h3 className="font-bold mb-2">What this bill means</h3>
        <p>{page?.summary || "This bill includes medical services and insurance adjustments."}</p>
      </div>

      {/* RED FLAGS */}
      {page?.redFlags?.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl">
          <h4 className="font-bold mb-2">Things worth double-checking</h4>
          <ul className="list-disc list-inside text-sm">
            {page.redFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* NEXT STEPS */}
      <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-xl">
        <h4 className="font-bold mb-2">Next steps you can take</h4>
        <ul className="list-disc list-inside text-sm">
          {(page?.nextSteps || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {/* UPGRADE */}
      {!isPaid && (
        <div className="text-center pt-6">
          <button
            onClick={onUpgrade}
            className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold"
          >
            Unlock detailed review & appeal tools
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryBox({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold text-${color}-700`}>
        {value || "—"}
      </p>
    </div>
  );
}
