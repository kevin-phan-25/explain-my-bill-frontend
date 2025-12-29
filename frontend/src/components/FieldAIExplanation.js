import React, { useState } from "react";

export default function FieldAIExplanation({ explanation }) {
  const [open, setOpen] = useState(false);

  if (!explanation) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-indigo-600 hover:underline"
      >
        {open ? "Hide" : "Why might this be wrong?"}
      </button>

      {open && (
        <div className="mt-1 text-xs bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          {explanation}
        </div>
      )}
    </div>
  );
}
