import React from "react";

export default function TrustBanner() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-700 shadow-sm">
      <p>
        🔒 <strong>Your privacy matters.</strong> Files are analyzed securely and
        are <strong>not stored, sold, or shared</strong>.
      </p>
      <p className="text-gray-500 mt-1">
        Educational use only • No medical or legal advice
      </p>
    </div>
  );
}
