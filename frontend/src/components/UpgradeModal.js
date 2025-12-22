import React from 'react';
import { createCheckoutSession } from '../api/explainApi';

export default function UpgradeModal({ onClose, stripePromise }) {
  const handlePayment = async (plan) => {
    try {
      const { id } = await createCheckoutSession(plan);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      alert("Payment error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-8">
        <h2 className="text-3xl font-bold mb-6">Unlock Full Explanation</h2>
        <p className="text-gray-600 mb-8">
          Get the complete, detailed breakdown of every charge, code, and total on your bill.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handlePayment('one-time')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            One-Time<br />$9.99
          </button>
          <button
            onClick={() => handlePayment('monthly')}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            Monthly<br />$4.99/mo
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
