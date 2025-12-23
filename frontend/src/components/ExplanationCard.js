import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const {
    explanation,
    fullExplanation,
    features,
    isPaid,
  } = result;

  const mainContent =
    explanation?.trim() ||
    fullExplanation?.trim() ||
    null;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      <div className="bg-gray-50 border-l-8 border-gray-700 rounded-2xl p-10 shadow-2xl">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center">
          <span className="text-5xl mr-4">📋</span>
          Your Bill Review
        </h3>

        <p className="text-xl text-gray-700 leading-relaxed text-center mb-8 max-w-4xl mx-auto">
          We reviewed your medical bill line by line. Below is a clear, honest breakdown of what it means — including charges, insurance adjustments, and what you actually owe.
        </p>

        {mainContent ? (
          <>
            <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 mb-10 shadow-lg">
              <h4 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">✅</span> What We Found
              </h4>
              <p className="text-lg text-blue-800 leading-relaxed">
                Your bill includes medical services, insurance processing, and your final responsibility.
                We broke it down into plain English so you know exactly what you're being asked to pay — and why.
              </p>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-inner border border-gray-300 text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {mainContent}
            </div>
          </>
        ) : (
          <div className="bg-red-50 p-10 rounded-xl border border-red-400 text-center">
            <p className="text-2xl font-bold text-red-800 mb-4">
              We could not read your bill clearly
            </p>
            <p className="text-gray-700 text-lg">
              Please upload a clean PDF or image.
            </p>
          </div>
        )}
      </div>

      {features && <PaidFeatures features={features} />}

      {!isPaid && mainContent && (
        <div className="text-center mt-16">
          <button
            onClick={onUpgrade}
            className="bg-red-600 text-white px-10 py-5 rounded-2xl text-xl font-bold"
          >
            Get My Full Review
          </button>
        </div>
      )}
    </div>
  );
}
