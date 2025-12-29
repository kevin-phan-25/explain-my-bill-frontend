import React, { useState, useRef } from "react";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");
  const abortControllerRef = useRef(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size <= 20 * 1024 * 1024) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("Max 20MB per file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setStreamText("");
    onLoading(true);
    setError("");

    abortControllerRef.current = new AbortController();

    try {
      const form = new FormData();
      form.append("bill", file);

      // Upload file
      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: form,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Streaming response
      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let text = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            text += chunk;
            setStreamText(text); // live progressive feedback
          }
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Failed to parse AI response");
        }

        // Fallback AI
        if (!data.pages) {
          const fallbackRes = await fetch(WORKER_URL + "/fallback", {
            method: "POST",
            body: form,
          });
          data = await fallbackRes.json();
        }

        onResult(data);
      } else {
        const text = await res.text();
        onResult(JSON.parse(text));
      }
    } catch (err) {
      console.error("Bill upload error:", err);
      setError(err.message || "Upload failed");
      setStreamText("AI failed, please try again.");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Your Bill</h2>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
        Best: Clear photo of summary page or PDF
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="hidden"
            id="file"
          />
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

        {error && (
          <p className="text-red-600 text-center font-medium">{error}</p>
        )}

        {streamText && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl prose dark:prose-invert max-w-none">
            {streamText.split("\n\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

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
