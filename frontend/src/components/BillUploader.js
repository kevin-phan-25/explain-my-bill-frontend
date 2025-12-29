import React, { useState } from "react";

export default function BillUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
      <h1 className="text-2xl font-bold">Explain My Bill</h1>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full"
      />

      <button
        disabled={!file}
        onClick={() => onUpload(file)}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-50"
      >
        Explain My Bill
      </button>
    </div>
  );
}
