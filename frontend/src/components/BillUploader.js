import React, { useState } from "react";
import { uploadBillToAPI } from "../api/explainApi";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrPreview, setOcrPreview] = useState("");

  // ===================== IMAGE UPSCALE BEFORE UPLOAD =====================
  const preprocessFile = async (file) => {
    if (!file.type.startsWith("image/")) return file;

    const img = await loadImageFromFile(file);
    const scale = Math.max(1600 / img.width, 1600 / img.height, 1);

    const canvas = document.createElement("canvas");
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");
    ctx.filter = "contrast(1.4) brightness(1.15)";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) =>
          resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.92
      );
    });
  };

  const loadImageFromFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ===================== SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setOcrPreview("");
    onLoading(true);

    try {
      const processedFile = await preprocessFile(file);
      const data = await uploadBillToAPI(processedFile);

      /**
       * 🔥 CRITICAL FIX
       * If AI fails but OCR exists — show OCR
       */
      const rawOCR =
        data?.rawTextPreview ||
        data?.pages?.map((p) => p.rawText).join("\n\n");

      if (!data?.structured && rawOCR) {
        setOcrPreview(rawOCR);
      }

      onResult(data);
    } catch (err) {
      setError(err.message || "Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ================= DROP ZONE ================= */}
      <div
        className={`border-4 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${loading ? "opacity-70" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) setFile(dropped);
        }}
      >
        <input
          id="bill-upload"
          type="file"
          accept="image/*,.pdf,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
        />

        <label htmlFor="bill-upload" className="cursor-pointer block">
          <p className="text-lg font-bold text-gray-800">
            {loading ? "Analyzing your bill…" : "Drop bill or click to upload"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            PDF, image, Excel • Max 20MB
          </p>
          {file && (
            <p className="mt-2 text-sm text-green-600 font-bold">{file.name}</p>
          )}
        </label>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
          <p className="font-bold">Upload Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ================= OCR FALLBACK ================= */}
      {ocrPreview && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="font-bold text-yellow-800 mb-2">
            OCR Text Detected (AI analysis unavailable)
          </p>
          <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-auto text-gray-800">
            {ocrPreview}
          </pre>
        </div>
      )}

      {/* ================= SUBMIT ================= */}
      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition"
        >
          {loading ? "Processing…" : "Explain My Bill"}
        </button>
      </div>
    </form>
  );
}