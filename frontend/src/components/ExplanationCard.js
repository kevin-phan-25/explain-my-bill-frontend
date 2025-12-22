import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const {
    tldr,
    cptExplanations,
    redFlags,
    estimatedSavings,
    appealLetter,
    customAdvice,
    isPaid
  } = result;

  return (
    <div className="mt-12 space-y-12">

      {/* TL;DR Summary */}
      <div className="bg-white border-l-8 border-blue-500 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:scale-[1.01]">
        <h3 className="text-3xl font-bold text-blue-900 mb-4 flex items-center">
          <span className="text-4xl mr-4">📝</span> Quick TL;DR
        </h3>
        <p className="text-xl text-gray-700">{tldr}</p>

        {!isPaid && (
          <div className="mt-6 text-center">
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition transform text-lg"
            >
              Unlock Full Features →
            </button>
            <p className="mt-2 text-gray-500 text-sm">Upgrade to see detailed explanations, red flags, and money-saving tips.</p>
          </div>
        )}
      </div>

      {/* Paid Features */}
      {isPaid && (
        <PaidFeatures features={{ cptExplanations, redFlags, estimatedSavings, appealLetter, customAdvice }} />
      )}

      {/* If user hasn't paid, show sample paid features preview */}
      {!isPaid && (
        <div className="mt-12 space-y-10">
          <h3 className="text-4xl font-bold text-center text-blue-900 mb-10">
            Premium Insights Preview
          </h3>

          {/* CPT Codes Preview */}
          {cptExplanations?.length > 0 && (
            <div className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-8 shadow-xl opacity-60">
              <h4 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="text-4xl mr-4">📋</span> CPT Codes Explained
              </h4>
              <ul className="space-y-3 text-lg text-purple-700 list-disc list-inside">
                {cptExplanations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags Preview */}
          {redFlags?.length > 0 && (
            <div className="bg-red-50 border-l-8 border-red-600 rounded-2xl p-8 shadow-xl opacity-60">
              <h4 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                <span className="text-4xl mr-4">⚠️</span> Red Flags Found
              </h4>
              <ul className="space-y-3 text-lg text-red-700 list-disc list-inside">
                {redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Savings Preview */}
          {estimatedSavings && (
            <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 shadow-xl opacity-60">
              <h4 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="text-4xl mr-4">💰</span> Potential Savings
              </h4>
              <p className="text-3xl font-bold text-green-700">{estimatedSavings.potentialSavings}</p>
              <p className="text-lg text-green-700 mt-3">{estimatedSavings.reason}</p>
            </div>
          )}

          {/* Appeal Letter Preview */}
          {appealLetter && (
            <div className="bg-indigo-50 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-xl opacity-60">
              <h4 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                <span className="text-4xl mr-4">✉️</span> Ready-to-Send Appeal Letter
              </h4>
              <pre className="whitespace-pre-wrap text-lg bg-white p-6 rounded-xl border">{appealLetter}</pre>
            </div>
          )}

          {/* Custom Advice Preview */}
          {customAdvice && (
            <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 shadow-xl opacity-60 text-center">
              <h4 className="text-2xl font-bold text-blue-800 mb-4">💡 Next Steps</h4>
              <p className="text-xl text-blue-700 leading-relaxed">{customAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
