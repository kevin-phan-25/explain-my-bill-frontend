import React, { useState, useRef } from 'react';
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

  const mainContentRef = useRef(null);

  const handleResult = (data) => {
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('onrender.com');

    // Auto-unlock for dev
    if (isDev) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else if (!data.isPaid) {
      setShowUpgrade(true);
    }

    setResult(data);

    // Scroll to top of explanation card automatically
    setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const resetToUpload = () => {
    setResult(null);
    setShowUpgrade(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 7 Realistic Sample Bills
  const sampleBills = [
    { name: "Routine Check-Up (Normal)", image: "https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg", type: 'routine' },
    { name: "Emergency Room (High Charge)", image: "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg", type: 'er' },
    { name: "Denied Lab Tests", image: "https://publicinterestnetwork.org/wp-content/uploads/2025/09/EOB-with-one-charge-denied-388.54.jpg", type: 'denied' },
    { name: "Surprise Ambulance Bill", image: "https://armandalegshow.com/wp-content/uploads/2023/07/S10_EP01_No-Surprises-Update.png", type: 'ambulance' },
    { name: "Out-of-Network Specialist", image: "https://aarp.widen.net/content/4acvqv0fvj/web/medical-bill-errors.gif?animate=true&u=1javjt", type: 'out_network' },
    { name: "Dental Cleaning + X-Ray", image: "https://cdn.prod.website-files.com/609d5d3c4d120e9c52e52b07/66a3b84f583a65df61c0cd0c_Open%20Graph%20Template%20Dental-2.png", type: 'dental' },
    { name: "Eye Exam & Glasses (Vision)", image: "https://www.nvisioncenters.com/wp-content/uploads/eye-prescription-glasses.jpg", type: 'vision' }
  ];

  const sampleResults = {
    routine: {
      tldr: "Quick TL;DR: Routine check-up, normal charges, no issues.",
      features: {
        cptExplanations: ["99213 - Office visit, 15 minutes", "80050 - General health panel lab tests"],
        redFlags: [],
        estimatedSavings: { potentialSavings: "$50–$150", reason: "Routine lab and visit charges often overbilled" },
        appealLetter: "Dear Provider,\nI reviewed my routine check-up charges. Please confirm these are accurate.",
        customAdvice: "No major issues. Keep records for future reference."
      }
    },
    er: {
      tldr: "Quick TL;DR: ER visit, high charges, possible overbilling.",
      features: {
        cptExplanations: ["99285 - Emergency visit, high complexity", "71020 - Chest X-ray"],
        redFlags: ["ER charges unusually high compared to average"],
        estimatedSavings: { potentialSavings: "$500–$1200", reason: "ER overcharges are common" },
        appealLetter: "Dear Provider,\nPlease review the emergency visit charges, as they seem high.",
        customAdvice: "Check if insurance covers ER visit fully, consider appeal if not."
      }
    },
    denied: {
      tldr: "Quick TL;DR: Lab tests denied by insurance.",
      features: {
        cptExplanations: ["80053 - Comprehensive metabolic panel", "85025 - Complete blood count"],
        redFlags: ["Insurance denied these lab tests"],
        estimatedSavings: { potentialSavings: "$200–$400", reason: "Denied labs can be appealed" },
        appealLetter: "Dear Insurance,\nPlease reconsider denial for lab tests 80053 and 85025.",
        customAdvice: "Submit appeal with provider notes."
      }
    },
    ambulance: {
      tldr: "Quick TL;DR: Surprise ambulance charge, potentially out-of-network.",
      features: {
        cptExplanations: ["A0427 - Ambulance service, advanced life support"],
        redFlags: ["Ambulance billed at out-of-network rate"],
        estimatedSavings: { potentialSavings: "$300–$700", reason: "Ambulance charges often overestimated" },
        appealLetter: "Dear Provider,\nPlease clarify ambulance charges and network coverage.",
        customAdvice: "Check insurance network rules, negotiate if needed."
      }
    },
    out_network: {
      tldr: "Quick TL;DR: Out-of-network specialist visit, high balance.",
      features: {
        cptExplanations: ["99214 - Specialist visit", "CPT 93000 - ECG"],
        redFlags: ["Out-of-network billing may be higher than allowed"],
        estimatedSavings: { potentialSavings: "$400–$900", reason: "Negotiate out-of-network charges" },
        appealLetter: "Dear Insurance,\nRequesting coverage adjustment for out-of-network charges.",
        customAdvice: "Ask provider for in-network options or discounts."
      }
    },
    dental: {
      tldr: "Quick TL;DR: Dental cleaning and X-Ray, typical charges.",
      features: {
        cptExplanations: ["D1110 - Adult prophylaxis", "D0210 - Intraoral X-ray"],
        redFlags: [],
        estimatedSavings: { potentialSavings: "$50–$100", reason: "Dental offices sometimes overcharge labs/X-rays" },
        appealLetter: "Dear Provider,\nPlease review the dental charges.",
        customAdvice: "Confirm insurance coverage for dental."
      }
    },
    vision: {
      tldr: "Quick TL;DR: Eye exam and glasses, standard charges.",
      features: {
        cptExplanations: ["92014 - Comprehensive eye exam", "92340 - Glasses lenses"],
        redFlags: [],
        estimatedSavings: { potentialSavings: "$50–$200", reason: "Vision costs vary widely" },
        appealLetter: "Dear Provider,\nReview vision exam and lenses charges.",
        customAdvice: "Check coverage and compare prices online."
      }
    }
  };

  const loadSampleFromImage = (type, e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      handleResult({ ...sampleResults[type], isPaid: true });
      setLoading(false);
    }, 800);
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

      <main id="main-content" ref={mainContentRef} className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="glass-card p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-4">Upload Your Medical Bill</h2>
          <p className="text-base text-center text-gray-700 mb-6">
            Get your free TL;DR summary immediately — secure and private. Upgrade to see detailed explanations, red flags, and potential savings.
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
            rel="noopener"
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
