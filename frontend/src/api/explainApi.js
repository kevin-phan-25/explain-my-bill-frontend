const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

// 🔧 DEV MODE FLAG
const DEV_MODE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname.includes("127.0.0.1"));

/**
 * Uploads a bill file to ExplainMyBill backend and returns the result.
 *
 * @param {File} file - The bill file (PDF, JPG, PNG, XLSX)
 * @param {AbortSignal} [signal] - Optional signal to cancel the request
 * @returns {Promise<Object>} - Returns server JSON response
 */
export async function explainBill(file, signal) {
  if (!file) throw new Error("No file provided");

  const form = new FormData();
  form.append("bill", file);

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: form,
      signal,
      headers: DEV_MODE ? { "X-Dev-Bypass": "true" } : {},
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Upload failed: ${res.status} ${errText}`);
    }

    const data = await res.json().catch(() => {
      throw new Error("Invalid JSON returned from server");
    });

    // 🔓 DEV_MODE unlock
    if (DEV_MODE) data.isPaid = true;

    return data;
  } catch (err) {
    console.error("explainBill API error:", err);
    throw err;
  }
}
