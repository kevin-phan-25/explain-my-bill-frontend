import React, { useState } from "react";
import { uploadBill } from "../api";
import ExplanationCard from "./ExplanationCard";

export default function BillUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExplanation(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first.");
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("bill", file);

    const res = await uploadBill(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setExplanation(res);
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Upload Your Bill</h2>
      <input type="file" accept=".jpg,.png,.pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginTop: "1rem" }}>
        {loading ? <span className="loader"></span> : "Explain Bill"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {explanation && <ExplanationCard data={explanation} />}
    </div>
  );
}
