import React, { useRef, useState } from "react";

export default function BillUploader({ onResult, onLoading }) {
  const inputRef = useRef();
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".xls", ".xlsx"];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError("Unsupported file type.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File exceeds 20MB.");
      return;
    }

    setError(null);
    onLoading(true);
    await onResult(file);
    onLoading(false);
  };

  return (
    <div className="text-center py-12">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current.click()}
        className="bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700"
      >
        Upload Your Bill
      </button>
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
