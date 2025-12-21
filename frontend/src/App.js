import React from "react";
import BillUploader from "./components/BillUploader";

export default function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Explain My Bill</h1>
      <p>Upload your medical or utility bills and get an easy-to-understand explanation.</p>
      <BillUploader />
    </div>
  );
}
