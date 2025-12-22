import React from 'react';

export default function PaidFeatures({ features }) {
  return (
    <div className="mt-12 space-y-10">
      <h3 className="text-4xl font-bold text-center text-blue-900 mb-10">
        Premium Insights Just for You
      </h3>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Red Flags */}
        {features.redFlags?.length > 0 && (
          <div className="bg-red-50 border-l-8 border-red-600 rounded-2xl p-8 shadow-xl">
            <h4 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
              <span className="text-4xl mr-4">⚠️</span> Red Flags Found
            </h4>
            <ul className="space-y-3 text-lg text-red-700">
              {features.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estimated Savings */}
        <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 shadow-xl">
          <h4 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
            <span className="text-4xl mr-4">💰</span> Potential Savings
          </h4>
          <p className="text-3xl font-bold text-green-700">{features.estimatedSavings?.potentialSavings || "$200–$800"}</p>
          <p className="text-lg text-green-700 mt-3">{features.estimatedSavings?.reason || "Common overcharges on office visits, labs, and imaging"}</p>
        </div>
      </div>

      {/* Appeal Letter */}
      <div className="bg-indigo-50 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-xl">
        <h4 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
          <span className="text-4xl mr-4">✉️</span> Ready-to-Send Appeal Letter
        </h4>
        <pre className="whitespace-pre-wrap text-lg bg-white p-6 rounded-xl border">
          {features.appealLetter}
        </pre>
      </div>

      {/* Custom Advice */}
      <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 shadow-xl text-center">
        <h4 className="text-2xl font-bold text-blue-800 mb-4">💡 Your Next Steps</h4>
        <p className="text-xl text-blue-700 leading-relaxed">
          {features.customAdvice || "Contact your provider for an itemized bill. Call insurance with CPT codes. Check fairhealthconsumer.org for average costs in your area."}
        </p>
      </div>
    </div>
  );
}
