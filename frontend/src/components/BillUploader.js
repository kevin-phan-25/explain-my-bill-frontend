import { useState } from "react";
import { explainBill } from "../api";

export default function BillUploader({ setExplanation, setIsPaid, setLoading }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const data = await explainBill(formData);
      if (data.error) {
        alert(data.error);
      } else {
        setExplanation(data.explanation);
        setIsPaid(data.isPaid);
      }
    } catch (err) {
      alert("Error processing bill: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0 file:text-sm file:font-semibold
                   file:bg-primary file:text-white hover:file:bg-secondary"
      />
      <button
        onClick={handleUpload}
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
      >
        Upload & Explain
      </button>
    </div>
  );
}
