import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';

const stripePromise = loadStripe('pk_live_your_publishable_key'); // Use live key when ready

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    setResult(data);
    if (!data.isPaid) setShowUpgrade(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">ExplainMyBill</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Understand your medical bills in plain English — instantly.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 max-w-3xl mx-auto">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              🔒 Your privacy is our priority. We process your bill securely and delete it immediately. 
              No data is stored. We are not HIPAA-certified because we do not retain any health information.
            </p>
          </div>
        </header>

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

      <footer className="text-center py-8 text-gray-500 text-sm">
        © 2025 ExplainMyBill • Educational tool only • Not medical or legal advice
      </footer>
    </div>
  );
}

export default App;
