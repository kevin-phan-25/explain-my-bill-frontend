const WORKER_URL = process.env.REACT_APP_WORKER_URL;

export async function uploadBill(formData) {
  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      body: formData,
    });

    // Check response is OK and valid JSON
    const text = await res.text();
    if (!text) return { error: "Empty response from server" };
    return JSON.parse(text);
  } catch (err) {
    console.error(err);
    return { error: "Failed to process bill" };
  }
}
