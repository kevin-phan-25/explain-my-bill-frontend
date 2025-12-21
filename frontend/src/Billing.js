import React from "react";

export default function Billing({ data, setBillData }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Bill Explanation</h2>
      <pre style={{ background: "#eee", padding: "1rem", whiteSpace: "pre-wrap" }}>
        {data.explanation}
      </pre>
      <button
        onClick={() => setBillData(null)}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Upload Another Bill
      </button>
    </div>
  );
}
