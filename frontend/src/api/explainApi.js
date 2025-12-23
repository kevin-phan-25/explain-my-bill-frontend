// src/api/explainApi.js
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function explainBill(formData) {
  const headers = {};
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('onrender.com')) {
    headers["X-Dev-Bypass"] = "true"; // Developer bypass for full access
  }

  console.log("explainBill: Starting fetch to worker"); // Debugging log

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    console.log("explainBill: Fetch response status:", res.status); // Debugging log

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Worker responded with ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("explainBill: Error:", err); // Debugging log
    throw new Error(
      "Could not connect to backend. Please check your internet connection or try again later."
    );
  }
}

export async function createCheckoutSession(plan) {
  console.log("createCheckoutSession: Starting for plan:", plan); // Debugging log

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    console.log("createCheckoutSession: Response status:", res.status); // Debugging log

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment endpoint responded with ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("createCheckoutSession: Error:", err); // Debugging log
    throw new Error("Could not initiate payment. Try again later.");
  }
}
