// src/components/PageTab.js
import React from 'react';

export default function PageTab({ pages, activePage, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {pages.map((page, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`px-4 py-2 rounded-xl font-medium transition ${
            i === activePage ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
        >
          Page {page.page}
        </button>
      ))}
    </div>
  );
}
