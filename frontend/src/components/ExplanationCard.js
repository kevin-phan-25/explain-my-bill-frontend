// src/components/ExplanationCard.js

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, features, isPaid } = result;

  const mainContent = explanation?.trim() || null;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Extracted Bill Text — Professional, Trust-Focused */}
      <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 shadow-xl mb-10">
        <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
          <span className="text-4xl mr-4">📄</span> 
          What Your Bill Says
        </h3>
        <p className="text-lg text-green-800 italic mb-4">
          We carefully reviewed your uploaded bill. Here's the breakdown:
        </p>
        {mainContent ? (
          <div className="bg-white p-6 rounded-xl shadow-inner border border-green-200 text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
            {mainContent}
          </div>
        ) : (
          <div className="bg-red-50 p-6 rounded-xl border border-red-300">
            <p className="text-red-700 font-bold text-lg">
              We couldn't clearly read your bill.
            </p>
            <p className="text-gray-700 mt-3">
              This can happen with low-quality scans or screenshots.
            </p>
            <p className="text-gray-600 mt-4">
              Please try:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>A clearer, well-lit photo</li>
                <li>A PDF version of the bill</li>
                <li>Higher resolution image</li>
                <li>One of the sample bills below</li>
              </ul>
            </p>
          </div>
        )}
      </div>

      {/* Premium Features (Red Flags, Savings, Appeal Letter) */}
      {features && <PaidFeatures features={features} />}

      {/* Upgrade Button — Only if not paid and content exists */}
      {!isPaid && mainContent && (
        <div className="text-center mt-12">
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-6 px-16 rounded-3xl text-2xl shadow-2xl transition transform hover:scale-105"
          >
            Unlock Red Flags, Savings Estimates & Appeal Letter
          </button>
          <p className="mt-4 text-gray-600 text-lg">
            Get expert insights to save money and fight unfair charges
          </p>
        </div>
      )}
    </div>
  );
}
