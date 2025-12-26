import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // test key

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('onrender.com');

  const handleResult = (data) => {
    // Force paid access for dev + samples
    if (isDev || data?.isPaid) {
      data.isPaid = true;
      setShowUpgrade(false);
    } else {
      setShowUpgrade(true);
    }

    setResult(data);
  };

  const resetToUpload = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  // ===============================
  // REDUCED SAMPLE BILLS (50% smaller – only 2 examples)
  // ===============================
  const sampleBills = [
    {
      name: 'Routine Check-Up',
      type: 'routine',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: {
        isPaid: true,
        pages: [
          {
            structured: {
              summary: 'Routine preventive visit.',
              keyAmounts: {
                totalCharges: '$195.00',
                insurancePaid: '$117.00',
                patientResponsibility: '$39.00',
              },
              services: ['Office Visit (99214)'],
              redFlags: [],
              explanation:
                'This was a standard preventive visit. Insurance covered most costs. The remaining $39 is a normal copay.',
              nextSteps: ['Pay $39', 'No further action needed'],
            },
          },
        ],
      },
    },
    {
      name: 'Emergency Room Visit',
      type: 'er',
      image:
        'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: {
        isPaid: true,
        pages: [
          {
            structured: {
              summary: 'High-cost ER visit with inflated facility fees.',
              keyAmounts: {
                totalCharges: '$4,200.00',
                insurancePaid: '$1,800.00',
                patientResponsibility: '$600.00',
              },
              services: ['ER Visit (99285)', 'Labs', 'X-Ray'],
              redFlags: [
                'Level 5 ER code',
                'Facility fees above average',
              ],
              explanation:
                'ER visits are frequently overcoded. This bill is commonly negotiable.',
              nextSteps: [
                'Request itemized bill',
                'Negotiate with hospital',
                'Check FairHealthConsumer.org',
              ],
            },
          },
        ],
      },
    },
  ];

  const loadSampleFromImage = (type) => {
    setLoading(true);
    const sample = sampleBills.find((b) => b.type === type);

    if (!sample) return;

    setTimeout(() => {
      handleResult(sample.data);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">ExplainMyBill</h1>
          <p className="text-2xl font-light max-w-3xl mx-auto">
            Understand your medical bills in plain English — instantly.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="glass-card p-10 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm border border-white">
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-10">
              <button
                onClick={resetToUpload}
                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-10 rounded-xl transition"
              >
                ← Analyze Another Bill
              </button>
            </div>
            <ExplanationCard
              result={result}
              onUpgrade={() => setShowUpgrade(true)}
            />
          </>
        )}

        {loading && <Loader />}
        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            stripePromise={stripePromise}
          />
        )}
      </main>

      {/* REDUCED SAMPLE BILLS SECTION */}
      <section className="container mx-auto px-6 pb-16 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Try It with a Sample Bill
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          See how ExplainMyBill works instantly — no upload required.
        </p>
        <div className="grid md:grid-cols-2 gap-10">
          {sampleBills.map((bill, i) => (
            <button
              key={i}
              onClick={() => loadSampleFromImage(bill.type)}
              className="group text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="overflow-hidden rounded-2xl shadow-xl bg-white border border-gray-200">
                <img
                  src={bill.image}
                  alt={bill.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="p-6">
                  <p className="font-bold text-xl text-gray-800">{bill.name}</p>
                  <p className="text-sm text-gray-500 mt-2">Click to view analysis</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* TRUST & PRIVACY FOOTER */}
      <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h3 className="text-2xl font-bold mb-6">Your Privacy & Peace of Mind</h3>
          <div className="grid md:grid-cols-3 gap-8 text-left md:text-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-bold text-lg mb-3">🔒 No Data Retained</h4>
              <p className="text-white/80">
                Your bill is processed instantly and deleted immediately after analysis. We do not store, share, or retain any uploaded files or personal information.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-bold text-lg mb-3">📘 Not Medical Advice</h4>
              <p className="text-white/80">
                ExplainMyBill provides educational insights only. This is not medical, legal, or financial advice. Always verify with your provider and insurer.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-bold text-lg mb-3">🛡️ Not HIPAA Certified</h4>
              <p className="text-white/80">
                We are an educational tool, not a healthcare provider. We do not require or handle protected health information under HIPAA regulations.
              </p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            © 2025 ExplainMyBill • Educational tool only • Made with care for patients
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
