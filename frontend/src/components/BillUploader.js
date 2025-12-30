import React, { useRef, useState, useCallback } from "react";

export default function BillUploader({ onResult, onLoading }) {
  const inputRef = useRef();
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const validate = (file) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".xls", ".xlsx"];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      return "Unsupported file type. Upload PDF, PNG, JPG, or Excel.";
    }
    if (file.size > 20 * 1024 * 1024) {
      return "File exceeds 20MB.";
    }
    return null;
  };

  const processFile = useCallback(
    async (file) => {
      const v = validate(file);
      if (v) {
        setError(v);
        return;
      }

      setError(null);
      onLoading(true);
      await onResult(file);
      onLoading(false);
    },
    [onResult, onLoading]
  );

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
    <div className="relative">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFile}
        accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx"
      />

      <div className="max-w-3xl mx-auto rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_80px_-30px_rgba(0,0,0,0.85)]">
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            "cursor-pointer rounded-3xl border border-dashed p-10 text-center transition",
            dragOver
              ? "border-indigo-300/70 bg-indigo-500/10"
              : "border-white/15 bg-white/[0.03] hover:bg-white/[0.06]",
          ].join(" ")}
        >
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold">
            Drop your bill here
          </h2>
          <p className="mt-2 text-white/70 text-sm">
            or click to upload (PDF, PNG/JPG, Excel • max 20MB)
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-5 py-2">
            <span className="text-sm font-semibold">Upload Bill</span>
            <span className="text-white/60 text-xs">→</span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/60">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              ✅ Evidence Snippets
            </div>
               <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              🧠 No Data Retention 
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              🔒 No Account / No Storage
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
