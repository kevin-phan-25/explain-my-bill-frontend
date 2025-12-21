import { useContext } from "react";
import { BillContext } from "../context/BillContext";
import { explainBill } from "../api/explainApi";

export const useBillUpload = () => {
  const { file, setExplanation, setLoading, setError } = useContext(BillContext);

  const uploadBill = async () => {
    if (!file) return setError("No file selected.");

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const data = await explainBill(file);
      if (data.error) setError(data.error);
      else setExplanation(data.explanation);
    } catch (err) {
      setError(err.message || "Failed to process bill.");
    } finally {
      setLoading(false);
    }
  };

  return { uploadBill };
};
