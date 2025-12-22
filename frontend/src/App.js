import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // Replace with live key when ready

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
      // Replace with your actual sample data from previous versions
      let sampleData = {};

      if (type === 'office') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This is a routine office visit bill.\n\nThe charge is $180 for a standard visit (CPT code 99213).\n\nInsurance paid $144 (80%).\n\nYou owe $36 — this is normal and fair.\n\nNo red flags." }],
          fullExplanation: "You owe $36 for a normal check-up.",
          paidFeatures: {
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
          pages: [{ page: 1, explanation: "This is an emergency room bill.\n\nYou were charged $2,800 for a Level 4 ER visit.\n\nInsurance paid $1,200.\n\nYou owe $1,600 — this is VERY HIGH.\n\nRED FLAG: ER charges are often inflated.\n\nAverage cost is $1,200–$1,800.\n\nYou may be overcharged." }],
          fullExplanation: "You owe $1,600 — likely overcharged.",
          paidFeatures: {
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
          pages: [{ page: 1, explanation: "This bill shows a denied claim.\n\nYou were charged $450 for lab tests.\n\nInsurance denied it saying 'not medically necessary'.\n\nYou owe the full $450.\n\nRED FLAG: Denials can often be appealed successfully.\n\n70% of appeals win." }],
          fullExplanation: "Insurance denied $450 in lab tests.",
          paidFeatures: {
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

      {/* FairHealth Info – Prominent Link */}
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
