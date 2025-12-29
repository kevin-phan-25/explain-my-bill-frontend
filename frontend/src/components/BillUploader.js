import React, { useState, useRef } from "react";

export default function BillUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-xl shadow-lg bg-gradient-to-br from-indigo-50 to-white space-y-4">
      <h1 className="text-3xl font-bold text-indigo-700">Explain My Bill</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-indigo-600 bg-indigo-50 shadow-inner"
            : "border-gray-300 bg-white"
        }`}
      >
        {file ? (
          <p className="text-indigo-700 font-medium">{file.name}</p>
        ) : (
          <p className="text-gray-400">
            Drag & drop your file here, or click to select<br />
            <span className="text-sm">Supported: PDF, PNG, JPG, JPEG</span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <button
        disabled={!file}
        onClick={() => onUpload(file)}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
      >
        Explain My Bill
      </button>
    </div>
  );
}
