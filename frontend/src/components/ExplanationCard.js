// frontend/src/components/ExplanationCard.js

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, tldr, features, isPaid } = result;

  const mainContent = explanation || tldr || "No explanation generated.";

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Full Explanation */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center justify-center">
          <span className="text-5xl mr-4">🔍</span> 
          Your Complete Bill Explanation
        </h3>
        <div className="text-lg text-indigo-800 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-xl shadow-inner border border-indigo-200">
          {mainContent}
        </div>
      </div>

      {/* Rich features for sample bills */}
      {features && <PaidFeatures features={features} />}

      {/* UPGRADE BUTTON — NOW MUCH MORE PROMINENT */}
      {!isPaid && (
        <div className="text-center mt-12 mb-8">
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 text-white font-extrabold py-6 px-16 rounded-3xl text-3xl shadow-2xl transition-all transform hover:scale-110 hover:-translate-y-2 active:scale-105"
            style={{ boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4)' }}
          >
            🔓 Unlock Full Insights & Savings Tools
          </button>
          <p className="text-gray-600 mt-4 text-lg">
            Get red flags, appeal letters, estimated savings, and more
          </p>
        </div>
      )}
    </div>
  );
}
