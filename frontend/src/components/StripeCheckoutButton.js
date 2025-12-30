// src/components/StripeCheckoutButton.js — FULL STRIPE FRONTEND INTEGRATION
import React, { useState } from "react";

export default function StripeCheckoutButton({ priceId, label = "Upgrade to Premium", disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={`w-full py-5 px-10 rounded-2xl font-bold text-xl shadow-2xl transition-all
          ${loading || disabled 
            ? "bg-gray-400 cursor-not-allowed text-gray-200" 
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-3xl hover:scale-105"
          }`}
      >
        {loading ? "Redirecting to Stripe..." : label}
      </button>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
