// src/components/BillUploader.js
import React, { useState } from "react";
import { prepareImageForOCR } from "../utils/prepareImageForOCR";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File too large – maximum 20MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    onLoading(true);
    setError("");

    try {
      // Preprocess the file (converts PDF to image + enhances contrast)
      const processedFile = await prepareImageForOCR(file);

      const formData = new FormData();
      formData.append("bill", processedFile, processedFile.name || "bill.jpg");

      const res = await fetch("/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed – please try again");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-2xl border border-blue-200">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Upload Your Medical Bill
        </h2>

        {/* Pro Tip Box */}
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-green-900 text-lg mb-3">For Best Results:</h3>
          <ul className="text-green-800 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">📸</span>
              <span>Take a clear, well-lit photo of the <strong>summary page</strong> of your bill</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🖼️</span>
              <span>Upload as <strong>JPG or PNG</strong> (works better than scanned PDFs)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Make sure amounts and dates are clearly visible</span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-4 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="bill-upload"
              disabled={uploading}
            />
            <label
              htmlFor="bill-upload"
              className="cursor-pointer block"
            >
              {file ? (
                <div>
                  <p className="text-xl font-semibold text-blue-900">{file.name}</p>
                  <p className="text-sm text-blue-700 mt-2">Click to change</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-xl font-semibold text-blue-900">
                    Click to upload your bill
                  </p>
                  <p className="text-blue-700 mt-2">JPG, PNG, or PDF (max 20MB)</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <p className="text-red-600 text-center font-medium bg-red-50 py-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xl py-5 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? "Analyzing your bill..." : "Analyze My Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}
