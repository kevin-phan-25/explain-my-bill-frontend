const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

/**
 * Upload a bill file to the Worker backend and return the parsed result.
 * @param {File} file - The bill file (PDF, JPG, PNG)
 * @returns {Promise<Object>} JSON response from the Worker
 */
export async function explainBill(file) {
  if (!file) throw new Error("No file provided");

  const form = new FormData();
  form.append("bill", file);

  const res = await fetch(WORKER_URL, {
    method: "POST",
    body: form,
    // Optional: enable dev bypass locally
    headers: window.location.hostname === "localhost" ? { "X-Dev-Bypass": "true" } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${text}`);
  }

  let data;
  try {
    const text = await res.text();
    data = JSON.parse(text);
  } catch {
    // fallback if JSON parsing fails
    const fallbackText = await res.text();
    data = { pages: [{ explanation: fallbackText }], isPaid: false };
  }

  return data;
}
