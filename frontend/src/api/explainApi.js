const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function explainBill(formData) {
  const headers = {};
  if (window.location.hostname === "localhost" || window.location.hostname.includes("onrender.com")) {
    headers["X-Dev-Bypass"] = "true"; // developer free bypass
  }

  try {
    const res = await fetch(WORKER_URL, { method: "POST", headers, body: formData });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Worker responded with ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("explainBill: Error", err);
    throw new Error(
      "Could not connect to backend. Please check your internet connection or try again later."
    );
  }
}

export async function createCheckoutSession(plan) {
  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment endpoint responded with ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("createCheckoutSession: Error", err);
    throw new Error("Could not initiate payment. Try again later.");
  }
}
