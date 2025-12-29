// api/explainApi.js — full helper API functions
export const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

// DEV mode check
export const isDevMode = () =>
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

// Upload / explain bill
export async function uploadBill(file, sessionId = null) {
  const form = new FormData();
  form.append("bill", file);
  if (sessionId) form.append("sessionId", sessionId);

  const res = await fetch(WORKER_URL, {
    method: "POST",
    body: form,
    headers: isDevMode() ? { "X-Dev-Bypass": "true" } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  return res.json();
}

// Create Stripe checkout session
export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) throw new Error("Failed to create checkout session");

  return res.json();
}
