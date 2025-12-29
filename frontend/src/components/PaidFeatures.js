import React from "react";
import { motion } from "framer-motion";

export default function PaidFeatures({ features }) {
  if (!features) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mt-16 space-y-10">
      <h3 className="text-4xl font-bold text-center text-blue-900 dark:text-white mb-12">
        Premium Insights Just for You
      </h3>

      {features.redFlags?.length > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-red-50 dark:bg-red-900/30 border-l-8 border-red-600 rounded-2xl p-10 shadow-2xl"
        >
          <h4 className="text-3xl font-bold text-red-800 dark:text-red-300 mb-6 flex items-center gap-4">
            <span className="text-5xl">⚠️</span> Red Flags Detected
          </h4>
          <ul className="space-y-4 text-xl">
            {features.redFlags.map((flag, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-red-500">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {features.potentialSavings && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-green-50 dark:bg-green-900/30 border-l-8 border-green-600 rounded-2xl p-10 shadow-2xl"
        >
          <h4 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center gap-4">
            <span className="text-5xl">💰</span> Potential Savings
          </h4>
          <p className="text-4xl font-black text-green-700 dark:text-green-400">
            {features.potentialSavings}
          </p>
        </motion.div>
      )}

      {features.services?.length > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-blue-50 dark:bg-blue-900/30 border-l-8 border-blue-600 rounded-2xl p-10 shadow-2xl"
        >
          <h4 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-6 flex items-center gap-4">
            <span className="text-5xl">🩺</span> Services Billed
          </h4>
          <ul className="space-y-4 text-xl">
            {features.services.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-blue-500">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
