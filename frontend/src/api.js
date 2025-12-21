// frontend/src/api.js

const WORKER_URL = process.env.REACT_APP_WORKER_URL;

export async function uploadBill(formData) {
  const res = await fetch(WORKER_URL, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  return res.json();
}
