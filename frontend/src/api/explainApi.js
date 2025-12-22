// src/api/explainApi.js

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function explainBill(formData) {
  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      data, // { isPaid, pages, fullExplanation }
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to analyze bill. Please try again.",
    };
  }
}

export async function createCheckoutSession(plan) {
  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment failed: ${res.status}`);
    }

    const { id } = await res.json();
    return {
      success: true,
      sessionId: id,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Payment setup failed. Please try again.",
    };
  }
}
