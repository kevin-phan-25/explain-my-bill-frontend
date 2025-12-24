// src/api/explainApi.js – Full updated file with safe response handling

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
      body: formData,
    });

    // ALWAYS read as text first to avoid JSON parse crash
    const responseText = await res.text();

    // Detect the outdated worker response
    if (responseText.trim().includes("ExplainMyBill Worker – Running")) {
      throw new Error("Backend worker is outdated and not processing uploads. Please redeploy the latest worker code.");
    }

    if (!res.ok) {
      throw new Error(`Upload failed (HTTP ${res.status}): ${responseText.trim() || "Unknown error"}`);
    }

    // Only try JSON parse if it's likely valid
    try {
      return JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Invalid JSON from server:", responseText);
      throw new Error("Server returned invalid data. Worker needs update.");
    }
  } catch (err) {
    console.error("uploadBillToAPI error:", err);
    throw err; // Re-throw with clear message
  }
}

// Alias for consistency
export const explainBill = uploadBillToAPI;

// Stripe checkout (unchanged)
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