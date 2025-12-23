import React, { useState } from 'react';
import { uploadBillToAPI } from '../api/explainApi.js'; // ← Correct import

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

    try {
      // Directly pass the file — uploadBillToAPI handles FormData
      const data = await uploadBillToAPI(file);
      onResult(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={`border-4 border-dashed rounded-lg p-5 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${loading ? 'opacity-70' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) setFile(droppedFile);
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf,.xlsx,.xls"
          onChange={(e) => {
            const selected = e.target.files[0];
            if (selected) setFile(selected);
          }}
          className="hidden"
          id="bill-upload"
        />
        <label htmlFor="bill-upload" className="cursor-pointer block">
          <div className="text-4xl mb-2 text-blue-600" aria-hidden="true">Document</div>
          <p className="text-base font-bold text-gray-800 mb-1">
            {loading ? "Analyzing your bill..." : "Drop bill or click to upload"}
          </p>
          <p className="text-xs text-gray-600">PDF, image, or Excel • Max 20MB</p>
          {file && <p className="mt-2 text-sm text-green-600 font-bold">{file.name}</p>}
        </label>
      </div>

      {error && <p className="text-red-600 text-center text-sm font-medium">{error}</p>}

      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Explain My Bill"}
        </button>
      </div>
    </form>
  );
}
