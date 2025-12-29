import React, { useState, useEffect } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);

  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('onrender.com');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      name: 'Check-Up',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: { isPaid: true, pages: [{ structured: { summary: 'Routine visit.', keyAmounts: { totalCharges: '$195', insurancePaid: '$117', patientResponsibility: '$39' }, explanation: 'Normal copay.' } }] },
    },
    {
      name: 'ER Visit',
      image: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: { isPaid: true, pages: [{ structured: { summary: 'High-cost ER.', keyAmounts: { totalCharges: '$4,200', insurancePaid: '$1,800', patientResponsibility: '$600' }, redFlags: ['High fees'], explanation: 'Often negotiable.' } }] },
    },
  ];

  const loadSample = (data) => {
    setLoading(true);
    setTimeout(() => {
      handleResult(data);
      setLoading(false);
    }, 500);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header with Dark Mode Toggle */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">ExplainMyBill</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <>
            <div className="text-center mb-6">
              <button onClick={reset} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}
      </main>

      {/* Sample Bills */}
      {!result && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-center mb-6">Try a Sample</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {samples.map((bill, i) => (
              <button
                key={i}
                onClick={() => loadSample(bill.data)}
                className="group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
              >
                <img src={bill.image} alt={bill.name} className="w-full h-40 object-cover group-hover:scale-105 transition" />
                <div className="bg-white dark:bg-gray-800 p-4 text-center">
                  <p className="font-semibold">{bill.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Testimonials />

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-black text-white/70 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><strong>🔒 No Data Stored</strong><p>Deleted after analysis</p></div>
            <div><strong>📘 Educational Only</strong><p>Not medical advice</p></div>
            <div><strong>🛡️ Privacy First</strong><p>No HIPAA required</p></div>
          </div>
          <p>© 2025 ExplainMyBill</p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />}
    </div>
  );
}

export default App;
