// src/api/explainApi.js – Full file (renamed back from billApi.js, with improved error handling)

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);

  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  // Only send X-Dev-Bypass on localhost (for free full access during dev)
  const headers = {};
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    headers["X-Dev-Bypass"] = "true";
  }

  try {
    console.log("Uploading to:", WORKER_URL);
    console.log("File:", file.name, file.size, file.type);

    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData, // Let browser set Content-Type + boundary
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", [...res.headers.entries()]);

    // Always read response body for better errors
    const responseText = await res.text();
    console.log("Raw response body:", responseText);

    if (!res.ok) {
      let errorMsg = `Upload failed: HTTP ${res.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        errorMsg = responseText || errorMsg;
      }
      throw new Error(errorMsg.trim() || "Unknown server error");
    }

    // Try to parse JSON
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Response is not valid JSON:", responseText);
      throw new Error("Server returned invalid data. Please redeploy the latest worker code.");
    }
  } catch (err) {
    console.error("uploadBillToAPI error:", err);

    if (err.message.includes("Maximum call stack size exceeded")) {
      throw new Error("Maximum call stack size exceeded");
    }

    if (err.message.includes("ExplainMyBill Worker – Running")) {
      throw new Error("Worker is running but not processing uploads. Redeploy the latest worker code.");
    }

    throw new Error(err.message || "Failed to upload bill. Check your connection and try again.");
  }
}

// Alias for consistency
export const explainBill = uploadBillToAPI;

// Stripe checkout
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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Payment failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    throw new Error("Could not start payment. Try again later.");
  }
}