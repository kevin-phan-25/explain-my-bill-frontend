import React from "react";
import { BillProvider } from "./context/BillContext";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";

export default function App() {
  return (
    <BillProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 flex flex-col items-center justify-center">
        <BillUploader />
        <ExplanationCard />
      </div>
    </BillProvider>
  );
}
