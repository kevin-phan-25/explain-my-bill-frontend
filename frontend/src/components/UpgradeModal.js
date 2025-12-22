import React, { useState } from 'react';
import { createCheckoutSession } from '../api/explainApi';
import { motion } from 'framer-motion';

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        className="glass-card max-w-lg w-full p-8 relative"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Unlock Full Power</h2>
        <p className="text-center text-gray-600 mb-8">
          Get red flags, appeal letters, savings estimates, insurance insights, and more.
        </p>

        {/* Free TL;DR Highlight */}
        <motion.div
          className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl mb-6 shadow-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }}
        >
          <p className="text-lg font-semibold text-amber-900">
            🔹 Your free TL;DR summary gives a quick explanation instantly. Upgrade to see the full details!
          </p>
        </motion.div>

        {/* Payment Buttons */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
        >
          <button
            onClick={() => handlePayment('one-time')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg"
          >
            One-Time Access • $17.99
          </button>

          <button
            onClick={() => handlePayment('monthly')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg"
          >
            Unlimited Monthly • $9.99/mo
          </button>
        </motion.div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="mt-6 text-center w-full text-gray-500 hover:text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
        >
          Maybe later
        </motion.button>
      </motion.div>
    </div>
  );
}
