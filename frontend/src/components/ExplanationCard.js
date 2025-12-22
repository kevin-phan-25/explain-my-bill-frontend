// src/components/ExplanationCard.js (Full File — Updated)

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, features, isPaid } = result;

  const mainContent = explanation?.trim() || null;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Full Explanation Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center justify-center">
          <span className="text-5xl mr-4">🔍</span> 
          Your Complete Bill Explanation
        </h3>
        <div className="text-lg text-indigo-800 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-xl shadow-inner border border-indigo-200">
          {mainContent ? (
            mainContent
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl text-red-600 font-bold mb-4">No explanation generated</p>
              <p className="text-gray-700">
                This can happen if:
                <ul className="mt-4 text-left max-w-md mx-auto">
                  <li>• The bill image was too blurry or low-contrast</li>
                  <li>• The text couldn't be extracted properly</li>
                  <li>• The bill is a screenshot with overlays</li>
                </ul>
              </p>
              <p className="mt-6 text-gray-600">
                Try uploading a clearer photo or PDF, or use one of the sample bills below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Premium features for samples */}
      {features && <PaidFeatures features={features} />}

      {/* Upgrade for real users */}
      {!isPaid && (
        <div className="text-center mt-12">
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-6 px-16 rounded-3xl text-2xl shadow-2xl transition transform hover:scale-105"
          >
            Unlock More Insights & Savings Tools
          </button>
        </div>
      )}
    </div>
  );
}
