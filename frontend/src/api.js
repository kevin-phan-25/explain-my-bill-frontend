const WORKER_URL = process.env.REACT_APP_WORKER_URL; // must be set in Render env

// Stripe Checkout
export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  return res.json();
}

// Explain Bill
export async function explainBill(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file); // MUST match Worker key
  if (sessionId) formData.append("sessionId", sessionId);

  const res = await fetch(WORKER_URL, {
    method: "POST",
    body: formData,
  });

  // Handle network errors
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to process bill: ${text}`);
  }

  return res.json();
}
