import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";
import UpgradeModal from "./components/UpgradeModal";
import Loader from "./components/Loader";
import Testimonials from "./components/Testimonials";
import TrustBanner from "./components/TrustBanner";

const stripePromise = loadStripe("pk_test_51YourTestKeyHere");

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("onrender.com");

  const handleResult = (data) => {
    data.isPaid = isDev || data.isPaid;
    setShowUpgrade(!data.isPaid);
    setResult(data);
  };

  const reset = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <header className="bg-blue-800 text-white py-14 text-center shadow-xl">
        <h1 className="text-4xl font-bold">ExplainMyBill</h1>
        <p className="text-xl mt-4">
          Medical bills explained in plain English.
        </p>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <TrustBanner />

        <div className="glass-card p-6 shadow-2xl">
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-8">
              <button
                onClick={reset}
                className="bg-gray-800 text-white px-6 py-3 rounded-xl"
              >
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard
              result={result}
              onUpgrade={() => setShowUpgrade(true)}
            />
          </>
        )}

        {loading && <Loader />}
        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            stripePromise={stripePromise}
          />
        )}
      </main>

      <Testimonials />

      <footer className="bg-blue-900 text-white py-10 text-center text-sm">
        <p className="font-semibold mb-2">
          Understand your medical bills — not medical care.
        </p>
        <p className="opacity-90 max-w-2xl mx-auto">
          ExplainMyBill provides educational information only and does not offer
          medical, legal, or insurance advice. Uploaded documents are processed
          temporarily and are not stored, sold, or shared.
        </p>
        <p className="mt-4 opacity-70">© 2025 ExplainMyBill</p>
      </footer>
    </div>
  );
}
