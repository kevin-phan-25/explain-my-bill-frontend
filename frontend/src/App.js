import { useState } from "react";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";
import "./styles/App.css";

function App() {
  const [explanation, setExplanation] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-container">
      <header className="header animate-fadeIn">
        <h1 className="title">Explain My Bill</h1>
        <p className="subtitle">
          Upload your medical or utility bills and get a clear, simple explanation.
        </p>
      </header>

      <BillUploader
        setExplanation={setExplanation}
        setIsPaid={setIsPaid}
        setLoading={setLoading}
      />

      {loading && <p className="loading-text animate-fadeIn">Processing your bill...</p>}

      {explanation && (
        <ExplanationCard explanation={explanation} isPaid={isPaid} />
      )}
    </div>
  );
}

export default App;
