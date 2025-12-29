import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplanationCard({ result, onUpgrade }) {
  const [expandedPages, setExpandedPages] = useState([]);

  if (!result || !result.pages) return null;

  const togglePage = (pageNum) => {
    setExpandedPages((prev) =>
      prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum]
    );
  };

  return (
    <div className="space-y-8">
      {result.pages.map((page, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => togglePage(page.page)}>
            <h4 className="text-2xl font-bold text-blue-900 dark:text-white">
              Page {page.page} Summary
            </h4>
            <span className="text-xl">
              {expandedPages.includes(page.page) ? "▲" : "▼"}
            </span>
          </div>

          <AnimatePresence>
            {expandedPages.includes(page.page) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Explanation */}
                <p className="text-gray-700 dark:text-gray-300">{page.structured.explanation}</p>

                {/* Key Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {Object.entries(page.structured.keyAmounts).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-gray-900 dark:text-white">{k}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-xl font-black">{v || "Not detected"}</p>
                    </div>
                  ))}
                </div>

                {/* Red Flags */}
                {page.structured.redFlags?.length > 0 && (
                  <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-l-4 border-red-600">
                    <h5 className="font-bold text-red-800 dark:text-red-300 mb-2">⚠️ Red Flags</h5>
                    <ul className="list-disc list-inside text-red-600 dark:text-red-300">
                      {page.structured.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Savings */}
                {page.structured.potentialSavings && (
                  <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-l-4 border-green-600">
                    <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">💰 Potential Savings</h5>
                    <p className="text-green-700 dark:text-green-400 font-black text-lg">{page.structured.potentialSavings}</p>
                  </div>
                )}

                {/* Services */}
                {page.structured.services?.length > 0 && (
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-600">
                    <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">🩺 Services Billed</h5>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                      {page.structured.services.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upgrade CTA */}
                {!result.isPaid && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={onUpgrade}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition"
                    >
                      Unlock Full Insights
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
