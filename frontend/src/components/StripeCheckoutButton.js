// src/components/StripeCustomerPortalButton.js
import React, { useState } from "react";

export default function StripeCustomerPortalButton({ customerId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Failed to open portal");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!customerId) return null;

  return (
    <div className="mt-6">
      <button
        onClick={openPortal}
        disabled={loading}
        className="text-indigo-600 underline hover:no-underline font-medium"
      >
        {loading ? "Opening..." : "Manage subscription & cancel anytime"}
      </button>
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </div>
  );
}
