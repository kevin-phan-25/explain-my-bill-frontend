import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';
import { jsPDF } from "jspdf";

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

  // Sample bill images (mock data)
  const sampleBills = [
    {
      name: "Routine Check-Up (Normal)",
      type: 'routine'
    },
    {
      name: "Emergency Room (High Charge)",
      type: 'er'
    },
    {
      name: "Denied Lab Tests",
      type: 'denied'
    },
    {
      name: "Surprise Ambulance Bill",
      type: 'ambulance'
    },
    {
      name: "Out-of-Network Specialist",
      type: 'out_network'
    },
    {
      name: "Dental Cleaning + X-Ray",
      type: 'dental'
    },
    {
      name: "Eye Exam & Glasses (Vision)",
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
          pages: [{ page: 1, explanation: "This is a standard check-up bill. The CPT code 99214 indicates a detailed office visit for an established patient. The provider charged $195, your insurance allowed $156 (after adjustments), and paid $117. You owe $39, which is normal for this type of visit. No red flags here." }],
          fullExplanation: "Normal check-up. You owe $39.",
          paidFeatures: {}
        };
      } else if (type === 'er') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This is an emergency room visit bill. The CPT code 99285 indicates a high complexity ER visit. The provider charged $4,200, your insurance allowed $2,400, and paid $1,800. You owe $600. RED FLAG: ER charges are often inflated; check if this is above average in your area." }],
          fullExplanation: "High ER bill — likely overcharged.",
          paidFeatures: {}
        };
      } else if (type === 'denied') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "This is a bill for lab tests denied by insurance. The CPT codes 80053 and 85025 indicate a metabolic panel and blood count. You owe the full $265. RED FLAG: Denials are often overturnable with a doctor's note." }],
          fullExplanation: "Labs denied — appeal recommended.",
          paidFeatures: {}
        };
      } else if (type === 'ambulance') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Ambulance transport bill. Base $1,800, insurance paid $400. You owe $1,400. RED FLAG: Surprise charges may be reduced under the No Surprises Act." }],
          fullExplanation: "Surprise ambulance bill.",
          paidFeatures: {}
        };
      } else if (type === 'out_network') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Specialist visit bill. Provider charged $650, insurance allowed $150, paid $120. You owe $530. RED FLAG: Out-of-network charges often higher; check if you can appeal." }],
          fullExplanation: "Out-of-network specialist.",
          paidFeatures: {}
        };
      } else if (type === 'dental') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Dental cleaning & exam. Codes D1110 $120, D0210 $85, D0150 $65. Insurance paid $180, you owe $90." }],
          fullExplanation: "Normal dental visit. You owe $90.",
          paidFeatures: {}
        };
      } else if (type === 'vision') {
        sampleData = {
          isPaid: true,
          pages: [{ page: 1, explanation: "Vision exam & glasses. Codes 92015 $85, S0620 $120, frames/lenses $280. Plan paid $150. You owe $335." }],
          fullExplanation: "Routine vision care. You owe $335.",
          paidFeatures: {}
        };
      }

      handleResult(sampleData);
      setLoading(false);
    }, 1000);
  };

  // Download explanation as PDF
  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 10;
    result.pages.forEach(p => {
      doc.setFontSize(16);
      doc.text(`Page ${p.page}`, 10, y);
      y += 10;
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(p.explanation, 180);
      doc.text(lines, 10, y);
      y += lines.length * 8 + 10;
    });
    doc.save('medical-bill-explanation.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-2xl font-light max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly and securely.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <BillUploader onResult={handleResult} onLoading={setLoading} />

        {loading && <Loader />}

        {result && (
          <>
            <div className="text-center my-8">
              <button
                onClick={resetToUpload}
                className="bg-gray-800 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-xl hover:scale-105 transition transform"
              >
                ← Analyze Another Bill
              </button>
              <button
                onClick={downloadPDF}
                className="ml-4 bg-green-600 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-xl hover:scale-105 transition transform"
              >
                📥 Download Explanation
              </button>
            </div>

            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}

        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
      </main>

      {/* Sample Bills */}
      <div className="container mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
          Or Try a Sample Bill Instantly
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sampleBills.map((bill, i) => (
            <div key={i} className="text-center">
              <button
                onClick={() => loadSampleFromImage(bill.type)}
                className="block w-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <p className="text-xl font-bold text-blue-900">{bill.name}</p>
                  <p className="text-gray-600 mt-2">Click to get explanation</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Testimonials />
    </div>
  );
}

export default App;
