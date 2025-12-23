import React, { useState } from "react";
import { explainBill } from "../api/explainApi";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
  const MAX_PDF_SIZE = 20 * 1024 * 1024;

  const compressImage = (file) =>
    new Promise((resolve) => {
      if (file.size <= MAX_IMAGE_SIZE || !file.type.startsWith("image/")) {
        resolve(file);
        return;
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;
        const maxDim = 2000;
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > width && height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
          },
          file.type || "image/jpeg",
          0.85
        );
      };
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setError("");
    setCompressing(true);
    try {
      const processedFile = await compressImage(selectedFile);
      const maxSize = processedFile.type === "application/pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
      if (processedFile.size > maxSize) {
        setError(`File too large. Max ${maxSize / 1024 / 1024}MB.`);
        setFile(null);
      } else {
        setFile(processedFile);
      }
    } catch (err) {
      setError("Failed to process file.");
      setFile(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    onLoading(true);
    const formData = new FormData();
    formData.append("bill", file);
    try {
      const data = await explainBill(formData);
      onResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze bill");
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={`border-4 border-dashed rounded-lg p-4 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"
        } ${loading || compressing ? "opacity-70" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          id="bill-upload"
        />
        <label htmlFor="bill-upload" className="cursor-pointer block">
          <div className="text-4xl mb-2 text-blue-600">📄</div>
          <p className="text-base font-bold text-gray-800 mb-1">
            {compressing ? "Compressing..." : loading ? "Analyzing..." : "Drop bill or click to upload"}
          </p>
          <p className="text-xs text-gray-600">
            PDF up to 20MB, images up to 8MB (auto-compressed)
          </p>
          {file && (
            <p className="mt-2 text-sm text-green-600 font-bold">
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </label>
      </div>
      {error && <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 text-center">{error}</div>}
      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading || compressing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition transform hover:scale-105"
        >
          {compressing ? "Preparing..." : loading ? "Processing..." : "Explain My Bill"}
        </button>
      </div>
    </form>
  );
}
