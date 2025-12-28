const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

/**
 * SAFELY PARSE JSON EVEN IF AI RETURNS ```json BLOCKS
 */
function safeParseJSON(text) {
  if (!text || typeof text !== "string") return null;

  // Remove markdown code fences if present
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON parse failed, returning null");
    return null;
  }
}

export async function uploadBillToAPI(file, sessionId = null) {
  const formData = new FormData();
  formData.append("bill", file);

  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  const headers = {};

  // Local dev bypass (unchanged)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    headers["X-Dev-Bypass"] = "true";
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData,
    });

    const responseText = await res.text(); // ALWAYS read as text first

    // ---- HARD FAILURE (HTTP != 200)
    if (!res.ok) {
      let errorMsg = `Upload failed (HTTP ${res.status})`;

      const parsedError = safeParseJSON(responseText);
      if (parsedError?.error) {
        errorMsg += `: ${parsedError.error}`;
      } else if (responseText) {
        errorMsg += `: ${responseText}`;
      }

      throw new Error(errorMsg);
    }

    // ---- TRY PARSE JSON SAFELY
    const parsed = safeParseJSON(responseText);

    // ---- ABSOLUTE LAST RESORT FALLBACK
    if (!parsed) {
      console.error("Worker returned non-JSON:", responseText);

      return {
        isPaid: false,
        explanation:
          "We extracted text from your bill, but analysis failed. Showing raw OCR output instead.",
        structured: null,
        pages: [],
        rawTextPreview: responseText.slice(0, 2000),
        features: {
          ocrStatus: "unknown",
          confidence: "none",
        },
      };
    }

    /**
     * 🚨 CRITICAL FIX
     * Never allow frontend to show “Not detected” if OCR text exists
     */
    if (
      parsed.pages &&
      Array.isArray(parsed.pages) &&
      parsed.pages.some((p) => p?.structured || p?.explanation)
    ) {
      parsed.ocrFallback = false;
    }

    return parsed;
  } catch (err) {
    console.error("Upload error:", err);

    // Frontend-safe error
    throw new Error(err.message || "Network error – check connection");
  }
}

/**
 * Backwards compatibility
 */
export const explainBill = uploadBillToAPI;

/**
 * STRIPE CHECKOUT (UNCHANGED, SAFE)
 */
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

    const text = await res.text();
    const data = safeParseJSON(text);

    if (!res.ok || !data) {
      throw new Error(data?.error || "Payment failed");
    }

    return data;
  } catch (err) {
    console.error("Stripe error:", err);
    throw new Error("Payment setup failed");
  }
}