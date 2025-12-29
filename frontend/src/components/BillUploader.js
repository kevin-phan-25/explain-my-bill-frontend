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
      setError(err.message);
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-4xl font-black text-center text-blue-900 mb-10">
          Upload Your Medical Bill
        </h2>

        {/* Pro Tip – Most important for success */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-bold text-emerald-900 text-center mb-6">
            For the Best Results:
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-emerald-800">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="font-bold">Take a clear photo</p>
              <p className="text-sm mt-2">of the summary page</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">☀️</div>
              <p className="font-bold">Good lighting</p>
              <p className="text-sm mt-2">no shadows or glare</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="font-bold">JPG or PNG</p>
              <p className="text-sm mt-2">works best</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border-4 border-dashed border-blue-400 rounded-3xl p-16 text-center hover:border-blue-600 transition">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="upload-input"
              disabled={uploading}
            />
            <label htmlFor="upload-input" className="cursor-pointer block">
              {file ? (
                <div className="space-y-4">
                  <p className="text-3xl font-bold text-blue-900">{file.name}</p>
                  <p className="text-xl text-blue-600">Click to change</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-9xl">📄</div>
                  <p className="text-3xl font-bold text-blue-900">
                    Click to upload
                  </p>
                  <p className="text-xl text-blue-700">
                    JPG, PNG, or PDF • Max 20MB
                  </p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-red-800 text-center text-lg font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-3xl py-8 rounded-3xl shadow-2xl hover:shadow-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
          >
            {uploading ? "Analyzing Your Bill..." : "Explain My Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}
