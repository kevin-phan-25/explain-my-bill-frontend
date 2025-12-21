import React, { useContext } from "react";
import { BillContext } from "../context/BillContext";

export default function ExplanationCard() {
  const { explanation } = useContext(BillContext);

  if (!explanation) return null;

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-xl max-w-xl mx-auto text-gray-800 whitespace-pre-wrap">
      {explanation}
    </div>
  );
}
