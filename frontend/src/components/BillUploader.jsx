import React, { useContext } from "react";
import { BillContext } from "../context/BillContext";
import { useBillUpload } from "../hooks/useBillUpload";
import Loader from "./Loader";

export default function BillUploader() {
  const { file, setFile, loading, error } = useContext(BillContext);
  const { uploadBill } = useBillUpload();

  return (
    <div className="p-6 max-w-xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-4">Explain My Bill</h2>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 p-2 rounded"
      />
      <button
        onClick={uploadBill}
        disabled={loading}
        className="bg-white text-indigo-700 font-bold px-4 py-2 rounded hover:bg-gray-200"
      >
        {loading ? <Loader /> : "Upload & Explain"}
      </button>

      {error && <p className="text-red-300 mt-2">{error}</p>}
    </div>
  );
}
