import React, { useState } from "react";
import Billing from "./Billing";
import UploadBill from "./UploadBill";

function App() {
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-container" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Explain My Bill</h1>
      <p>Upload your medical or any bill and get an easy-to-understand explanation.</p>

      {!billData && (
        <UploadBill
          setBillData={setBillData}
          setLoading={setLoading}
        />
      )}

      {loading && <p>Processing your bill... please wait.</p>}

      {billData && !loading && (
        <Billing data={billData} setBillData={setBillData} />
      )}
    </div>
  );
}

export default App;
