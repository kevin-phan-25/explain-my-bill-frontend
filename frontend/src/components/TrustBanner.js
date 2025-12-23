import React from "react";

export default function TrustBanner() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-700 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p>
          🔒 <strong>Your privacy matters.</strong> Files are analyzed securely and
          are <strong>not stored, sold, or shared</strong>.
        </p>
        <p className="text-gray-500">
          Educational use only • No medical or legal advice
        </p>
      </div>
    </div>
  );
}
