import React from "react";
import { explainBill } from "../api/explainApi";

export default function BillUploader({ onResult, onLoading }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onLoading(true);
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const data = await explainBill(formData);
      onResult(data);
    } catch (err) {
      alert("We couldn't process that bill. Please try another file.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-4">
        Upload a medical bill to get a clear, plain-English explanation.
        <br />
        <span className="text-sm text-gray-500">
          No account required • Files are not saved
        </span>
      </p>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleUpload}
        className="mx-auto block"
      />
    </div>
  );
}
