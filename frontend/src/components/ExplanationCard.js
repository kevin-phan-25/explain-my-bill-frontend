// src/components/ExplanationCard.js

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, features, isPaid } = result;

  // Extracted text is not directly returned — but we can add it later if Worker sends it
  // For now, focus on the AI explanation
  const mainExplanation = explanation?.trim() || null;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Extracted Bill Text (Trust Builder) */}
      <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 shadow-xl mb-10">
        <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
          <span className="text-4xl mr-4">📄</span> 
          What We Read From Your Bill
        </h3>
        <p className="text-lg text-green-800 italic">
          We use AI to carefully extract and read the text from your uploaded bill. Here's what we saw:
        </p>
        <div className="mt-4 bg-white p-6 rounded-xl shadow-inner border border-green-200 text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
          {mainExplanation ? (
            <em>Your bill was successfully read. The full AI explanation is below.</em>
          ) : (
            <p className="text-red-600 font-bold">
              We couldn't clearly read the text from your bill.
            </p>
          )}
        </div>
        {!mainExplanation && (
          <p className="mt-4 text-green-800">
            Tip: Try a clearer photo, higher resolution, or PDF for best results.
          </p>
        )}
      </div>

      {/* AI Explanation */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center justify-center">
          <span className="text-5xl mr-4">🔍</span> 
          Your Complete Bill Explanation
        </h3>
        <div className="text-lg text-indigo-800 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-xl shadow-inner border border-indigo-200">
          {mainExplanation ? (
            mainExplanation
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl text-red-600 font-bold mb-4">No explanation generated</p>
              <p className="text-gray-700 max-w-2xl mx-auto">
                The AI couldn't extract enough readable text from your bill to generate an explanation.
              </p>
              <p className="mt-6 text-gray-600">
                Please try:
                <ul className="mt-4 text-left max-w-md mx-auto space-y-2">
                  <li>• A clearer, well-lit photo</li>
                  <li>• A PDF version of the bill</li>
                  <li>• Higher resolution image</li>
                  <li>• One of the sample bills below for testing</li>
                </ul>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Premium features for sample bills */}
      {features && <PaidFeatures features={features} />}

      {/* Upgrade button for real users */}
      {!isPaid && mainExplanation && (
        <div className="text-center mt-12">
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-6 px-16 rounded-3xl text-2xl shadow-2xl transition transform hover:scale-105"
          >
            Unlock Premium Insights & Savings Tools
          </button>
          <p className="mt-4 text-gray-600 text-lg">
            Get red flags, appeal letters, estimated savings, and more
          </p>
        </div>
      )}
    </div>
  );
}
