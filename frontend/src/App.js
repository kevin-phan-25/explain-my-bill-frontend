import React, { useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";
import PaidFeatures from "./components/PaidFeatures";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import UpgradeModal from "./components/UpgradeModal";
import Loader from "./components/Loader";

// Load Stripe
const stripePromise = loadStripe("pk_test_51YourTestKeyHere");
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

// 🔧 DEV MODE FLAG
const DEV_MODE =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const abortRef = useRef(null);

  const reset = () => {
    abortRef.current?.abort();
    setResult(null);
    setShowUpgrade(false);
  };

  const processBill = async (file) => {
    setLoading(true);
    abortRef.current = new AbortController();

    const form = new FormData();
    form.append("bill", file);

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: form,
        signal: abortRef.current.signal,
        headers: DEV_MODE ? { "X-Dev-Bypass": "true" } : {},
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = await res.json();

      // DEV OVERRIDE
      if (DEV_MODE) data.isPaid = true;

      console.log("ExplainMyBill response:", data);
      setResult(data);

      if (!DEV_MODE && !data?.isPaid) {
        setShowUpgrade(true);
      }
    } catch (e) {
      console.error("Bill processing failed:", e);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ExplainMyBill</h1>
          <p className="text-lg text-white/90">
            Instant medical bill explanations — private & free to try
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-5 py-2 rounded-full">
            <span className="text-xl">🔒</span>
            <span className="text-white text-sm font-medium">
              Deleted immediately — never stored
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!result ? (
          <BillUploader onResult={processBill} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={reset}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
              >
                ← Analyze Another Bill
              </button>
            </div>

            <ExplanationCard
              result={result}
              onUpgrade={() => setShowUpgrade(true)}
            />

            {result?.isPaid && result.pages?.[0]?.structured && (
              <PaidFeatures features={result.pages[0].structured} />
            )}
          </>
        )}
      </main>

      <Testimonials />
      <FAQ />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Privacy Is Guaranteed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔒", title: "No Storage", desc: "Deleted instantly" },
            { icon: "🛡️", title: "No Account", desc: "No sign-up needed" },
            { icon: "⚡", title: "Secure", desc: "Private processing" },
          ].map((i, k) => (
            <div
              key={k}
              className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/20"
            >
              <div className="text-5xl mb-3">{i.icon}</div>
              <h3 className="text-xl font-bold mb-2">{i.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
        © 2025 ExplainMyBill • Educational tool
      </footer>

      {loading && <Loader />}

      {/* Upgrade modal only in PROD */}
      {showUpgrade && !DEV_MODE && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
      )}
    </div>
  );
}

export default App;
