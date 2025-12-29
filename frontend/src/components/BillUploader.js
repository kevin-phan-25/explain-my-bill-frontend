import React, { useState } from "react";
import { explainBill } from "../api/explainApi"; // ✅ import new API helper

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
      const data = await explainBill(file); // ✅ use API helper
      if (!data || !data.pages) {
        throw new Error("No valid data returned from server");
      }
      onResult(data);
    } catch (err) {
      console.error("Upload error:", err);
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
        Best: Clear photo of summary page or full PDF
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

        {error && <p className="text-red-600 text-center font-medium">{error}</p>}

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
