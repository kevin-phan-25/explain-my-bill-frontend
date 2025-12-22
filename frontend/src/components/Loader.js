import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-medium">Analyzing your bill...</p>
        <p className="text-gray-600">This usually takes 10-20 seconds</p>
      </div>
    </div>
  );
}
