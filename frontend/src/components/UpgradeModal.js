import React, { useState } from "react";

export default function UpgradeModal({ onClose, stripePromise }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;
    const res = await fetch(
      "https://explain-my-bill.explainmybill.workers.dev/create-checkout-session",
      { method: "POST", body: JSON.stringify({ plan: "monthly" }), headers: { "Content-Type": "application/json" } }
    );
    const data = await res.json();
    stripe.redirectToCheckout({ sessionId: data.id });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold">Upgrade Required</h2>
        <p>Access all features by upgrading to the premium plan.</p>
        <button
          onClick={handleCheckout}
          className="bg-indigo-600 text-white py-2 px-4 rounded-xl w-full"
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Upgrade Now"}
        </button>
        <button onClick={onClose} className="text-sm mt-2 underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
