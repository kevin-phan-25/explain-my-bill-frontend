import React from 'react';

export default function PageTab({ page, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl transition font-medium ${
        active
          ? 'bg-primary text-white shadow-lg'
          : 'bg-white/70 text-gray-700 hover:bg-white'
      }`}
    >
      Page {page.page}
    </button>
  );
}
