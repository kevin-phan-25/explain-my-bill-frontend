import React, { useState } from 'react';
import { explainBill } from '../api/explainApi';

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    onLoading(true);

    const formData = new FormData();
    formData.append("bill", file);

    try {
      const data = await explainBill(formData);
      onResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze bill. Please try again.");
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="glass-card p-12 mt-12">
      <h2 className="text-4xl font-bold text-center text-blue-900 mb-8">Upload Your Medical Bill</h2>
      <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
        Get a clear, easy-to-understand explanation of charges, codes, insurance adjustments, and what you actually owe.
      </p>

      <form onSubmit={handleSubmit} aria-labelledby="upload-heading">
        <div
          role="region"
          aria-label="Bill upload drop zone"
          className={`border-4 border-dashed rounded-3xl p-16 text-center transition-all duration-300 focus-within:ring-4 focus-within:ring-blue-300 ${
            dragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
          } ${loading ? 'opacity-70' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="bill-upload"
            aria-label="Select bill file to upload"
          />
          <label htmlFor="bill-upload" className="cursor-pointer block">
            <div className="text-8xl mb-8 text-blue-600" aria-hidden="true">📄</div>
            <p className="text-3xl font-bold text-gray-800 mb-4">
              {loading ? "Analyzing your bill..." : "Drop your bill here or click to upload"}
            </p>
            <p className="text-xl text-gray-600">PDF or image • Max 20MB</p>
            {file && <p className="mt-6 text-2xl text-green-600 font-bold" aria-live="polite">{file.name}</p>}
            {loading && (
              <div className="mt-8 w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" aria-label="Processing"></div>
            )}
          </label>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-300 rounded-xl p-6 mt-8 text-red-700 text-center text-lg" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            type="submit"
            disabled={!file || loading}
            className="btn-primary focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Analyze uploaded bill"
          >
            {loading ? "Processing..." : "Explain My Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
