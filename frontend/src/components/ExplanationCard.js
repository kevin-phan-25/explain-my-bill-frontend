// frontend/src/components/ExplanationCard.js

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, tldr, features, isPaid } = result;

  // For real Worker: use explanation as the main content
  // For samples: use tldr + features
  const displayTldr = tldr || (explanation ? explanation.substring(0, 500) + (explanation.length > 500 ? "..." : "") : "No summary available.");

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* TL;DR Section */}
      <div className="bg-yellow-50 border-l-8 border-amber-400 rounded-2xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center">
          <span className="text-4xl mr-4 animate-pulse">💡</span> 
          {isPaid ? "Full TL;DR" : "Your Free TL;DR"}
        </h3>
        <p className="text-lg text-amber-800 whitespace-pre-wrap">
          {displayTldr}
        </p>
        {!isPaid && (
          <button
            onClick={onUpgrade}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-xl font-bold transition transform hover:scale-105"
          >
            Unlock Full Detailed Analysis
          </button>
        )}
      </div>

      {/* Full Paid Content */}
      {isPaid && (
        <>
          {/* Real bill: show full AI explanation */}
          {explanation && !features && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-8 border-blue-600 rounded-2xl p-8 shadow-xl mb-8">
              <h4 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">📄</span> Complete Bill Breakdown
              </h4>
              <div className="text-lg text-blue-800 leading-relaxed whitespace-pre-wrap bg-white p-6 rounded-xl shadow-inner">
                {explanation}
              </div>
            </div>
          )}

          {/* Sample bills: show rich premium features */}
          {features && <PaidFeatures features={features} />}
        </>
      )}
    </div>
  );
}
