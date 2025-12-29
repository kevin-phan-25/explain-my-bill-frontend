// explainApi.js — Frontend API wrapper for ExplainMyBill Worker

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

// 🔧 DEV mode auto-detect
const DEV_MODE =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

/**
 * Upload a bill file and get analysis
 * @param {File} file - The uploaded bill
 * @param {string} [sessionId] - Optional Stripe session ID for paid checks
 * @returns {Promise<Object>} - Parsed JSON response from Worker
 */
export async function uploadBill(file, sessionId = null) {
  if (!file) throw new Error("No file provided");

  const form = new FormData();
  form.append("bill", file);
  if (sessionId) form.append("sessionId", sessionId);

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: form,
      headers: DEV_MODE
        ? { "X-Dev-Bypass": "true" } // DEV unlock
        : {},
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.error || `Upload failed with status ${res.status}`
      );
    }

    return data;
  } catch (err) {
    console.error("UploadBill error:", err);
    throw err;
  }
}

/**
 * Create a Stripe Checkout session
 * @param {"monthly"|"one-time"|"lifetime"} plan - Plan type
 * @returns {Promise<string>} - Stripe session ID
 */
export async function createCheckoutSession(plan) {
  if (!["monthly", "one-time", "lifetime"].includes(plan)) {
    throw new Error("Invalid plan type");
  }

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      throw new Error(
        data?.error || `Stripe session creation failed with status ${res.status}`
      );
    }

    return data.id;
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    throw err;
  }
}

/**
 * Helper to detect DEV mode (frontend)
 */
export function isDevMode() {
  return DEV_MODE;
}
