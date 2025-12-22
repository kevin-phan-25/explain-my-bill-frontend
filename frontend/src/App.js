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

  // 6 Realistic Sample Bills
  const sampleBills = [
    {
      name: "Routine Check-Up (Normal)",
      image: "https://i.imgur.com/8yR0k2L.png",
      type: 'routine'
    },
    {
      name: "ER Visit – High Charge",
      image: "https://i.imgur.com/3jK9pLm.png",
      type: 'er_high'
    },
    {
      name: "Denied Lab Tests",
      image: "https://i.imgur.com/X7vN4qP.png",
      type: 'denied_lab'
    },
    {
      name: "Surprise Ambulance Bill",
      image: "https://i.imgur.com/AmbulanceBillExample.jpg", // placeholder realistic
      type: 'ambulance'
    },
    {
      name: "Out-of-Network Specialist",
      image: "https://i.imgur.com/OutOfNetworkExample.jpg",
      type: 'out_network'
    },
    {
      name: "Dental Cleaning + X-Ray",
      image: "https://i.imgur.com/DentalBillExample.jpg",
      type: 'dental'
    }
  ];

  const loadSampleFromImage = (type) => {
    setLoading(true);
    setTimeout(() => {
      let sampleData = {};

      if (type === 'routine') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This is a routine annual check-up with your primary doctor.\n\n" +
              "Services: Office visit (CPT 99214 - established patient, moderate complexity)\n" +
              "Charged: $195\n" +
              "Insurance allowed: $142 (in-network rate)\n" +
              "Insurance paid: $113.60 (80%)\n\n" +
              "You owe: $28.40 — this is normal and expected.\n\n" +
              "No red flags detected."
          }],
          fullExplanation: "Normal annual check-up. You owe $28.40.",
          paidFeatures: {
            redFlags: [],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Blue Cross Blue Shield", coverageNote: "Covers preventive visits at 100% if annual wellness" },
            appealLetter: "No appeal needed.",
            customAdvice: "This is a standard charge. Pay the balance or set up a payment plan.",
          }
        };
      } else if (type === 'er_high') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This is an emergency room visit bill.\n\n" +
              "Level 5 ER visit (highest complexity) charged at $4,200\n" +
              "Facility fee: $2,800\n" +
              "Physician fee: $1,400\n\n" +
              "Insurance paid: $1,800\n" +
              "You owe: $2,400\n\n" +
              "RED FLAG: ER facility fees are often inflated 5–10x fair price.\n" +
              "National average for Level 5 ER visit: $1,200–$2,000\n\n" +
              "You may be overcharged by $1,000+"
          }],
          fullExplanation: "High ER bill — likely overcharged.",
          paidFeatures: {
            redFlags: ["Facility fee appears inflated", "Total charge 2x national average"],
            estimatedSavings: { potentialSavings: "$1,000–$2,000" },
            insuranceLookup: { insurer: "UnitedHealthcare", coverageNote: "Often negotiates ER bills" },
            appealLetter: "Dear UnitedHealthcare,\n\nI am appealing the $4,200 ER facility charge from [date]...\n\nThis is significantly above fair market rates.",
            customAdvice: "Request itemized bill. Compare to fairhealthconsumer.org. Ask hospital for charity care or discount.",
          }
        };
      } else if (type === 'denied_lab') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This bill is for blood work and lab tests.\n\n" +
              "Total charged: $680\n" +
              "Insurance denied all charges citing 'not medically necessary'\n\n" +
              "You owe full amount: $680\n\n" +
              "RED FLAG: Lab denials are common but often overturned on appeal.\n" +
              "Success rate: ~70% when appealed with doctor letter."
          }],
          fullExplanation: "Lab tests denied — appeal recommended.",
          paidFeatures: {
            redFlags: ["Full denial of routine labs", "No medical necessity letter attached"],
            estimatedSavings: { potentialSavings: "$680" },
            insuranceLookup: { insurer: "Aetna", coverageNote: "Requires pre-authorization for some labs" },
            appealLetter: "Dear Aetna,\n\nI appeal the denial of lab tests ordered by Dr. Smith on [date]...\n\nThese were medically necessary for ongoing condition monitoring.",
            customAdvice: "Get a letter of medical necessity from your doctor. Submit appeal within 180 days.",
          }
        };
      } else if (type === 'ambulance') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This is an ambulance transport bill.\n\n" +
              "Base rate + mileage: $1,800\n" +
              "Insurance paid: $400\n" +
              "You owe: $1,400\n\n" +
              "RED FLAG: Ambulance bills are frequently surprise charges and often reduced on appeal.\n" +
              "Many states have balance billing protections."
          }],
          fullExplanation: "Surprise ambulance bill — common issue.",
          paidFeatures: {
            redFlags: ["Possible surprise billing", "High mileage charge"],
            estimatedSavings: { potentialSavings: "$800–$1,200" },
            insuranceLookup: { insurer: "Cigna", coverageNote: "Check for ground ambulance coverage" },
            appealLetter: "Dear Cigna,\n\nI am appealing the $1,800 ambulance charge...\n\nThis was emergency transport.",
            customAdvice: "Check if ambulance was in-network. Ask for 'no surprise billing' protection.",
          }
        };
      } else if (type === 'out_network') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This bill is from a specialist visit.\n\n" +
              "Charge: $650 for consultation\n" +
              "Specialist was out-of-network\n" +
              "Insurance paid: $120\n" +
              "You owe: $530\n\n" +
              "RED FLAG: Out-of-network charges can be 3–5x higher.\n" +
              "You may qualify for in-network rate adjustment."
          }],
          fullExplanation: "Out-of-network specialist — high balance.",
          paidFeatures: {
            redFlags: ["Out-of-network provider", "Balance billing possible"],
            estimatedSavings: { potentialSavings: "$300–$400" },
            insuranceLookup: { insurer: "Anthem", coverageNote: "May adjust to in-network rate on appeal" },
            appealLetter: "Dear Anthem,\n\nThe specialist was out-of-network without my knowledge...\n\nPlease adjust to in-network rate.",
            customAdvice: "Ask if provider accepts your insurance. Request 'gap exception'.",
          }
        };
      } else if (type === 'dental') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "This is a dental cleaning and exam bill.\n\n" +
              "Cleaning (D1110): $120\n" +
              "X-rays (D0210): $85\n" +
              "Exam (D0150): $65\n" +
              "Total: $270\n\n" +
              "Dental insurance paid: $180\n" +
              "You owe: $90\n\n" +
              "No red flags — standard dental charges."
          }],
          fullExplanation: "Normal dental cleaning — you owe $90.",
          paidFeatures: {
            redFlags: [],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Delta Dental", coverageNote: "Covers cleanings at 100% twice per year" },
            appealLetter: "No appeal needed.",
            customAdvice: "This is standard. Check if you have unused annual maximum.",
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {sampleBills.map((bill, i) => (
            <div key={i} className="text-center">
              <button
                onClick={() => loadSampleFromImage(bill.type)}
                className="block w-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label={`Analyze sample ${bill.name}`}
              >
                <img 
                  src={bill.image} 
                  alt={`Sample ${bill.name} medical bill`}
                  className="w-full rounded-3xl shadow-2xl border-8 border-blue-200 hover:border-blue-600 transition"
                />
                <p className="mt-8 text-3xl font-bold text-blue-900">
                  {bill.name}
                </p>
                <p className="text-xl text-gray-600 mt-2">Click to get explanation</p>
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
