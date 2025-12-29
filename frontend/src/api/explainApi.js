// src/api/explainApi.js
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

function safeParseJSON(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text
    .replace(/```json\n?/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("Failed to parse JSON from Worker:", text.substring(0, 500));
    return null;
  }
}

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);
  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: formData,
    });

    // ALWAYS read response as text first
    const text = await res.text();

    // Parse JSON safely
    const data = safeParseJSON(text);

    // Handle HTTP errors
    if (!res.ok) {
      const errorMsg = data?.error || text || "Upload failed";
      throw new Error(errorMsg);
    }

    // If parsing failed but status is 200, still return raw info for debugging
    if (!data) {
      console.error("Worker returned non-JSON response:", text);
      return {
        isPaid: false,
        explanation: "We received your bill but the analysis is incomplete. Try uploading a clearer photo.",
        pages: [],
        rawResponse: text.substring(0, 1000),
      };
    }

    return data;
  } catch (err) {
    console.error("Upload failed:", err);
    throw new Error(err.message || "Network error – please check your connection and try again");
  }
}

export async function createCheckoutSession(plan) {
  if (!["one-time", "monthly"].includes(plan)) {
    throw new Error("Invalid plan selected");
  }

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const text = await res.text();
    const data = safeParseJSON(text);

    if (!res.ok || !data?.id) {
      throw new Error(data?.error || "Payment setup failed");
    }

    return data;
  } catch (err) {
    console.error("Stripe error:", err);
    throw new Error(err.message || "Could not start payment");
  }
}
