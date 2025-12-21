import React, { useState } from "react";
import { uploadBill } from "./api";

export default function UploadBill({ setBillData, setLoading }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    setLoading(true);
    try {
      const result = await uploadBill(file);
      setBillData(result);
    } catch (err) {
      alert("Error processing bill: " + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>Upload</button>
    </form>
  );
}
