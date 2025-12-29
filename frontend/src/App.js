import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere');

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('onrender.com');

  const handleResult = (data) => {
    if (isDev || data?.isPaid) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else {
      setShowUpgrade(true);
    }
    setResult(data);
  };

  const reset = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-16 shadow-2xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            ExplainMyBill
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl text-white/90 font-light mb-8"
          >
            Understand your medical bills in plain English — instantly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
          >
            <span className="text-2xl">🔒</span>
            <span className="text-white font-medium">Your bill is deleted immediately after analysis — never stored</span>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-10">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}
      </main>

      {/* Privacy & Trust Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Privacy Is Our Priority
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We process your bill instantly in memory and delete it immediately. No storage. No sharing. No logs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: "🔒",
              title: "Zero Data Retention",
              desc: "Your bill is processed in memory and permanently deleted right after analysis.",
            },
            {
              icon: "🛡️",
              title: "No Accounts Needed",
              desc: "No sign-up, no email, no personal info required. Completely anonymous.",
            },
            {
              icon: "⚡",
              title: "Instant & Secure",
              desc: "All processing happens in a secure, isolated environment. Nothing is saved.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500"
            >
              <div className="text-6xl mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black/50 to-transparent py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center text-white/70">
          <p className="text-lg">© 2025 ExplainMyBill • An educational tool made with care for patients</p>
          <p className="text-sm mt-4">Not medical or legal advice • Not HIPAA-certified • Privacy-first design</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
    </div>
  );
}

export default App;
