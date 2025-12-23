// src/api/explainApi.js
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev"; // Replace with your actual worker URL

export async function explainBill(formData) {
  const headers = {};
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('onrender.com')) {
    headers["X-Dev-Bypass"] = "true"; // Developer bypass for full access
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to analyze bill");
  }

  return res.json();
}

export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Payment failed");
  }

  return res.json();
}
