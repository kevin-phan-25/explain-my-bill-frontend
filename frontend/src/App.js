import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere');

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('onrender.com');

  const handleResult = (data) => {
    if (isDev || data?.isPaid) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else {
      setShowUpgrade(true);
    }
    setResult(data);
  };

  const reset = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  // Only 2 sample bills – minimal and fast
  const samples = [
    {
      name: 'Routine Check-Up',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Routine preventive visit.',
            keyAmounts: { totalCharges: '$195', insurancePaid: '$117', patientResponsibility: '$39' },
            explanation: 'Standard check-up. Insurance covered most. $39 copay is normal.',
            nextSteps: ['Pay $39', 'No action needed'],
          },
        }],
      },
    },
    {
      name: 'Emergency Room Visit',
      image: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'High-cost ER visit with facility fees.',
            keyAmounts: { totalCharges: '$4,200', insurancePaid: '$1,800', patientResponsibility: '$600' },
            redFlags: ['Level 5 ER code', 'High facility fees'],
            explanation: 'ER bills are often overcoded and negotiable.',
            nextSteps: ['Request itemized bill', 'Negotiate', 'Check FairHealthConsumer.org'],
          },
        }],
      },
    },
  ];

  const loadSample = (data) => {
    setLoading(true);
    setTimeout(() => {
      handleResult(data);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">ExplainMyBill</h1>
          <p className="text-xl">Understand your medical bills in plain English — instantly.</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center my-8">
              <button onClick={reset} className="bg-gray-800 text-white px-8 py-3 rounded-xl hover:bg-gray-900 transition">
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}
      </main>

      {/* Sample Bills */}
      {!result && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Try a Sample Bill</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {samples.map((bill, i) => (
              <button
                key={i}
                onClick={() => loadSample(bill.data)}
                className="group rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition"
              >
                <img src={bill.image} alt={bill.name} className="w-full h-64 object-cover group-hover:scale-110 transition" />
                <div className="bg-white p-6 text-center">
                  <p className="font-bold text-xl">{bill.name}</p>
                  <p className="text-gray-500 text-sm mt-2">Click to see analysis</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Testimonials />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-6">Privacy & Trust</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold mb-2">🔒 No Data Stored</h4>
              <p className="text-sm text-white/80">Your bill is deleted immediately after analysis.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold mb-2">📘 Educational Only</h4>
              <p className="text-sm text-white/80">Not medical or legal advice. Verify with your provider.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold mb-2">🛡️ Not HIPAA</h4>
              <p className="text-sm text-white/80">We are an educational tool, not a healthcare provider.</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">© 2025 ExplainMyBill • Made for patients</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
    </div>
  );
}

export default App;
