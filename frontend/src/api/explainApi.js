// src/api/explainApi.js
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

function safeParseJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("Failed to parse JSON from worker:", text);
    return null;
  }
}

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);
  if (sessionId) formData.append("sessionId", sessionId);

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: formData,
    });

    const text = await res.text();

    if (!res.ok) {
      const err = safeParseJSON(text)?.error || text || "Upload failed";
      throw new Error(err);
    }

    const data = safeParseJSON(text);
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export async function createCheckoutSession(plan) {
  const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  const text = await res.text();
  const data = safeParseJSON(text);

  if (!res.ok || !data?.id) throw new Error(data?.error || "Payment failed");

  return data;
}
