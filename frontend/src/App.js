import { useState } from "react";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";

function App() {
  const [explanation, setExplanation] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-primary mb-4 text-center">
        Explain My Bill
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-xl">
        Upload your medical or utility bills and get a clear, simple explanation.
      </p>

      <BillUploader
        setExplanation={setExplanation}
        setIsPaid={setIsPaid}
        setLoading={setLoading}
      />

      {loading && <p className="text-gray-500 mt-4">Processing your bill...</p>}

      {explanation && (
        <ExplanationCard explanation={explanation} isPaid={isPaid} />
      )}
    </div>
  );
}

export default App;
