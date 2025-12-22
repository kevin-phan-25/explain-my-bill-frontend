import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // Test mode

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
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

  const resetToUpload = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  // Sample Bill Images (click to analyze)
  const sampleBills = [
    {
      name: "Simple Office Visit",
      image: "https://i.imgur.com/8yR0k2L.png", // Realistic office bill
      type: 'office'
    },
    {
      name: "ER Visit (Possible Overcharge)",
      image: "https://i.imgur.com/3jK9pLm.png", // ER bill with high charge
      type: 'er'
    },
    {
      name: "Denied Insurance Claim",
      image: "https://i.imgur.com/X7vN4qP.png", // Denied lab test
      type: 'denied'
    }
  ];

  const loadSampleFromImage = (type) => {
    setLoading(true);
    setTimeout(() => {
      // Same sample data as before
      const sampleData = type === 'office' ? { /* office data */ } : type === 'er' ? { /* er data */ } : { /* denied data */ };
      // Use the same sample data from previous message
      // (omitted for brevity — copy from previous response)
      handleResult(sampleData);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-6 py-3 rounded-lg z-50">
        Skip to main content
      </a>

      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-20 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-7xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-3xl font-light max-w-4xl mx-auto">
            Understand your medical bills in plain English — instantly and securely.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 -mt-10 relative z-10">
        <div className="privacy-badge text-center max-w-5xl mx-auto shadow-2xl">
          <span className="text-5xl mr-4" aria-hidden="true">🔒</span>
          <strong className="text-2xl">Your privacy is guaranteed.</strong> We process your bill securely and delete it immediately. 
          No data is stored. We are not HIPAA-certified because we retain zero health information.
        </div>
      </div>

      {/* Sample Bill Images – BIG & PROMINENT */}
      <div className="container mx-auto px-6 mt-20">
        <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
          Try a Sample Bill Instantly
        </h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {sampleBills.map((bill, i) => (
            <div key={i} className="text-center">
              <button
                onClick={() => loadSampleFromImage(bill.type)}
                className="block w-full transform hover:scale-105 transition duration-300"
                aria-label={`Analyze sample ${bill.name}`}
              >
                <img 
                  src={bill.image} 
                  alt={`Sample ${bill.name} medical bill`}
                  className="w-full rounded-2xl shadow-2xl border-4 border-blue-200 hover:border-blue-500 transition"
                />
                <p className="mt-6 text-2xl font-bold text-blue-900">
                  {bill.name}
                </p>
                <p className="text-lg text-gray-600">Click to explain</p>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FairHealth Info */}
      <div className="container mx-auto px-6 mt-20 max-w-4xl">
        <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-10 shadow-xl">
          <h3 className="text-3xl font-bold text-blue-900 mb-4">What is FairHealth?</h3>
          <p className="text-xl text-gray-700 leading-relaxed">
            FairHealthConsumer.org is a free nonprofit tool that shows <strong>average costs</strong> for medical procedures in your area.
            Use it to check if your bill is fair. We recommend it in every explanation.
          </p>
          <a 
            href="https://www.fairhealthconsumer.org" 
            target="_blank" 
            rel="noopener"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg"
          >
            Visit FairHealthConsumer.org →
          </a>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-6 py-20 max-w-5xl">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-12">
              <button
                onClick={resetToUpload}
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-5 px-12 rounded-2xl text-2xl shadow-2xl transition transform hover:scale-105"
              >
                ← Analyze Another Bill
              </button>
            </div>

            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}

        {loading && <Loader />}

        {showUpgrade && (
          <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
        )}
      </main>

      <Testimonials />

      <footer className="bg-blue-900 text-white py-16 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-2xl mb-6">30-Day Money-Back Guarantee</p>
          <p className="text-lg mb-4">Not satisfied? Email us within 30 days for a full refund. No questions asked.</p>
          <p className="text-sm opacity-80">
            © 2025 ExplainMyBill • Educational tool • Not medical/legal advice
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
