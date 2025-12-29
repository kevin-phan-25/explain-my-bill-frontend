// src/components/BillUploader.js
import React, { useState } from "react";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size < 20 * 1024 * 1024) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("File too large (max 20MB)");
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
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) throw new Error(data.error || "Upload failed");

      onResult(data); // THIS LINE IS CRITICAL
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-10">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Upload Your Bill</h2>

      <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-8 text-center">
        <p className="font-bold text-green-900 mb-2">Best results: Clear photo of summary page (JPG/PNG)</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="border-4 border-dashed border-blue-400 rounded-2xl p-12 text-center">
          <input type="file" accept="image/*,application/pdf" onChange={handleChange} className="hidden" id="upload" />
          <label htmlFor="upload" className="cursor-pointer">
            {file ? <p className="text-2xl font-bold text-blue-900">{file.name}</p> : <p className="text-2xl font-bold text-blue-900">Click to upload</p>}
            <p className="text-blue-600 mt-2">JPG, PNG, PDF • Max 20MB</p>
          </label>
        </div>

        {error && <p className="text-red-600 text-center mt-4 font-bold">{error}</p>}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-2xl py-6 rounded-2xl disabled:opacity-50"
        >
          {uploading ? "Analyzing..." : "Explain My Bill"}
        </button>
      </form>
    </div>
  );
}
