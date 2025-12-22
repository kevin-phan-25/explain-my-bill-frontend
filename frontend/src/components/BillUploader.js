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
      setError(err.message);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="glass-card p-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Bill</h2>
      <p className="text-center text-gray-600 mb-6">
        Get a clear explanation in seconds. We help you understand charges, codes, and next steps.
      </p>
      <p className="text-sm text-center text-gray-500 mb-8 bg-amber-50 p-4 rounded-lg">
        🔒 Your bill is processed securely and <strong>deleted immediately</strong> — we do not store any data.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`border-4 border-dashed rounded-2xl p-12 text-center transition ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
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
            id="upload"
          />
          <label htmlFor="upload" className="cursor-pointer block">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl font-medium">
              {loading ? "Analyzing..." : "Drop your bill here or click to upload"}
            </p>
            <p className="text-gray-500 mt-2">PDF or image • Max 20MB</p>
            {file && <p className="mt-4 text-green-600 font-medium">{file.name}</p>}
          </label>
        </div>

        {error && <p className="text-red-600 mt-6 text-center">{error}</p>}

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary mt-8 w-full py-4 text-xl"
        >
          {loading ? "Processing..." : "Explain My Bill"}
        </button>
      </form>
    </div>
  );
}
