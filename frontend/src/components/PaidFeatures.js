import React from "react";
import { motion } from "framer-motion";

export default function PaidFeatures({ features }) {
  if (!features) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="mt-20 space-y-12">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-5xl font-black text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
      >
        Premium Power Tools Unlocked
      </motion.h3>

      {features.redFlags?.length > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-gradient-to-br from-red-50 to-pink-50 border-l-8 border-red-600 rounded-3xl p-12 shadow-2xl"
        >
          <h4 className="text-4xl font-black text-red-800 mb-8 flex items-center gap-6">
            <span className="text-6xl">⚠️</span> Critical Red Flags Found
          </h4>
          <ul className="space-y-6 text-2xl leading-relaxed">
            {features.redFlags.map((flag, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-6 items-start"
              >
                <span className="text-red-600 text-3xl mt-1">•</span>
                <span className="text-gray-800 font-medium">{flag}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {features.potentialSavings && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-8 border-green-600 rounded-3xl p-12 shadow-2xl text-center"
        >
          <h4 className="text-4xl font-black text-green-800 mb-8 flex items-center justify-center gap-6">
            <span className="text-7xl">💰</span> Estimated Savings Opportunity
          </h4>
          <p className="text-7xl font-black text-green-700 drop-shadow-lg">
            {features.potentialSavings}
          </p>
          <p className="text-xl text-green-700 mt-6">Based on national averages and EOB analysis</p>
        </motion.div>
      )}

      {features.services?.length > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-8 border-blue-600 rounded-3xl p-12 shadow-2xl"
        >
          <h4 className="text-4xl font-black text-blue-800 mb-8 flex items-center gap-6">
            <span className="text-6xl">🩺</span> Services Identified
          </h4>
          <ul className="grid md:grid-cols-2 gap-6 text-xl">
            {features.services.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200"
              >
                <span className="text-blue-600 font-bold text-2xl mr-4">•</span>
                {s}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
