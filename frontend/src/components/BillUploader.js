import React, { useRef, useState } from 'react';
import { uploadBillToAPI } from '../api/explainApi'; // your API call

export default function BillUploader({ onResult, onLoading }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    onLoading(true);

    try {
      // Only accept images or PDFs under 4MB
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Only images and PDFs are allowed.');
        onLoading(false);
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError('File must be under 4MB.');
        onLoading(false);
        return;
      }

      // Upload to your API
      const formData = new FormData();
      formData.append('bill', file);

      const response = await uploadBillToAPI(formData);
      if (response && response.explanation) {
        onResult({
          isPaid: response.isPaid || false,
          explanation: response.explanation,
          features: response.features || {},
        });
      } else {
        setError('Could not process your bill. Try a clear image or PDF.');
      }
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="text-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />
      <button
        onClick={handleClick}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:scale-105 transition transform"
      >
        Upload Bill
      </button>

      {error && (
        <p className="text-red-600 mt-4 text-lg font-semibold">{error}</p>
      )}

      <p className="text-gray-500 mt-2 text-sm">
        Supported formats: JPG, PNG, PDF. Max size: 4MB.
      </p>
    </div>
  );
}
