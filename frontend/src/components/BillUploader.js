import React, { useState } from 'react';
import { uploadBillToAPI } from '../api/explainApi';

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===================== IMAGE UPSCALE BEFORE UPLOAD =====================
  const preprocessFile = async (file) => {
    const fileType = file.type;
    if (!fileType.startsWith('image/')) return file; // Only images need preprocessing

    const img = await loadImageFromFile(file);
    const scale = Math.max(1500 / img.width, 1500 / img.height, 1);

    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.filter = 'contrast(1.3) brightness(1.1)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const newFile = new File([blob], file.name, { type: 'image/jpeg' });
        resolve(newFile);
      }, 'image/jpeg', 0.9);
    });
  };

  const loadImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ===================== FORM SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    onLoading(true);

    try {
      const processedFile = await preprocessFile(file);
      const data = await uploadBillToAPI(processedFile);
      onResult(data);
    } catch (err) {
      setError(err.message || 'Upload failed');
      console.error(err);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={`border-4 border-dashed rounded-lg p-5 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${loading ? 'opacity-70' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) setFile(droppedFile);
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf,.xlsx,.xls"
          onChange={(e) => {
            const selected = e.target.files[0];
            if (selected) setFile(selected);
          }}
          className="hidden"
          id="bill-upload"
        />
        <label htmlFor="bill-upload" className="cursor-pointer block">
          <div className="text-4xl mb-2 text-blue-600" aria-hidden="true">
            Document
          </div>
          <p className="text-base font-bold text-gray-800 mb-1">
            {loading ? 'Analyzing your bill...' : 'Drop bill or click to upload'}
          </p>
          <p className="text-xs text-gray-600">PDF, image, or Excel • Max 20MB</p>
          {file && (
            <p className="mt-2 text-sm text-green-600 font-bold">{file.name}</p>
          )}
        </label>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
          <p className="font-bold">Upload Failed</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check browser console (F12) for more details.</p>
        </div>
      )}

      <div className="text-center">
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Explain My Bill'}
        </button>
      </div>
    </form>
  );
}