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

  // Sample bill images (kept)
  const sampleBills = [
    {
      name: "Routine Check-Up (Normal)",
      image: "https://preview.redd.it/price-of-a-5-minute-ambulance-ride-to-the-hospital-v0-oxv3y6pn755e1.jpeg?width=640&crop=smart&auto=webp&s=8b20faddcc24a66b12e2972dae849e4ac4400bb4",
      type: 'routine'
    },
    {
      name: "Emergency Room (High Charge)",
      image: "https://preview.redd.it/price-of-a-5-minute-ambulance-ride-to-the-hospital-v0-oxv3y6pn755e1.jpeg?width=640&crop=smart&auto=webp&s=8b20faddcc24a66b12e2972dae849e4ac4400bb4",
      type: 'er'
    },
    {
      name: "Denied Lab Tests",
      image: "https://publicinterestnetwork.org/wp-content/uploads/2025/09/EOB-with-one-charge-denied-388.54.jpg",
      type: 'denied'
    },
    {
      name: "Surprise Ambulance Bill",
      image: "https://i.redd.it/oxv3y6pn755e1.jpeg",
      type: 'ambulance'
    },
    {
      name: "Out-of-Network Specialist",
      image: "https://bellmedex.com/wp-content/uploads/2023/08/out-of-network-medical-billing.jpg",
      type: 'out_network'
    },
    {
      name: "Dental Cleaning + X-Ray",
      image: "https://cdn.prod.website-files.com/609d5d3c4d120e9c52e52b07/66a3b84f583a65df61c0cd0c_Open%20Graph%20Template%20Dental-2.png",
      type: 'dental'
    },
    {
      name: "Eye Exam & Glasses (Vision)",
      image: "https://www.nvisioncenters.com/wp-content/uploads/eye-prescription-glasses.jpg",
      type: 'vision'
    }
  ];

  const loadSampleFromImage = (type) => {
    setLoading(true);
    setTimeout(() => {
      let sampleData = {};

      if (type === 'routine') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Standard check-up.\n\nCPT 99214: Detailed office visit — $195 charged.\nInsurance paid $156.\nYou owe $39 — normal." }],
          fullExplanation: "Normal check-up. You owe $39.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: ["99214: Detailed exam for established patient"],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Blue Cross", coverageNote: "Covers preventive care" },
            appealLetter: "No appeal needed.",
            customAdvice: "Pay the $39 balance.",
          }
        };
      } else if (type === 'er') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Emergency room visit.\n\nCPT 99285: High complexity ER — $4,200 charged.\nInsurance paid $1,800.\nYou owe $2,400 — very high.\nRED FLAG: Likely overcharged." }],
          fullExplanation: "High ER bill — likely overcharged.",
          paidFeatures: {
            redFlags: ["Charge 2x national average"],
            cptExplanations: ["99285: Most expensive ER code"],
            estimatedSavings: { potentialSavings: "$1,000+" },
            insuranceLookup: { insurer: "UnitedHealthcare", coverageNote: "Often negotiates ER" },
            appealLetter: "Dear Insurance,\nThe $4,200 ER charge is excessive...",
            customAdvice: "Request itemized bill. Use fairhealthconsumer.org to compare.",
          }
        };
      } else if (type === 'denied') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Lab tests denied.\n\nCPT 80053 & 85025 — $265 charged.\nInsurance denied as 'not medically necessary'.\nYou owe full amount.\nRED FLAG: Appeal often wins." }],
          fullExplanation: "Labs denied — appeal recommended.",
          paidFeatures: {
            redFlags: ["Full denial"],
            cptExplanations: ["80053: Organ function panel", "85025: Blood count"],
            estimatedSavings: { potentialSavings: "$265" },
            insuranceLookup: { insurer: "Aetna", coverageNote: "Appeals succeed ~70%" },
            appealLetter: "Dear Aetna,\nThese labs were medically necessary...",
            customAdvice: "Get doctor's letter. Appeal within 180 days.",
          }
        };
      } else if (type === 'ambulance') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Ambulance transport.\n\n$1,800 charged.\nInsurance paid $400.\nYou owe $1,400.\nRED FLAG: Common surprise bill." }],
          fullExplanation: "Surprise ambulance bill.",
          paidFeatures: {
            redFlags: ["Possible surprise billing"],
            cptExplanations: ["A0429: Basic ambulance", "A0425: Mileage"],
            estimatedSavings: { potentialSavings: "$800+" },
            insuranceLookup: { insurer: "Cigna", coverageNote: "Check state protections" },
            appealLetter: "Dear Cigna,\nThis was emergency transport...",
            customAdvice: "Check 'No Surprises Act' protection.",
          }
        };
      } else if (type === 'out_network') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Specialist visit.\n\nCPT 99204: New patient — $650 charged.\nOut-of-network.\nInsurance paid $120.\nYou owe $530.\nRED FLAG: High out-of-network rate." }],
          fullExplanation: "Out-of-network specialist.",
          paidFeatures: {
            redFlags: ["Out-of-network charge"],
            cptExplanations: ["99204: Detailed new patient visit"],
            estimatedSavings: { potentialSavings: "$300+" },
            insuranceLookup: { insurer: "Anthem", coverageNote: "May adjust rate" },
            appealLetter: "Dear Anthem,\nProvider was out-of-network without notice...",
            customAdvice: "Request 'gap exception'.",
          }
        };
      } else if (type === 'dental') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Dental cleaning.\n\nD1110: Cleaning — $120\nD0210: X-rays — $85\nD0150: Exam — $65\nTotal $270.\nInsurance paid $180.\nYou owe $90 — standard." }],
          fullExplanation: "Normal dental visit. You owe $90.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: ["D1110: Adult cleaning", "D0210: Full X-rays", "D0150: Exam"],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Delta Dental", coverageNote: "Covers cleanings 100%" },
            appealLetter: "No appeal needed.",
            customAdvice: "Check remaining benefits.",
          }
        };
      } else if (type === 'vision') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Eye exam + glasses.\n\n92015: Refraction — $85\nS0620: Routine exam — $120\nFrames/lenses: $280\nTotal $485.\nVision plan paid $150.\nYou owe $335 — typical." }],
          fullExplanation: "Routine vision care. You owe $335.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: ["92015: Vision test", "S0620: Routine eye exam"],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "VSP", coverageNote: "Covers exam + allowance for glasses" },
            appealLetter: "No appeal needed.",
            customAdvice: "Shop for cheaper frames online.",
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
          <h1 className="text-5xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-2xl font-light max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly and securely.
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

      {/* Upload Area */}
      <main id="main-content" className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="glass-card p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-4">Upload Your Medical Bill</h2>
          <p className="text-base text-center text-gray-700 mb-6">
            Get a clear explanation in seconds — secure and private.
          </p>

          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-8">
              <button
                onClick={resetToUpload}
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-2xl transition transform hover:scale-105"
              >
                ← Analyze Another Bill
              </button>
            </div>

            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}

        {loading && <Loader />}
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
      </main>

      {/* Sample Bills */}
      <div className="container mx-auto px-6 mt-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
          Or Try a Sample Bill Instantly
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sampleBills.map((bill, i) => (
            <div key={i} className="text-center">
              <button
                onClick={(e) => loadSampleFromImage(bill.type, e)}
                className="block w-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label={`Analyze sample ${bill.name}`}
              >
                <img 
                  src={bill.image} 
                  alt={`Sample ${bill.name} medical bill`}
                  className="w-full rounded-2xl shadow-xl border-4 border-blue-200 hover:border-blue-600 transition max-h-72 object-contain bg-white"
                />
                <p className="mt-6 text-2xl font-bold text-blue-900">
                  {bill.name}
                </p>
                <p className="text-lg text-gray-600 mt-2">Click to get explanation</p>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FairHealth Link */}
      <div className="container mx-auto px-6 mt-16 max-w-4xl">
        <div className="bg-blue-50 border-l-8 border-blue-600 rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">What is FairHealth?</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            FairHealthConsumer.org is a free nonprofit tool that shows <strong>average costs</strong> for medical procedures in your area.
            Use it to check if your bill is fair. We recommend it in every explanation.
          </p>
          <a 
            href="https://www.fairhealthconsumer.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg"
          >
            Visit FairHealthConsumer.org →
          </a>
        </div>
      </div>

      <Testimonials />

      <footer className="bg-blue-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xl mb-6">30-Day Money-Back Guarantee</p>
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
