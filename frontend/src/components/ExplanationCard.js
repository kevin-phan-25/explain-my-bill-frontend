// src/components/ExplanationCard.js

import React from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  if (!result) return null;

  const { explanation, features, isPaid } = result;

  const mainContent = explanation?.trim() || null;

  return (
    <div className="glass-card mt-12 p-6 shadow-2xl">
      {/* Main Bill Review — Serious, Professional Tone */}
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
            {/* What We Found — Simple Summary for Trust */}
            <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 mb-10 shadow-lg">
              <h4 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">✅</span> What We Found
              </h4>
              <p className="text-lg text-blue-800 leading-relaxed">
                Your bill includes medical services, insurance processing, and your final responsibility. 
                We broke it down into plain English so you know exactly what you're being asked to pay — and why.
              </p>
            </div>

            {/* Full Explanation */}
            <div className="bg-white p-10 rounded-xl shadow-inner border border-gray-300 text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {mainContent}
            </div>

            {/* Next Steps — Actionable Advice */}
            <div className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 mt-10 shadow-lg">
              <h4 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
                <span className="text-4xl mr-4">🎯</span> Your Next Steps
              </h4>
              <ul className="text-lg text-green-800 space-y-3 list-disc list-inside">
                <li>Request an <strong>itemized bill</strong> from your provider if you don't have one</li>
                <li>Compare charges at <a href="https://www.fairhealthconsumer.org" target="_blank" rel="noopener" className="underline font-bold">FairHealthConsumer.org</a> — it's free and shows average costs in your area</li>
                <li>Call your insurance with questions using the claim number on your bill</li>
                <li>If something looks wrong, you have the right to appeal — many people successfully reduce or eliminate charges</li>
              </ul>
            </div>

            {/* Your Rights — Empowerment */}
            <div className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-8 mt-10 shadow-lg text-center">
              <h4 className="text-2xl font-bold text-purple-900 mb-4">
                You Have Rights
              </h4>
              <p className="text-lg text-purple-800 max-w-3xl mx-auto">
                Medical billing errors are common. You do <strong>not</strong> have to accept surprise charges or overbilling. 
                Many patients successfully appeal and save hundreds or thousands. We're here to help you understand and fight back if needed.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-red-50 p-10 rounded-xl border border-red-400 text-center">
            <p className="text-2xl font-bold text-red-800 mb-4">
              We could not read your bill clearly
            </p>
            <p className="text-gray-700 text-lg mb-6">
              This happens when the image is blurry, low-resolution, or has overlays.
            </p>
            <p className="text-gray-600">
              For accurate results, please upload:
              <ul className="mt-4 text-left max-w-md mx-auto space-y-2 list-disc list-inside">
                <li>A sharp, well-lit photo of the bill</li>
                <li>The original PDF (best option)</li>
                <li>A high-resolution scan</li>
              </ul>
            </p>
            <p className="mt-6 text-sm text-gray-500">
              Try one of the sample bills below to see how it works.
            </p>
          </div>
        )}
      </div>

      {/* Premium Insights — Only shown if available (samples or paid) */}
      {features && <PaidFeatures features={features} />}

      {/* Upgrade CTA — Strong, benefit-focused, no hype */}
      {!isPaid && mainContent && (
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Don't Pay Unfair Charges
            </h3>
            <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
              Many bills contain errors, overcharges, or surprise fees. Unlock expert review to spot red flags, estimate savings, and get a ready-to-send appeal letter.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-red-700 hover:bg-gray-100 font-bold py-5 px-12 rounded-2xl text-2xl shadow-xl transition transform hover:scale-105"
            >
              Get My Full Review & Appeal Tools
            </button>
            <p className="mt-6 text-lg opacity-90">
              One-time or unlimited • 30-day money-back guarantee
            </p>
          </div>
        </div>
      )}
    </div>
  );
}