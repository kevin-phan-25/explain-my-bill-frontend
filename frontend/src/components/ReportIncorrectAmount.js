import React, { useState } from "react";

export default function ReportIncorrectAmount({ field, value }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!field) return null;

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="text-red-600 hover:underline"
      >
        {open ? "Cancel report" : "Report incorrect amount"}
      </button>

      {open && (
        <div className="mt-2 p-3 border border-red-200 bg-red-50 rounded-lg space-y-2">
          <p className="font-semibold">
            Why do you believe this amount is incorrect?
          </p>

          <textarea
            className="w-full text-xs p-2 border rounded-md"
            placeholder="Example: This charge appears twice on the bill"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <p className="text-gray-600">
            ⚠️ This feedback is not saved or transmitted.  
            It is only used to help you generate a dispute letter.
          </p>
        </div>
      )}
    </div>
  );
}
