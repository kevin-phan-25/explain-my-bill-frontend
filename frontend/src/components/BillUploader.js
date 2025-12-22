import React, { useState } from 'react';
import { explainBill } from '../api/explainApi';

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    onLoading(true);
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const data = await explainBill(formData);
      onResult(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="glass-card p-10 text-center">
      <h2 className="text-3xl font-semibold mb-6">Upload Your Bill</h2>
      <p className="text-gray-600 mb-8">
        Medical, dental, utility, credit card — we explain them all in plain English.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`border-4 border-dashed rounded-2xl p-12 transition ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
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
          <label htmlFor="bill-upload" className="cursor-pointer">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl font-medium">Drop your bill here or click to upload</p>
            <p className="text-gray-500 mt-2">PDF or image accepted</p>
          </label>
          {file && <p className="mt-4 text-green-600 font-medium">{file.name}</p>}
        </div>

        <button
          type="submit"
          disabled={!file}
          className="btn-primary mt-8 text-lg px-12 py-4"
        >
          Analyze My Bill
        </button>
      </form>
    </div>
  );
}
