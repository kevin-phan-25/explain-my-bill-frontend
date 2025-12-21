const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function uploadBill(formData) {
  try {
    const res = await fetch(WORKER_URL, { method: "POST", body: formData });
    const text = await res.text();
    if (!text) return { error: "Empty response from server" };
    return JSON.parse(text);
  } catch (err) {
    return { error: err.message || "Network error" };
  }
}

export async function createCheckoutSession(plan) {
  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    return res.json();
  } catch (err) {
    return { error: err.message || "Network error" };
  }
}
