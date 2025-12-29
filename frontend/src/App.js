// src/App.js – FINAL PRODUCTION VERSION (Dec 29, 2025)
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import PaidFeatures from './components/PaidFeatures';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-12 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">ExplainMyBill</h1>
          <p className="text-2xl text-white/90 mb-8">Understand your medical bills — instantly and privately</p>
          <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur px-8 py-4 rounded-full border border-white/30">
            <span className="text-3xl">🔒</span>
            <span className="text-white font-medium text-lg">Your bill is deleted immediately — never stored</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-10">
              <button onClick={reset} className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg">
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

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Privacy Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Privacy Comes First
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We process your bill in memory only — nothing is saved, logged, or shared.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: "🔒", title: "No Storage", desc: "Deleted instantly after analysis" },
            { icon: "🛡️", title: "No Account", desc: "No sign-up or personal info needed" },
            { icon: "⚡", title: "Secure & Fast", desc: "All processing is private and instant" },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/30 text-center shadow-2xl">
              <div className="text-7xl mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black/30 to-transparent py-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg">© 2025 ExplainMyBill • Educational tool • Made for patients</p>
          <p className="text-sm mt-4">Not medical or legal advice • Privacy-first design</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
    </div>
  );
}

export default App;
