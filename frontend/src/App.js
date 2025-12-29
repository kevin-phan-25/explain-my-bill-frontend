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

  const samples = [
    {
      name: 'Routine Check-Up',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: { isPaid: true, pages: [{ structured: { summary: 'Routine visit.', keyAmounts: { totalCharges: '$195', insurancePaid: '$117', patientResponsibility: '$39' }, explanation: 'Normal copay.' } }] },
    },
    {
      name: 'ER Visit',
      image: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: { isPaid: true, pages: [{ structured: { summary: 'High-cost ER visit.', keyAmounts: { totalCharges: '$4,200', insurancePaid: '$1,800', patientResponsibility: '$600' }, redFlags: ['High fees'], explanation: 'Often negotiable.' } }] },
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* Compact Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">ExplainMyBill</h1>
          <p className="text-lg md:text-xl">Understand your medical bills — instantly.</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-8">
              <button onClick={reset} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}
      </main>

      {/* Compact Sample Bills */}
      {!result && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Try a Sample</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {samples.map((bill, i) => (
              <button key={i} onClick={() => loadSample(bill.data)} className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <img src={bill.image} alt={bill.name} className="w-full h-48 object-cover group-hover:scale-105 transition" />
                <div className="bg-white p-4 text-center">
                  <p className="font-semibold text-lg">{bill.name}</p>
                  <p className="text-sm text-gray-600">Tap to view</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Testimonials />

      {/* Compact Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div><strong>🔒 No Data Stored</strong><p className="text-white/70 mt-1">Deleted after analysis</p></div>
            <div><strong>📘 Educational Only</strong><p className="text-white/70 mt-1">Not medical advice</p></div>
            <div><strong>🛡️ Privacy First</strong><p className="text-white/70 mt-1">No HIPAA required</p></div>
          </div>
          <p className="text-white/60">© 2025 ExplainMyBill • For patients</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
    </div>
  );
}

export default App;
