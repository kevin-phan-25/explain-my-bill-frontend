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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={`border-4 border-dashed rounded-lg p-4 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400'
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
          <div className="text-4xl mb-2 text-blue-600" aria-hidden="true">📄</div>
          <p className="text-base font-bold text-gray-800 mb-1">
            {loading ? "Analyzing..." : "Drop bill or click to upload"}
          </p>
          <p className="text-xs text-gray-600">PDF or image • Max 20MB</p>
          {file && <p className="mt-2 text-sm text-green-600 font-bold">{file.name}</p>}
        </label>
      </div>

      {error && <p className="text-red-600 text-center text-sm">{error}</p>}

      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-base shadow transition"
        >
          {loading ? "Processing..." : "Explain My Bill"}
        </button>
      </div>
    </form>
  );
}
