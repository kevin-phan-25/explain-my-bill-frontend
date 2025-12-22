// frontend/src/api/explainApi.js

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function explainBill(formData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    }

    return await res.json(); // Returns { isPaid, pages, fullExplanation }
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error(err.message || "Failed to analyze bill. Please try again.");
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
      throw new Error(errorData.error || `Payment setup failed: ${res.status}`);
    }

    return await res.json(); // Returns { id: sessionId }
  } catch (err) {
    throw new Error(err.message || "Payment failed. Please try again.");
  }
}
