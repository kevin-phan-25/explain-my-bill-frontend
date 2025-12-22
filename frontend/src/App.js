import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_live_YourPublishableKeyHere'); // Replace with your live key when ready

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    // Developer bypass: Always show full paid features during development/testing
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('onrender.com');

    if (isDev) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else if (!data.isPaid) {
      setShowUpgrade(true);
    }

    setResult(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Skip to main for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-6 py-3 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-2xl font-light max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly, securely, and privately.
          </p>
        </div>
      </header>

      {/* Privacy Badge */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="privacy-badge text-center max-w-4xl mx-auto shadow-2xl">
          <span className="text-4xl mr-4" aria-hidden="true">🔒</span>
          <strong className="text-xl">Your privacy is guaranteed.</strong> We process your bill securely and delete it immediately. 
          No data is stored. We are not HIPAA-certified because we retain zero health information.
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-6 py-16 max-w-5xl">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
        )}

        {loading && <Loader />}

        {showUpgrade && (
          <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
        )}
      </main>

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl mb-4">© 2025 ExplainMyBill</p>
          <p className="text-sm opacity-80">
            Educational tool only • Not medical or legal advice • For informational purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
