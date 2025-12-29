import React, { useState, useRef } from "react";
import { CloudArrowUpIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";

export default function FuturisticBillUploader({ onUpload }) {
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
    <div className="max-w-xl mx-auto p-6 rounded-2xl shadow-2xl bg-gradient-to-tr from-indigo-50 to-white space-y-6 border border-indigo-200">
      <h1 className="text-3xl font-extrabold text-indigo-700 text-center animate-pulse">
        Explain My Bill
      </h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-16 cursor-pointer transition-all duration-300
          ${dragOver ? "border-indigo-500 bg-indigo-50 shadow-inner scale-105" : "border-gray-300 bg-white hover:scale-105 hover:shadow-lg"}
          flex flex-col items-center justify-center text-center
        `}
      >
        {!file ? (
          <>
            <CloudArrowUpIcon className="w-16 h-16 text-indigo-300 mb-4 animate-bounce" />
            <p className="text-gray-400 font-medium">
              Drag & drop your file here, or click to select
            </p>
            <p className="text-sm text-gray-300 mt-1">Supported: PDF, PNG, JPG, JPEG</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <DocumentCheckIcon className="w-12 h-12 text-green-400" />
            <p className="text-indigo-700 font-semibold">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
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
        className="w-full bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-lg"
      >
        Explain My Bill
      </button>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
