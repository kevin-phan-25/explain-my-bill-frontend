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
      setError(err.message || "Failed to analyze bill.");
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={`border-4 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
        />
        <label htmlFor="bill-upload" className="cursor-pointer block">
          <div className="text-6xl mb-4 text-blue-600" aria-hidden="true">📄</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">
            {loading ? "Analyzing..." : "Drop your bill or click to upload"}
          </p>
          <p className="text-base text-gray-600">PDF or image • Max 20MB</p>
          {file && <p className="mt-4 text-xl text-green-600 font-bold">{file.name}</p>}
        </label>
      </div>

      {error && <p className="text-red-600 text-center text-lg">{error}</p>}

      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary text-xl py-4 px-10"
        >
          {loading ? "Processing..." : "Explain My Bill"}
        </button>
      </div>
    </form>
  );
}
