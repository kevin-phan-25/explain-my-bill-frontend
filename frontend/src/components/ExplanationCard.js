import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, tldr, features, isPaid } = result;

  // Real bill: explanation is the full AI response
  // Sample bill: tldr + features
  const mainContent = explanation || tldr || "No explanation generated.";

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* TL;DR Section */}
      <div className="bg-yellow-50 border-l-8 border-amber-400 rounded-2xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center">
          <span className="text-4xl mr-4 animate-pulse">💡</span> 
          {isPaid ? "Full TL;DR" : "Your Free TL;DR"}
        </h3>
        <p className="text-lg text-amber-800 whitespace-pre-wrap">
          {isPaid 
            ? mainContent 
            : mainContent.length > 400 
              ? mainContent.substring(0, 400) + "..." 
              : mainContent
          }
        </p>
        {!isPaid && (
          <div className="mt-6 text-center">
            <button
              onClick={onUpgrade}
              className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Unlock Full Detailed Explanation
            </button>
          </div>
        )}
      </div>

      {/* Full Paid Content */}
      {isPaid && (
        <>
          {/* Real bill: show full explanation */}
          {explanation && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-2xl">
              <h4 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center justify-center">
                <span className="text-5xl mr-4">🔍</span> Complete AI Analysis
              </h4>
              <div className="text-lg text-indigo-800 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-xl shadow-inner border border-indigo-200">
                {explanation}
              </div>
            </div>
          )}

          {/* Sample bills: show rich features */}
          {features && <PaidFeatures features={features} />}
        </>
      )}
    </div>
  );
}
