import React, { useState } from 'react';
import PaidFeatures from './PaidFeatures';
import { motion } from 'framer-motion';

export default function ExplanationCard({ result, onUpgrade }) {
  const [showPaid, setShowPaid] = useState(result.isPaid);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="glass-card mt-12 p-6 shadow-2xl"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      {/* TL;DR Section */}
      <div className="bg-yellow-50 border-l-8 border-yellow-500 rounded-2xl p-6 shadow-inner mb-6">
        <h4 className="text-2xl font-bold text-yellow-800 mb-3 flex items-center">
          <span className="text-4xl mr-3 animate-pulse">⚡</span>
          {showPaid ? "Your Full Explanation" : "Quick TL;DR"}
        </h4>
        <p className="text-lg text-yellow-700 leading-relaxed">
          {result.tldr || "We couldn’t generate a TL;DR for this bill."}
        </p>
      </div>

      {!showPaid && (
        <div className="text-center mb-6">
          <p className="text-gray-700 mb-4">
            Upgrade to unlock detailed breakdowns, red flags, appeal letters, and potential savings.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg"
          >
            Unlock Full Explanation
          </button>
        </div>
      )}

      {/* Paid Features */}
      {showPaid && <PaidFeatures features={result.features} />}
    </motion.div>
  );
}
