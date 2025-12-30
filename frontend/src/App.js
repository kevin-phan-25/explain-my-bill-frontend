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

// 🔧 DEV MODE / TEST BYPASS FLAG
// You can add ?dev=true to bypass upgrade modal on any URL
// Also supports localStorage.setItem("dev","true") and Vite env VITE_DEV_MODE=true
const DEV_MODE =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1") ||
  new URL(window.location.href).searchParams.get("dev") === "true" ||
  window.localStorage.getItem("dev") === "true" ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    String(import.meta.env.VITE_DEV_MODE || "").toLowerCase() === "true");

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

      // DEV OVERRIDE: treat as paid for testing (front-end side)
      if (DEV_MODE) data.isPaid = true;

      console.log("ExplainMyBill response:", data);
      setResult(data);

      // Show upgrade modal only in PROD and unpaid
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

  const extractionBadge = result?.extractionMeta?.extractorUsed
    ? {
        provider: result.extractionMeta.extractorUsed,
        usedOCR: !!result.extractionMeta.usedOCR,
        textLen: result.extractionMeta.textLen,
        sourceType: result.extractionMeta.sourceType,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-[#070A12] dark:to-[#0B1030]">
      {/* Futuristic subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] dark:opacity-[0.22]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.25) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <header className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-fuchsia-600 py-7 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full border border-white/20">
              <span className="text-white/90 text-sm font-semibold tracking-wide">
                ExplainMyBill
              </span>
              <span className="text-white/60 text-xs">• educational tool</span>
              {DEV_MODE && (
                <span className="ml-2 text-xs font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  DEV MODE
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 mb-2 tracking-tight">
              Understand your bill in plain English
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Upload a bill → we extract the text → AI explains it clearly.
              Always verify amounts before paying.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full border border-white/20 text-white text-sm">
                🔒 processed transiently (never stored)
              </span>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full border border-white/20 text-white text-sm">
                🛡️ no account / no login
              </span>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full border border-white/20 text-white text-sm">
                ⚡ fast explanation
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-10">
        {!result ? (
          <BillUploader onResult={processBill} onLoading={setLoading} />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={reset}
                className="text-indigo-600 dark:text-indigo-300 hover:underline text-sm font-medium"
              >
                ← Analyze Another Bill
              </button>

              {extractionBadge && (
                <div className="text-xs px-3 py-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur">
                  <span className="font-semibold">Extractor:</span>{" "}
                  <span className="uppercase tracking-wide">
                    {extractionBadge.provider}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>{extractionBadge.sourceType}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>{extractionBadge.textLen} chars</span>
                  {extractionBadge.usedOCR && (
                    <>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-amber-600 dark:text-amber-300 font-semibold">
                        OCR fallback used
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <ExplanationCard result={result} />

            {result?.isPaid && result.pages?.[0]?.structured && (
              <PaidFeatures features={result.pages[0].structured} />
            )}
          </>
        )}
      </main>

      <Testimonials />
      <FAQ />

      <section className="relative max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gradient">
          Privacy + Trust
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔒", title: "No Storage", desc: "Processed transiently. Not saved." },
            { icon: "🛡️", title: "No Account", desc: "No login. No profile. No tracking." },
            { icon: "✅", title: "Transparent", desc: "Confidence + source shown. You can view extracted text." },
          ].map((i, k) => (
            <div
              key={k}
              className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-3xl p-6 text-center border border-white/20 shadow-2xl"
            >
              <div className="text-5xl mb-3">{i.icon}</div>
              <h3 className="text-xl font-extrabold mb-2">{i.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative bg-gray-100/70 dark:bg-black/30 backdrop-blur py-8 mt-12 text-center text-gray-600 dark:text-gray-400 text-sm border-t border-white/10">
        © 2025 ExplainMyBill • Educational tool • Verify before paying
      </footer>

      {loading && <Loader />}

      {/* Upgrade modal only in PROD */}
      {showUpgrade && !DEV_MODE && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          stripePromise={stripePromise}
        />
      )}
    </div>
  );
}

export default App;
