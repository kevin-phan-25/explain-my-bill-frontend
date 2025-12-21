import React, { useRef } from "react";
import { explainBill } from "../api";

export default function BillUploader({ setExplanation, setIsPaid, setLoading }) {
  const fileInput = useRef();

  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    if (!file) return alert("Please select a file.");

    setLoading(true);
    setExplanation("");
    setIsPaid(false);

    try {
      const formData = new FormData();
      formData.append("bill", file);
      const data = await explainBill(formData);
      if (data.error) alert(data.error);
      else {
        setExplanation(data.explanation);
        setIsPaid(data.isPaid);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card animate-fadeIn">
      <input
        type="file"
        ref={fileInput}
        accept=".pdf,.jpg,.png"
        className="file-input"
      />
      <button className="btn" onClick={handleUpload}>Upload & Explain</button>
    </div>
  );
}
