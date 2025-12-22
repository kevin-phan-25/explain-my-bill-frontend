import React, { useState } from 'react';
import { createCheckoutSession } from '../api/explainApi';

export default function UpgradeModal({ onClose, stripePromise }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (plan) => {
    setLoading(true);
    setError('');

    try {
      const result = await createCheckoutSession(plan);
      if (!result.success) throw new Error(result.error);

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: result.sessionId,
      });

      if (stripeError) throw stripeError;
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full p-10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl"
          disabled={loading}
        >
          ×
        </button>

        <h2 className="text-4xl font-bold mb-6 text-center">Unlock Full Explanation</h2>
        <p className="text-xl text-gray-600 text-center mb-10">
          Get the complete, detailed breakdown of every charge, code, and total.
        </p>

        {error && (
          <p className="text-red-600 text-center mb-6 text-lg">{error}</p>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <button
            onClick={() => handlePayment('one-time')}
            disabled={loading}
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-8 rounded-2xl font-bold text-2xl hover:scale-105 transition disabled:opacity-70"
          >
            <div>One-Time</div>
            <div className="text-4xl mt-2">$9.99</div>
            <div className="text-lg mt-4">Full access forever</div>
            {loading && <div className="mt-4 text-sm">Processing...</div>}
          </button>

          <button
            onClick={() => handlePayment('monthly')}
            disabled={loading}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white py-8 rounded-2xl font-bold text-2xl hover:scale-105 transition disabled:opacity-70"
          >
            <div>Monthly</div>
            <div className="text-4xl mt-2">$4.99/mo</div>
            <div className="text-lg mt-4">Unlimited bills</div>
            {loading && <div className="mt-4 text-sm">Processing...</div>}
          </button>
        </div>

        <p className="text-center text-gray-500">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
