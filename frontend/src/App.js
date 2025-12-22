import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';

const stripePromise = loadStripe('pk_live_YourPublishableKey'); // Replace when live

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    setResult(data);
    if (!data.isPaid) setShowUpgrade(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">ExplainMyBill</h1>
          <p className="text-2xl text-gray-700 font-medium">
            Understand your medical bills in plain English — instantly and securely.
          </p>
        </div>
      </header>

      {/* Privacy Badge */}
      <div className="container mx-auto px-6 mt-8">
        <div className="privacy-badge text-center max-w-4xl mx-auto">
          <span className="text-3xl mr-3">🔒</span>
          <strong>Your privacy is our #1 priority.</strong> We process your bill securely and delete it immediately. 
          No data is stored. We are not HIPAA-certified because we retain zero health information.
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-5xl">
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

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg mb-4">© 2025 ExplainMyBill — An educational tool to help you understand medical bills</p>
          <p className="text-sm opacity-80">Not medical or legal advice • For informational purposes only</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
