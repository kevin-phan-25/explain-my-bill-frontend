import React from "react";

export default function ExplanationCard({ data }) {
  return (
    <div className="card">
      <h2>Bill Explanation</h2>
      {data.isPaid ? (
        <p>{data.explanation}</p>
      ) : (
        <p>
          {data.explanation} <br />
          <strong>Upgrade to get the full detailed explanation.</strong>
        </p>
      )}
    </div>
  );
}
