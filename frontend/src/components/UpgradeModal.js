import React, { useState } from "react";
import { createCheckoutSession } from "../api/explainApi";
import { motion } from "framer-motion";

export default function UpgradeModal({ onClose, stripePromise }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePayment = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan);
    try {
      const { id } = await createCheckoutSession(plan);
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) {
        alert("Payment error: " + error.message);
      }
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      plan: "one-time",
      name: "One-Time Review",
      price: "$19.99",
      subtitle: "Perfect for a single bill",
      features: [
        "Full red flags detection",
        "Personalized next steps",
        "Estimated savings",
        "Ready-to-send appeal letter",
        "Download PDF report",
      ],
      popular: false,
    },
    {
      plan: "monthly",
      name: "Unlimited Monthly",
      price: "$9.99/month",
      subtitle: "Best value for ongoing use",
      features: [
        "Everything in One-Time",
        "Unlimited bill analyses",
        "Priority support",
        "New features first",
        "Cancel anytime",
      ],
      popular: true,
    },
    {
      plan: "lifetime",
      name: "Lifetime Unlimited",
      price: "$67",
      subtitle: "One payment, forever access",
      features: [
        "Everything in Monthly",
        "No recurring fees ever",
        "Lifetime updates",
        "Best deal — save hundreds",
        "Peace of mind forever",
      ],
      popular: false,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-3xl font-bold z-10"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="p-10 md:p-12 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-black text-blue-900 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Unlock the Full Power of ExplainMyBill
          </motion.h2>

          <motion.p
            className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Get expert-level insights: red flags, savings estimates, appeal letters, and unlimited use.
          </motion.p>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {plans.map((p, i) => (
              <motion.div
                key={p.plan}
                className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
                  p.popular
                    ? "ring-4 ring-purple-500 ring-offset-4 scale-105 z-10"
                    : "border-2 border-gray-200"
                }`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                whileHover={{ y: -8 }}
              >
                {p.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold py-2">
                    MOST POPULAR
                  </div>
                )}

                <div className={`pt-10 pb-8 px-8 ${p.popular ? "pt-14" : ""}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{p.name}</h3>
                  <p className="text-gray-600 mb-6">{p.subtitle}</p>

                  <div className="mb-8">
                    <span className="text-5xl font-black text-blue-900">{p.price}</span>
                  </div>

                  <ul className="space-y-4 text-left text-gray-700 mb-10">
                    {p.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-500 font-bold text-lg">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePayment(p.plan)}
                    disabled={loading}
                    className={`w-full py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg ${
                      p.popular
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                    } ${loading && selectedPlan === p.plan ? "opacity-70 cursor-wait" : "hover:scale-105"}`}
                  >
                    {loading && selectedPlan === p.plan ? "Processing..." : "Choose Plan"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Guarantee */}
          <motion.div
            className="mt-16 bg-green-50 rounded-2xl p-8 border-2 border-green-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-2xl font-bold text-green-800 mb-3">
              30-Day Money-Back Guarantee
            </p>
            <p className="text-lg text-green-700">
              Try any plan completely risk-free. Not satisfied? Full refund — no questions asked.
            </p>
          </motion.div>

          {/* Maybe Later */}
          <motion.button
            onClick={onClose}
            className="mt-10 text-gray-500 hover:text-gray-700 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Maybe later
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
