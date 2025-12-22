import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { tldr, features, isPaid } = result;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* TL;DR */}
      <div className="bg-yellow-50 border-l-8 border-amber-400 rounded-2xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center">
          <span className="text-4xl mr-4 animate-pulse">💡</span> {isPaid ? "Full TL;DR" : "Your Free TL;DR"}
        </h3>
        <p className="text-lg text-amber-800">
          {tldr || "No TL;DR available."}
        </p>
        {!isPaid && (
          <button
            onClick={onUpgrade}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-xl font-bold transition transform hover:scale-105"
          >
            Unlock Full Details
          </button>
        )}
      </div>

      {/* Paid Features */}
      {isPaid && features && (
        <PaidFeatures features={features} />
      )}
    </div>
  );
}
