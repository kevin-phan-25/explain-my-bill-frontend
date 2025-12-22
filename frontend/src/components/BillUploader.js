import React, { useState } from 'react';
import { explainBill } from '../api/explainApi';

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a bill file");
      return;
    }

    setUploadLoading(true);
    setError('');
    onLoading(true);

    const formData = new FormData();
    formData.append("bill", file);

    try {
      const result = await explainBill(formData);
      if (result.success) {
        onResult(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to analyze bill");
    } finally {
      setUploadLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="glass-card p-10 text-center">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Upload Your Bill</h2>
      <p className="text-lg text-gray-600 mb-8">
        Medical, dental, utility, credit card — we'll explain it in plain English.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        🔒 Your file is processed securely and deleted immediately after analysis.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-4 border-dashed rounded-2xl p-12 transition-all duration-300 ${
            dragActive ? 'border-primary bg-primary/10 scale-105' : 'border-gray-300'
          } ${uploadLoading ? 'opacity-70' : ''}`}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="bill-upload"
            disabled={uploadLoading}
          />
          <div className="space-y-4">
            <div className="text-7xl">📄</div>
            <p className="text-2xl font-medium text-gray-700">
              {uploadLoading ? "Analyzing your bill..." : "Drop your bill here or click to upload"}
            </p>
            <p className="text-gray-500">PDF or image • Max 10MB</p>
            {file && !uploadLoading && (
              <p className="text-green-600 font-medium text-lg">{file.name}</p>
            )}
            {uploadLoading && (
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-600 mt-6 text-lg font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={!file || uploadLoading}
          className="btn-primary mt-8 text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadLoading ? "Processing..." : "Analyze My Bill"}
        </button>
      </form>
    </div>
  );
}
