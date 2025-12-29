import React, { useState } from "react";
import { motion } from "framer-motion";

export default function UpgradeModal({ onClose, stripePromise }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (plan) => {
    setLoading(true);
    try {
      const res = await fetch("https://explain-my-bill.explainmybill.workers.dev/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { id } = await res.json();
      if (!id) throw new Error("No session ID");
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) alert(error.message);
    } catch (err) {
      alert("Payment failed — please try again");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { plan: "one-time", name: "One-Time Use", price: "$14.99", features: ["Full analysis", "Red flags", "Savings estimate", "PDF report"], popular: false },
    { plan: "monthly", name: "Monthly Unlimited", price: "$9.99/mo", features: ["Everything + unlimited bills", "Priority support", "Cancel anytime"], popular: true },
    { plan: "lifetime", name: "Lifetime Access", price: "$69.99", features: ["One payment forever", "All future features", "Best value"], popular: false },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-screen overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-3xl text-gray-500 hover:text-gray-700">&times;</button>

        <div className="p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 dark:text-white mb-8">Unlock Full Access</h2>

          <div className="grid md:grid-cols-3 gap-10">
            {plans.map((p) => (
              <motion.div
                key={p.plan}
                whileHover={{ scale: 1.05 }}
                className={`rounded-3xl p-10 border-4 ${p.popular ? "border-purple-500 shadow-2xl" : "border-gray-300"} relative`}
              >
                {p.popular && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">MOST POPULAR</div>}
                <h3 className="text-3xl font-bold mb-4">{p.name}</h3>
                <p className="text-5xl font-black text-blue-900 dark:text-white mb-8">{p.price}</p>
                <ul className="space-y-4 text-left mb-10">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-3 text-lg"><span className="text-green-500">✓</span> {f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(p.plan)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-xl hover:scale-105 transition disabled:opacity-70"
                >
                  {loading ? "Processing..." : "Choose Plan"}
                </button>
              </motion.div>
            ))}
          </div>

          <button onClick={onClose} className="mt-12 text-gray-500 hover:text-gray-700 text-lg">
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
