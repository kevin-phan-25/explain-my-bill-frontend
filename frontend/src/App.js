import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // Test mode
// const stripePromise = loadStripe('pk_live_51YourLiveKeyHere'); // Live mode

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

  const loadSampleBill = (type) => {
    setLoading(true);
    setTimeout(() => {
      let sampleData = {};

      if (type === 'office') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This is a routine office visit bill.\n\n" +
            "You saw your primary doctor for a check-up.\n\n" +
            "The charge is $180 for a standard visit (CPT code 99213).\n\n" +
            "Insurance paid $144 (80%).\n\n" +
            "You owe $36 — this is normal and fair.\n\n" +
            "No red flags." }],
          fullExplanation: "You owe $36 for a normal check-up.",
          paidFeatures: {
            downloadablePdf: true,
            redFlags: [],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Blue Cross", coverageNote: "Covers 80% of office visits" },
            appealLetter: "No appeal needed — bill is correct.",
            customAdvice: "Pay the $36 or set up a payment plan.",
          }
        };
      } else if (type === 'er') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This is an emergency room bill.\n\n" +
            "You were charged $2,800 for a Level 4 ER visit.\n\n" +
            "Insurance paid $1,200.\n\n" +
            "You owe $1,600 — this is VERY HIGH.\n\n" +
            "RED FLAG: ER charges are often inflated.\n\n" +
            "Average cost for this visit is $1,200–$1,800.\n\n" +
            "You may be overcharged." }],
          fullExplanation: "You owe $1,600 — likely overcharged.",
          paidFeatures: {
            downloadablePdf: true,
            redFlags: ["Possible overcharge of $800–$1,000"],
            estimatedSavings: { potentialSavings: "$800+" },
            insuranceLookup: { insurer: "UnitedHealthcare", coverageNote: "Check if facility was in-network" },
            appealLetter: "Dear Insurance,\n\nI am appealing the $2,800 ER charge...\n\nThis is above fair pricing.",
            customAdvice: "Request itemized bill. Compare to fairhealthconsumer.org. File appeal.",
          }
        };
      } else if (type === 'denied') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This bill shows a denied claim.\n\n" +
            "You were charged $450 for lab tests.\n\n" +
            "Insurance denied it saying 'not medically necessary'.\n\n" +
            "You owe the full $450.\n\n" +
            "RED FLAG: Denials can often be appealed successfully.\n\n" +
            "70% of appeals win." }],
          fullExplanation: "Insurance denied $450 in lab tests.",
          paidFeatures: {
            downloadablePdf: true,
            redFlags: ["Claim denied — appeal recommended"],
            estimatedSavings: { potentialSavings: "$450" },
            insuranceLookup: { insurer: "Aetna", coverageNote: "Appeals have high success rate" },
            appealLetter: "Dear Aetna,\n\nI appeal the denial of lab tests on [date]...\n\nThese were ordered by my doctor and medically necessary.",
            customAdvice: "Get a letter from your doctor explaining necessity. Submit appeal within 180 days.",
          }
        };
      }

      handleResult(sampleData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-6 py-3 rounded-lg z-50">
        Skip to main content
      </a>

      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-2xl font-light max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly, securely, and privately.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="privacy-badge text-center max-w-4xl mx-auto shadow-2xl">
          <span className="text-4xl mr-4" aria-hidden="true">🔒</span>
          <strong className="text-xl">Your privacy is guaranteed.</strong> We process your bill securely and delete it immediately. 
          No data is stored. We are not HIPAA-certified because we retain zero health information.
        </div>
      </div>

      {/* Sample Bills */}
      <div className="container mx-auto px-6 mt-12 text-center">
        <p className="text-xl text-gray-700 mb-8">Try a sample bill — no upload needed</p>
        <div className="flex flex-wrap justify-center gap-6">
          <button onClick={() => loadSampleBill('office')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg">
            Simple Office Visit
          </button>
          <button onClick={() => loadSampleBill('er')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg">
            ER Overcharge Example
          </button>
          <button onClick={() => loadSampleBill('denied')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg">
            Denied Claim Example
          </button>
        </div>
      </div>

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

      <Testimonials />

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
