import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import BillUploader from "./components/BillUploader";
import ExplanationCard from "./components/ExplanationCard";
import PaidFeatures from "./components/PaidFeatures";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import UpgradeModal from "./components/UpgradeModal";
import Loader from "./components/Loader";

const stripePromise = loadStripe("pk_test_51YourTestKeyHere");
const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortControllerRef = useRef(null);

  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("onrender.com");

  // Reset state
  const reset = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setResult(null);
    setShowUpgrade(false);
    setStreamingText("");
  };

  // Handle bill result
  const handleResult = (data) => {
    if (isDev || data?.isPaid) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else {
      setShowUpgrade(true);
    }
    setResult(data);
  };

  // Upload & stream processing
  const processBill = async (file) => {
    setLoading(true);
    setStreamingText("");
    abortControllerRef.current = new AbortController();
    const form = new FormData();
    form.append("bill", file);

    try {
      // Send file to Cloudflare Worker
      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: form,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Stream response text
      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let text = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            text += chunk;
            setStreamingText(text);
          }
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Failed to parse AI response");
        }

        // Fallback to second AI if first fails
        if (!data.pages) {
          console.warn("Primary AI failed, trying fallback AI");
          const fallback = await fetch(WORKER_URL + "/fallback", {
            method: "POST",
            body: form,
          });
          data = await fallback.json();
        }

        handleResult(data);
      } else {
        const text = await res.text();
        handleResult(JSON.parse(text));
      }
    } catch (err) {
      console.error("Bill processing error:", err);
      setStreamingText("AI failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 shadow-lg">
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

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!result ? (
          <>
            <BillUploader
              onResult={processBill}
              onLoading={setLoading}
            />
            {streamingText && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl prose dark:prose-invert max-w-none">
                {streamingText}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={reset}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
            {result.isPaid && result.pages[0]?.structured && (
              <PaidFeatures features={result.pages[0].structured} />
            )}
          </>
        )}
      </main>

      <Testimonials />
      <FAQ />

      {/* Privacy */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Privacy Is Guaranteed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔒", title: "No Storage", desc: "Deleted instantly" },
            { icon: "🛡️", title: "No Account", desc: "No sign-up needed" },
            { icon: "⚡", title: "Secure", desc: "Private processing" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 text-center border border-white/20"
            >
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2025 ExplainMyBill • Educational tool</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
      )}
    </div>
  );
}

export default App;
