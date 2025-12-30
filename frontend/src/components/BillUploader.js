import React, { useRef, useState } from "react";

export default function BillUploader({ onResult, onLoading }) {
  const inputRef = useRef();
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const validateFile = (file) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".xls", ".xlsx"];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      return "Unsupported file type. Use PDF, PNG, JPG, XLS, or XLSX.";
    }
    if (file.size > 20 * 1024 * 1024) {
      return "File exceeds 20MB.";
    }
    return null;
  };

  const processFile = async (file) => {
    const msg = validateFile(file);
    if (msg) {
      setError(msg);
      return;
    }

    setError(null);
    setSelectedName(file.name);
    setSelectedSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

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

    const file = e.dataTransfer?.files?.[0];
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
    <div className="text-center">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFile}
        accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx"
      />

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={[
          "group cursor-pointer rounded-3xl border backdrop-blur-xl transition-all",
          "px-6 py-10 md:px-10 md:py-12",
          dragOver
            ? "border-indigo-300/40 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_45px_rgba(99,102,241,0.25)]"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        ].join(" ")}
      >
        <div className="mx-auto max-w-xl">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.06] flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.12)]">
            <span className="text-2xl">⬆️</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-white">
            {dragOver ? "Drop it here" : "Drag & drop your bill"}
          </h3>

          <p className="mt-2 text-sm text-white/65">
            Or click to upload. Supported: PDF, PNG, JPG, XLS, XLSX (max 20MB).
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
              🔒 transient processing
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
              ✅ confidence shown
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
              ⚡ fast results
            </span>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white
                         bg-gradient-to-r from-indigo-600 to-fuchsia-600
                         hover:from-indigo-500 hover:to-fuchsia-500
                         shadow-[0_18px_60px_rgba(99,102,241,0.25)]"
            >
              <span>Upload Your Bill</span>
              <span className="opacity-80">→</span>
            </button>
          </div>

          {(selectedName || selectedSize) && (
            <div className="mt-4 text-xs text-white/70">
              Selected: <span className="font-semibold">{selectedName}</span>
              {selectedSize ? <span className="opacity-70"> • {selectedSize}</span> : null}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
