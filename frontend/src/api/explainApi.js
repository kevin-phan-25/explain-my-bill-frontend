// src/api/billApi.js (or wherever it lives)

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

// Upload a bill to your worker
export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);
  
  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  // Only add X-Dev-Bypass when running on localhost
  const headers = {};
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    headers["X-Dev-Bypass"] = "true"; // Free full access only during local dev
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers, // Only includes X-Dev-Bypass on localhost
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("uploadBillToAPI: Error", err);
    throw new Error("Failed to upload bill. Check your connection and try again.");
  }
}

// Reuse for explainBill
export const explainBill = uploadBillToAPI;

// Stripe checkout session
export async function createCheckoutSession(plan) {
  if (!["one-time", "monthly"].includes(plan)) {
    throw new Error("Invalid plan");
  }

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("createCheckoutSession: Error", err);
    throw new Error("Could not start payment. Please try again.");
  }
}
