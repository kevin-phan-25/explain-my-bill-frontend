import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_live_YourKey'); // Replace when live

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    setResult(data);
    if (!data.isPaid) setShowUpgrade(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
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
          <span className="text-4xl mr-4">🔒</span>
          <strong className="text-xl">Your privacy is guaranteed.</strong> We process your bill securely and delete it immediately. 
          No data is stored. We are not HIPAA-certified because we retain zero health information.
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
        )}

        {loading && <Loader />}

        {showUpgrade && (
          <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
        )}
      </div>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
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
