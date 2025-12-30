import React, { useRef, useState } from "react";

export default function BillUploader({ onResult, onLoading }) {
  const inputRef = useRef();
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (file) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".xls", ".xlsx"];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      return "Unsupported file type.";
    }
    if (file.size > 20 * 1024 * 1024) {
      return "File exceeds 20MB.";
    }
    return null;
  };

  const processFile = async (file) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    onLoading(true);
    await onResult(file);
    onLoading(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  return (
    <div className="relative max-w-3xl mx-auto py-10">
      <div className="text-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Upload your bill
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Drag & drop a PDF or image. We extract text, then AI explains it.
        </p>
      </div>

      <input type="file" ref={inputRef} className="hidden" onChange={handleFile} />

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "rounded-[28px] border border-white/20 shadow-2xl overflow-hidden",
          "bg-white/60 dark:bg-white/5 backdrop-blur p-6 sm:p-10",
          "transition-all duration-300",
          dragOver ? "ring-2 ring-indigo-500 scale-[1.01]" : "",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-xl">
            <span className="text-3xl">🧾</span>
          </div>

          <div className="text-center">
            <p className="text-lg font-extrabold">
              {dragOver ? "Drop your file to analyze" : "Drag & drop your bill here"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              PDF, PNG, JPG, XLS/XLSX • Max 20MB
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={() => inputRef.current.click()}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-6 rounded-2xl shadow-xl hover:scale-[1.02]"
            >
              Choose file
            </button>

            <span className="text-xs px-3 py-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/5">
              🔒 processed transiently • never stored
            </span>

            <span className="text-xs px-3 py-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/5">
              ✅ confidence + source shown
            </span>
          </div>

          {error && (
            <div className="mt-4 w-full rounded-2xl border border-red-300/40 bg-red-500/10 p-4 text-center">
              <p className="text-red-700 dark:text-red-200 font-semibold">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
