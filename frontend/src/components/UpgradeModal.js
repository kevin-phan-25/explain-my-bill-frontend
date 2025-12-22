import React, { useState } from 'react';
import { createCheckoutSession } from '../api/explainApi';

export default function UpgradeModal({ onClose, stripePromise }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (plan) => {
    setLoading(true);
    try {
      const { id } = await createCheckoutSession(plan);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      alert("Payment error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-lg w-full p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Unlock Full Power</h2>
        <p className="text-center text-gray-600 mb-8">
          Get red flags, appeal letters, savings estimates, insurance insights, and more.
        </p>

        <div className="space-y-6">
          <button
            onClick={() => handlePayment('one-time')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            One-Time Access • $17.99
          </button>

          <button
            onClick={() => handlePayment('monthly')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            Unlimited Monthly • $9.99/mo
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-center w-full text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
