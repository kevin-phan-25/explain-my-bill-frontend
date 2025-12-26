const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);

  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  const headers = {};
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    headers["X-Dev-Bypass"] = "true";
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData,
    });

    const responseText = await res.text(); // Read as text first to avoid parse crash

    if (!res.ok) {
      let errorMsg = `Upload failed (HTTP ${res.status})`;
      try {
        const errorData = JSON.parse(responseText);
        errorMsg += `: ${errorData.error || responseText}`;
      } catch {
        errorMsg += `: ${responseText}`;
      }
      throw new Error(errorMsg);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error("Server returned invalid data. Worker needs redeploy.");
    }
  } catch (err) {
    console.error("Upload error:", err);
    throw new Error(err.message || "Network error – check connection");
  }
}

export const explainBill = uploadBillToAPI;

export async function createCheckoutSession(plan) {
  if (!["one-time", "monthly"].includes(plan)) {
    throw new Error("Invalid plan");
  }

  try {
    const res = await fetch(`${WORKER_URL}/create-checkout-session`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Payment failed");
    }
    return data;
  } catch (err) {
    throw new Error("Payment setup failed");
  }
}
