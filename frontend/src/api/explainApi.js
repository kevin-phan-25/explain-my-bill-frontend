// src/api/billApi.js

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);

  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  // Only send X-Dev-Bypass on localhost (for free full access during dev)
  const headers = {};
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    headers["X-Dev-Bypass"] = "true";
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData, // Let browser set Content-Type + boundary
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("uploadBillToAPI error:", err);
    throw new Error("Failed to upload bill. Check your connection and try again.");
  }
}

// Alias for consistency
export const explainBill = uploadBillToAPI;

// Stripe checkout
export async function createCheckoutSession(plan) {
  if (!["one-time", "monthly"].includes(plan)) {
    throw new Error("Invalid plan");
  }

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    throw new Error("Could not start payment. Try again later.");
  }
}
