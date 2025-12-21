const WORKER_URL = process.env.REACT_APP_WORKER_URL;

export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  return res.json();
}

export async function explainBill(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);
  if (sessionId) formData.append("sessionId", sessionId);

  const res = await fetch(WORKER_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to process bill: ${text}`);
  }
  return res.json();
}
