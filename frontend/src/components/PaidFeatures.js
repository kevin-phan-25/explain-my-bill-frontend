import React from 'react';
import { motion } from 'framer-motion';

export default function PaidFeatures({ features }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="mt-12 space-y-10">
      <h3 className="text-4xl font-bold text-center text-blue-900 mb-10">
        Premium Insights Just for You
      </h3>

      {/* CPT Code Explanations */}
      {features.cptExplanations?.length > 0 && (
        <motion.div
          className="bg-purple-50 border-l-8 border-purple-600 rounded-2xl p-8 shadow-xl"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <h4 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
            <span className="text-4xl mr-4 animate-pulse">📋</span> CPT Codes Explained
          </h4>
          <ul className="space-y-3 text-lg text-purple-700 list-disc list-inside">
            {features.cptExplanations.map((exp, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-3">•</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Red Flags */}
      {features.redFlags?.length > 0 && (
        <motion.div
          className="bg-red-50 border-l-8 border-red-600 rounded-2xl p-8 shadow-xl"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <h4 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
            <span className="text-4xl mr-4 animate-pulse">⚠️</span> Red Flags Found
          </h4>
          <ul className="space-y-3 text-lg text-red-700 list-disc list-inside">
            {features.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-3">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Estimated Savings */}
      <motion.div
        className="bg-green-50 border-l-8 border-green-600 rounded-2xl p-8 shadow-xl"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h4 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          <span className="text-4xl mr-4 animate-pulse">💰</span> Potential Savings
        </h4>
        <p className="text-3xl font-bold text-green-700">
          {features.estimatedSavings?.potentialSavings || "$200–$800"}
        </p>
        <p className="text-lg text-green-700 mt-3">
          {features.estimatedSavings?.reason || "Common overcharges on office visits, labs, and imaging"}
        </p>
      </motion.div>

      {/* Appeal Letter */}
      <motion.div
        className="bg-indigo-50 border-l-8 border-indigo-600 rounded-2xl p-8 shadow-xl"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h4 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
          <span className="text-4xl mr-4 animate-pulse">✉️</span> Ready-to-Send Appeal Letter
        </h4>
        <pre className="whitespace-pre-wrap text-lg bg-white p-6 rounded-xl border shadow-inner">
          {features.appealLetter}
        </pre>
      </motion.div>

      {/* Custom Advice */}
      <motion.div
        className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 shadow-xl text-center"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <h4 className="text-2xl font-bold text-blue-800 mb-4 flex items-center justify-center">
          <span className="text-4xl mr-4 animate-pulse">💡</span> Your Next Steps
        </h4>
        <p className="text-xl text-blue-700 leading-relaxed">
          {features.customAdvice || "Contact your provider for an itemized bill. Call insurance with CPT codes. Check fairhealthconsumer.org for average costs in your area."}
        </p>
      </motion.div>
    </div>
  );
}
