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
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Hero Header */}
      <header className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-800/30 to-purple-900/40 blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              ExplainMyBill
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-white/90 max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 border border-white/20">
              <p className="text-lg">Trusted by patients nationwide</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {!result ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-purple-600/10 blur-3xl" />
            <div className="relative">
              <BillUploader onResult={handleResult} onLoading={setLoading} />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center my-12">
              <button
                onClick={reset}
                className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 px-8 py-4 rounded-full border border-white/30 transition-all duration-300 hover:scale-105"
              >
                <span className="text-2xl group-hover:-translate-x-1 transition">←</span>
                <span className="font-medium">Analyze Another Bill</span>
              </button>
            </div>
            <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
          </>
        )}
      </main>

      {/* Sample Bills Section */}
      {!result && (
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                See It In Action
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Try a real example — no upload needed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {samples.map((bill, i) => (
              <button
                key={i}
                onClick={() => loadSample(bill.data)}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition duration-700" />
                <img
                  src={bill.image}
                  alt={bill.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <h3 className="text-3xl font-bold mb-2">{bill.name}</h3>
                  <p className="text-cyan-300 font-medium">Click to view analysis →</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Testimonials />

      {/* Trust & Privacy Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-t from-black/50 to-transparent py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-indigo-900/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-black mb-12">
            Your Privacy Comes First
          </h3>
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              {
                icon: "🔒",
                title: "No Data Retained",
                text: "Your bill is processed instantly and deleted immediately. We never store or share your files.",
              },
              {
                icon: "📘",
                title: "Educational Tool Only",
                text: "This is not medical, legal, or financial advice. Always verify with your provider and insurer.",
              },
              {
                icon: "🛡️",
                title: "Not HIPAA Certified",
                text: "We are an educational platform, not a healthcare provider. No protected health information required.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-cyan-500/50 transition">
                <div className="text-6xl mb-6">{item.icon}</div>
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-white/70 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-lg">
            © 2025 ExplainMyBill • Built with care for patients everywhere
          </p>
        </div>
      </footer>

      {loading && <Loader />}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} stripePromise={stripePromise} />
      )}
    </div>
  );
}

export default App;
