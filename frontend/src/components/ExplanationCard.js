import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  return (
    <div className="mt-12 space-y-12">
      {/* Quick Summary (Free TL;DR) */}
      {result.quickSummary && (
        <div className="bg-yellow-50 border-l-8 border-yellow-400 rounded-2xl p-8 shadow-xl">
          <h3 className="text-3xl font-bold text-yellow-800 mb-4 flex items-center">
            <span className="text-4xl mr-4">📝</span> Quick Summary
          </h3>
          <p className="text-lg text-yellow-700 leading-relaxed">
            {result.quickSummary}
          </p>
          {!result.isPaid && (
            <p className="mt-4 text-sm text-yellow-800 font-semibold">
              Upgrade to unlock full explanations, red flags, appeal letters, and potential savings.
            </p>
          )}
        </div>
      )}

      {/* Paid Features */}
      {result.isPaid ? (
        <PaidFeatures features={result.paidFeatures} />
      ) : (
        <div className="text-center mt-12">
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-10 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition transform"
          >
            Unlock Full Insights
          </button>
        </div>
      )}
    </div>
  );
}
