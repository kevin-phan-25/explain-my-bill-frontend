import React, { useState } from "react";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
    onLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("bill", file);

      const res = await fetch(WORKER_URL, { method: "POST", body: form });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      const text = await res.text();
      const data = JSON.parse(text || "{}");

      if (!data.pages) throw new Error("No valid data returned");

      onResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 space-y-6 transition-all duration-300">
      <h2 className="text-3xl font-extrabold text-center text-gradient bg-clip-text text-transparent from-indigo-500 via-purple-500 to-pink-500">
        Upload Your Bill
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400">
        Clear photo or full PDF for instant analysis
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center hover:border-indigo-500 transition cursor-pointer">
          <input type="file" accept="image/*,application/pdf" onChange={handleChange} className="hidden" id="file" />
          <label htmlFor="file" className="block">
            {file ? <p className="font-semibold text-lg">{file.name}</p> :
              <>
                <p className="font-semibold text-lg">Click or Tap to Upload</p>
                <p className="text-sm text-gray-400 mt-1">JPG • PNG • PDF</p>
              </>
            }
          </label>
        </div>

        {error && <p className="text-red-500 font-medium text-center">{error}</p>}

        <button type="submit" disabled={!file || uploading}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all">
          {uploading ? "Analyzing..." : "Explain My Bill"}
        </button>
      </form>
    </div>
  );
}
