import React, { useState, useEffect } from "react";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size <= 20 * 1024 * 1024) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("Max 20MB");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    onLoading(true);
    setError("");
    setProgress("");

    try {
      const form = new FormData();
      form.append("bill", file);

      const res = await fetch(WORKER_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error("Server error");

      // Streaming SSE events
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let resultData = { pages: [], isPaid: false };
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partial += decoder.decode(value, { stream: true });

        // SSE parsing
        const events = partial.split("\n\n");
        partial = events.pop(); // keep incomplete chunk

        for (let ev of events) {
          if (!ev.startsWith("data:")) continue;
          const jsonStr = ev.replace(/^data: /, "").trim();
          if (!jsonStr) continue;

          let chunk;
          try { chunk = JSON.parse(jsonStr); } catch { continue; }

          if (chunk.status === "progress") setProgress(JSON.stringify(chunk.chunk, null, 2));
          if (chunk.status === "info") setProgress(chunk.message);
          if (chunk.status === "error") setProgress(chunk.message);
          if (chunk.status === "done" && chunk.finalResult) resultData = { ...chunk.finalResult };
        }
      }

      onResult(resultData);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Your Bill</h2>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
        Best: Clear photo of summary page
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center">
          <input type="file" accept="image/*,application/pdf" onChange={handleChange} className="hidden" id="file" />
          <label htmlFor="file" className="cursor-pointer">
            {file ? (
              <p className="font-semibold text-lg">{file.name}</p>
            ) : (
              <div>
                <p className="font-semibold text-lg">Tap to upload</p>
                <p className="text-sm text-gray-500 mt-2">JPG • PNG • PDF</p>
              </div>
            )}
          </label>
        </div>

        {error && <p className="text-red-600 text-center font-medium">{error}</p>}
        {progress && <pre className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-gray-100 dark:bg-gray-700 rounded">{progress}</pre>}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition"
        >
          {uploading ? "Analyzing..." : "Explain My Bill"}
        </button>
      </form>
    </div>
  );
}
