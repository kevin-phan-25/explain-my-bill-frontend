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

  return (
    <div className="min-h-screen text-gray-900 dark:text-white bg-[#f6f7fb] dark:bg-[#070814]">
      {/* Ambient futuristic background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(50%_50%_at_10%_80%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(60%_60%_at_90%_75%,rgba(34,211,238,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-black/40 dark:to-black/70" />
      </div>

      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative py-8 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur">
              <span className="text-lg">🧾</span>
              <span className="text-white/95 text-sm font-semibold tracking-wide">
                ExplainMyBill
              </span>
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Understand your bill in seconds
            </h1>
            <p className="mt-3 text-base sm:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Instant medical bill explanations — private & free to try. Clear summaries, key amounts, and practical next steps.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-5 py-2 rounded-full border border-white/25">
                <span className="text-xl">🔒</span>
                <span className="text-white text-sm font-semibold">
                  Deleted immediately — never stored
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-5 py-2 rounded-full border border-white/25">
                <span className="text-xl">🛡️</span>
                <span className="text-white text-sm font-semibold">
                  No account • No login
                </span>
              </div>

              {DEV_MODE && (
                <div className="inline-flex items-center gap-2 bg-emerald-400/15 backdrop-blur px-5 py-2 rounded-full border border-emerald-300/30">
                  <span className="text-lg">🧪</span>
                  <span className="text-white text-sm font-semibold">
                    Dev mode active (upgrade disabled)
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-white/25 bg-white/10 backdrop-blur px-4 py-3 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-white/90 text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">⚡</span>
                  <div>
                    <p className="font-bold text-white">Fast</p>
                    <p className="text-white/80">Results in ~15–30 seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">🧠</span>
                  <div>
                    <p className="font-bold text-white">Plain English</p>
                    <p className="text-white/80">No confusing billing jargon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">✅</span>
                  <div>
                    <p className="font-bold text-white">Trustworthy</p>
                    <p className="text-white/80">Confidence scores + “verify” prompts</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {!result ? (
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_50%_at_15%_85%,rgba(168,85,247,0.15),transparent_55%)] blur-2xl pointer-events-none" />
            <div className="relative rounded-[2rem] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Upload a bill
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    PDFs work best (text-layer). Images are supported too — clearer is better.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2">
                  <span className="text-lg">🔍</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    We never store your file
                  </span>
                </div>
              </div>

              <BillUploader onResult={processBill} onLoading={setLoading} />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "📄", title: "Best input", desc: "PDF with selectable text" },
                  { icon: "📸", title: "Images ok", desc: "Use sharp, high-contrast photos" },
                  { icon: "🧾", title: "Works for", desc: "Medical • Utility • Credit" },
                ].map((i, k) => (
                  <div
                    key={k}
                    className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 shadow-lg"
                  >
                    <div className="text-3xl">{i.icon}</div>
                    <div className="mt-2 font-bold text-gray-900 dark:text-white">{i.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{i.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-4 py-2 shadow-lg text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:shadow-xl transition"
              >
                <span>←</span> Analyze Another Bill
              </button>
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

      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-extrabold text-center mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Privacy Is Guaranteed
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          This tool is designed to be privacy-first. No account, no saved files, no long-term storage.
          Educational help only — always verify amounts on the original statement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔒", title: "No Storage", desc: "Deleted instantly" },
            { icon: "🛡️", title: "No Account", desc: "No sign-up needed" },
            { icon: "⚡", title: "Secure", desc: "Private processing" },
          ].map((i, k) => (
            <div
              key={k}
              className="rounded-[1.75rem] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-6 text-center shadow-xl hover:shadow-2xl transition"
            >
              <div className="text-5xl mb-3">{i.icon}</div>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">{i.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 mt-6 text-center text-gray-600 dark:text-gray-300 text-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 shadow-lg">
            © 2025 ExplainMyBill • Educational tool • Verify all amounts on your original statement
          </div>
        </div>
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
