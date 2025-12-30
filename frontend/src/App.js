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
const DEV_MODE =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1") ||
  new URL(window.location.href).searchParams.get("dev") === "true";

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

      // DEV OVERRIDE: treat as paid for testing
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

  const debug = result?.debug;
  const extractorUsed = result?.pages?.[0]?.structured?.confidenceMeta?.extractorUsed || debug?.extractorUsed;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-white">
      {/* Background grid glow */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.30),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.20),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <header className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              <span className="text-lg">🔒</span>
              <span className="text-xs text-white/80">
                Processed transiently • no account • not stored
              </span>
              {extractorUsed && (
                <span className="ml-2 text-[11px] rounded-full bg-white/10 px-2 py-1 text-white/70">
                  extractor: {String(extractorUsed)}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                ExplainMyBill
              </span>
            </h1>

            <p className="max-w-2xl text-white/80 text-sm sm:text-base">
              Upload a medical bill and get a clear, human explanation with evidence-backed amounts.
              Always verify totals before paying.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-10">
        {!result ? (
          <BillUploader onResult={processBill} onLoading={setLoading} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={reset}
                className="text-sm text-white/80 hover:text-white underline underline-offset-4"
              >
                ← Analyze Another Bill
              </button>

              <div className="text-xs text-white/60">
                {DEV_MODE ? (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1">
                    Dev mode: unlocked
                  </span>
                ) : (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    Educational tool
                  </span>
                )}
              </div>
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

      <section className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">
          <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
            Privacy & Trust
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🧼", title: "No Storage", desc: "Processed transiently and returned to you" },
            { icon: "🛡️", title: "No Account", desc: "No sign-up required" },
            { icon: "🔎", title: "Evidence-Based", desc: "Amounts include snippets when possible" },
          ].map((i, k) => (
            <div
              key={k}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_80px_-30px_rgba(0,0,0,0.8)]"
            >
              <div className="text-4xl mb-3">{i.icon}</div>
              <h3 className="text-lg font-bold mb-2">{i.title}</h3>
              <p className="text-white/70 text-sm">{i.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/50 max-w-3xl mx-auto">
          This app is for educational use and is not medical, legal, or billing advice.
          It is not HIPAA-certified. Use discretion when uploading sensitive documents.
        </p>
      </section>

      <footer className="relative z-10 py-10 text-center text-white/50 text-sm border-t border-white/10">
        © 2025 ExplainMyBill • Educational tool
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
