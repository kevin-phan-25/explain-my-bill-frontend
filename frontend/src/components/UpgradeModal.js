// src/components/UpgradeModal.js
import React, { useState } from "react";
import { createCheckoutSession } from "../api/explainApi";
import { motion } from "framer-motion";

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
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        className="glass-card max-w-lg w-full p-8 relative rounded-2xl shadow-2xl"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Unlock Full Power</h2>
        <p className="text-center text-gray-600 mb-8">
          Get red flags, appeal letters, savings estimates, and more.
        </p>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
        >
          <button
            onClick={() => handlePayment("one-time")}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "One-Time Access • $17.99"}
          </button>

          <button
            onClick={() => handlePayment("monthly")}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Unlimited Monthly • $9.99/mo"}
          </button>
        </motion.div>

        <motion.button
          onClick={onClose}
          className="mt-6 text-center w-full text-gray-500 hover:text-gray-700 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
        >
          Maybe later
        </motion.button>
      </motion.div>
    </div>
  );
}
