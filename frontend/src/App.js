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

  // 7 Realistic Sample Bills (including Vision Care)
  const sampleBills = [
    { name: "Routine Doctor Visit", image: "https://i.imgur.com/8yR0k2L.png", type: 'routine' },
    { name: "Emergency Room (High Charge)", image: "https://i.imgur.com/3jK9pLm.png", type: 'er' },
    { name: "Denied Lab Tests", image: "https://i.imgur.com/X7vN4qP.png", type: 'denied' },
    { name: "Surprise Ambulance", image: "https://i.imgur.com/AmbulanceBillExample.jpg", type: 'ambulance' },
    { name: "Out-of-Network Specialist", image: "https://i.imgur.com/OutOfNetworkExample.jpg", type: 'out_network' },
    { name: "Dental Cleaning", image: "https://i.imgur.com/DentalBillExample.jpg", type: 'dental' },
    { name: "Eye Exam & Glasses", image: "https://i.imgur.com/VisionCareBillExample.jpg", type: 'vision' }
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
            explanation: "This is a standard check-up.\n\n" +
              "CPT 99214: Office visit, moderate complexity — $195 charged.\n" +
              "Insurance paid 80% ($156).\n\n" +
              "You owe $39 — normal and expected.\n\n" +
              "No issues found."
          }],
          fullExplanation: "Normal check-up. You owe $39.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: [
              "99214: Detailed office visit for established patient (common for annual check-up)"
            ],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Blue Cross", coverageNote: "Covers preventive care" },
            appealLetter: "No appeal needed.",
            customAdvice: "Pay the balance or set up payment plan.",
          }
        };
      } else if (type === 'er') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Emergency room visit.\n\n" +
              "CPT 99285: Highest level ER care — $4,200 charged.\n" +
              "Insurance paid $1,800.\n\n" +
              "You owe $2,400 — very high.\n\n" +
              "RED FLAG: ER facility fees often 5–10x inflated.\n" +
              "National average: $1,500–$2,500."
          }],
          fullExplanation: "High ER bill — likely overcharged.",
          paidFeatures: {
            redFlags: ["Facility fee inflated", "Charge above average"],
            cptExplanations: [
              "99285: Emergency department visit, high severity (most expensive ER code)"
            ],
            estimatedSavings: { potentialSavings: "$1,000–$1,800" },
            insuranceLookup: { insurer: "UnitedHealthcare", coverageNote: "Often negotiates ER bills" },
            appealLetter: "Dear Insurance,\n\nThe $4,200 ER charge is far above average...",
            customAdvice: "Request itemized bill. Use fairhealthconsumer.org to compare.",
          }
        };
      } else if (type === 'denied') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Lab tests denied.\n\n" +
              "CPT 80053: Comprehensive metabolic panel — $180\n" +
              "CPT 85025: Complete blood count — $85\n\n" +
              "Insurance denied both as 'not medically necessary'.\n\n" +
              "You owe $265.\n\n" +
              "RED FLAG: Denials often overturned with doctor letter."
          }],
          fullExplanation: "Labs denied — appeal possible.",
          paidFeatures: {
            redFlags: ["Full denial of routine labs"],
            cptExplanations: [
              "80053: Blood test for organ function (liver, kidney, etc.)",
              "85025: Complete blood count (checks anemia, infection)"
            ],
            estimatedSavings: { potentialSavings: "$265" },
            insuranceLookup: { insurer: "Aetna", coverageNote: "Appeals succeed ~70%" },
            appealLetter: "Dear Aetna,\n\nThese labs were ordered by my doctor for monitoring...",
            customAdvice: "Get doctor's letter of necessity. Appeal within 180 days.",
          }
        };
      } else if (type === 'ambulance') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Ambulance transport.\n\n" +
              "Base rate + mileage: $1,800\n" +
              "Insurance paid $400.\n\n" +
              "You owe $1,400.\n\n" +
              "RED FLAG: Ambulance bills often surprise charges.\n" +
              "Many states protect against balance billing."
          }],
          fullExplanation: "Surprise ambulance bill.",
          paidFeatures: {
            redFlags: ["Possible surprise billing"],
            cptExplanations: [
              "A0425: Ground ambulance mileage",
              "A0429: Basic life support ambulance"
            ],
            estimatedSavings: { potentialSavings: "$800–$1,200" },
            insuranceLookup: { insurer: "Cigna", coverageNote: "Check state laws" },
            appealLetter: "Dear Cigna,\n\nThis was emergency transport...",
            customAdvice: "Check for 'no surprise act' protection.",
          }
        };
      } else if (type === 'out_network') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Specialist visit.\n\n" +
              "CPT 99204: New patient, high complexity — $650\n" +
              "Provider out-of-network.\n\n" +
              "Insurance paid $120.\n" +
              "You owe $530.\n\n" +
              "RED FLAG: Out-of-network can be 3–5x higher."
          }],
          fullExplanation: "Out-of-network specialist — high balance.",
          paidFeatures: {
            redFlags: ["Out-of-network charge"],
            cptExplanations: [
              "99204: Detailed new patient visit (used for specialists)"
            ],
            estimatedSavings: { potentialSavings: "$300–$400" },
            insuranceLookup: { insurer: "Anthem", coverageNote: "May adjust rate" },
            appealLetter: "Dear Anthem,\n\nProvider was out-of-network without notice...",
            customAdvice: "Request 'gap exception' or in-network rate.",
          }
        };
      } else if (type === 'dental') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Dental cleaning and exam.\n\n" +
              "D1110: Adult cleaning — $120\n" +
              "D0210: Full mouth X-rays — $85\n" +
              "D0150: Comprehensive exam — $65\n\n" +
              "Total: $270\n" +
              "Insurance paid $180.\n" +
              "You owe $90 — standard."
          }],
          fullExplanation: "Normal dental visit. You owe $90.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: [
              "D1110: Prophylaxis (cleaning) for adults",
              "D0210: Complete X-ray series",
              "D0150: Full exam for new or returning patient"
            ],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "Delta Dental", coverageNote: "Covers cleanings 100% twice/year" },
            appealLetter: "No appeal needed.",
            customAdvice: "Check remaining annual maximum.",
          }
        };
      } else if (type === 'vision') {
        sampleData = {
          isPaid: true,
          pages: [{
            page: 1,
            explanation: "Eye exam and glasses.\n\n" +
              "CPT 92015: Refraction (vision test) — $85\n" +
              "S0620: Routine eye exam — $120\n" +
              "Frames + lenses: $280\n\n" +
              "Vision insurance paid $150.\n" +
              "You owe $335.\n\n" +
              "Note: Medical insurance usually doesn't cover routine vision.\n" +
              "No red flags — typical vision plan coverage."
          }],
          fullExplanation: "Routine eye exam + glasses. You owe $335.",
          paidFeatures: {
            redFlags: [],
            cptExplanations: [
              "92015: Determination of refractive state (how strong your prescription is)",
              "S0620: Routine ophthalmological exam"
            ],
            estimatedSavings: { potentialSavings: "$0" },
            insuranceLookup: { insurer: "VSP Vision", coverageNote: "Covers exam + $150 toward glasses" },
            appealLetter: "No appeal needed.",
            customAdvice: "Use remaining vision benefits. Shop for cheaper frames online.",
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

      {/* Sample Bill Images */}
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

      {/* FairHealth Link */}
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
