import React, { useState, useRef, useMemo } from "react";
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

  const headerSubtitle = useMemo(() => {
    return DEV_MODE
      ? "Developer Mode — full access enabled"
      : "Instant bill explanations — private & free to try";
  }, []);

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
    <div className="min-h-screen bg-[#070A12] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-20 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.16),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/25 via-purple-600/20 to-fuchsia-600/25 blur-2xl" />
        <div className="relative border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/80">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
              <span>Private • No accounts • Processed transiently</span>
              {DEV_MODE && (
                <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200 border border-emerald-500/20">
                  DEV MODE
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
                ExplainMyBill
              </span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-white/75">
              {headerSubtitle}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80">
                <span className="text-lg">🔒</span>
                <span>Deleted immediately — never stored</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80">
                <span className="text-lg">⚡</span>
                <span>Fast results with confidence scoring</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80">
                <span className="text-lg">🧾</span>
                <span>PDF / Images / Excel supported</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-10">
        {!result ? (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Upload your bill
                    </h2>
                    <p className="mt-2 text-white/70">
                      Drag & drop or click to upload. We’ll simplify it into
                      plain English and show key amounts with confidence.
                    </p>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="text-xs text-white/60">Security</div>
                    <div className="mt-1 text-sm font-semibold text-white/80">
                      In-memory processing
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <BillUploader onResult={processBill} onLoading={setLoading} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      title: "No login",
                      desc: "No email, no account, no tracking profile.",
                      icon: "🛡️",
                    },
                    {
                      title: "No storage",
                      desc: "Your file is processed transiently then discarded.",
                      icon: "🧼",
                    },
                    {
                      title: "Trust signals",
                      desc: "Confidence, sources, and disclaimers shown clearly.",
                      icon: "✅",
                    },
                  ].map((x, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="text-2xl">{x.icon}</div>
                      <div className="mt-2 font-semibold">{x.title}</div>
                      <div className="mt-1 text-sm text-white/65">{x.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.02] px-6 py-4 text-xs text-white/55">
                Educational use only. Not medical, legal, or billing advice. Always
                verify totals before paying.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
              >
                <span className="text-lg">←</span>
                Analyze Another Bill
              </button>
            </div>

            <ExplanationCard result={result} />

            {result?.isPaid && result.pages?.[0]?.structured && (
              <PaidFeatures features={result.pages[0].structured} />
            )}
          </>
        )}
      </main>

      <div className="relative">
        <Testimonials />
        <FAQ />

        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
              Your Privacy Is Guaranteed
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "No Storage", desc: "Deleted instantly" },
              { icon: "🛡️", title: "No Account", desc: "No sign-up needed" },
              { icon: "⚡", title: "Secure", desc: "Private processing" },
            ].map((i, k) => (
              <div
                key={k}
                className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
              >
                <div className="text-5xl mb-3">{i.icon}</div>
                <h3 className="text-xl font-bold mb-2">{i.title}</h3>
                <p className="text-white/65 text-sm">{i.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-white/[0.02] py-10 mt-10 text-center text-white/55 text-sm">
          © 2025 ExplainMyBill • Educational tool
        </footer>
      </div>

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
