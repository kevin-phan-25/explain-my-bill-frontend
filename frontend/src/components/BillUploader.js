// src/components/BillUploader.js
import React, { useState } from "react";
import { uploadBillToAPI } from "../api/explainApi";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(selected.type)) {
      setError("Please upload JPG, PNG, or PDF");
      return;
    }

    if (selected.size > 20 * 1024 * 1024) {
      setError("File too large (max 20MB)");
      return;
    }

    setFile(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    onLoading(true);
    setError("");

    try {
      const result = await uploadBillToAPI(file);
      onResult(result);
    } catch (err) {
      setError(err.message || "Upload failed – please try again");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Upload Your Medical Bill
        </h2>

        {/* Pro Tip – Critical for OCR success */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-green-900 text-lg mb-4">For Best Results:</h3>
          <ul className="space-y-3 text-green-800">
            <li className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <strong>Take a clear photo</strong> of the main summary page of your bill
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🖼️</span>
              <div>
                Upload as <strong>JPG or PNG</strong> — works much better than scanned PDFs
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                Good lighting, no shadows — make sure amounts and dates are readable
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border-4 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="bill-input"
              disabled={uploading}
            />
            <label htmlFor="bill-input" className="cursor-pointer block">
              {file ? (
                <div>
                  <p className="text-2xl font-bold text-blue-900 mb-2">{file.name}</p>
                  <p className="text-blue-600">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="text-8xl mb-6">📄</div>
                  <p className="text-2xl font-bold text-blue-900 mb-2">
                    Click to upload your bill
                  </p>
                  <p className="text-blue-700">JPG, PNG, or PDF • Max 20MB</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-800 text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-2xl py-6 rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
          >
            {uploading ? "Analyzing Your Bill..." : "Explain My Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}
