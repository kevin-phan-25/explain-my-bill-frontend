import React, { useState, useRef } from "react";

export default function BillUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) onUpload(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`max-w-xl mx-auto p-6 rounded-xl border-2 ${
          dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        } text-center cursor-pointer transition`}
      >
        {file ? (
          <p className="text-lg font-semibold">{file.name}</p>
        ) : (
          <p className="text-lg">
            Drag & drop your bill here, or click to select
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <button
        disabled={!file}
        onClick={handleUpload}
        className="mt-4 w-full max-w-xl mx-auto bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-50"
      >
        Explain My Bill
      </button>
    </div>
  );
}
