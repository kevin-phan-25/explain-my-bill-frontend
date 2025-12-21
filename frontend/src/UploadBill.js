import React, { useState } from "react";
import { uploadBill } from "./api";

export default function UploadBill() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult("");

    const data = await uploadBill(formData);

    if (data.error) setResult(data.error);
    else setResult(data.explanation || "No explanation received");

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Explain My Bill</h1>
      <p>Upload your medical or any bill, and we'll explain it for you.</p>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">{loading ? "Processing..." : "Upload & Explain"}</button>
      </form>
      {result && <div className="result">{result}</div>}
    </div>
  );
}
