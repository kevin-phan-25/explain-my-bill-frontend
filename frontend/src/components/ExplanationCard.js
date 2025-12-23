import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere');

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('onrender.com');

  const handleResult = (data) => {
    data.isPaid = isDev || data.isPaid;
    setShowUpgrade(!data.isPaid);
    setResult(data);
  };

  const reset = () => {
    setResult(null);
    setShowUpgrade(false);
  };

  // ===== SAMPLE BILLS (NO OCR FAILS) =====
  const samples = [
    {
      name: 'Routine Check-Up',
      type: 'routine',
      img: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Routine preventive visit.',
            keyAmounts: {
              totalCharges: '$195',
              insurancePaid: '$117',
              patientResponsibility: '$39',
            },
            services: ['Office Visit (99214)'],
            redFlags: [],
            explanation: 'Standard check-up. Insurance covered most of the bill.',
            nextSteps: ['Pay $39'],
          },
        }],
      },
    },
    {
      name: 'Emergency Room',
      type: 'er',
      img: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'High-cost ER visit.',
            keyAmounts: {
              totalCharges: '$4,200',
              insurancePaid: '$1,800',
              patientResponsibility: '$600',
            },
            services: ['ER Visit (99285)', 'Labs'],
            redFlags: ['Possible overcoding'],
            explanation: 'ER visits are commonly negotiable.',
            nextSteps: ['Request itemized bill', 'Negotiate'],
          },
        }],
      },
    },
    {
      name: 'Denied Labs',
      type: 'denied',
      img: 'https://publicinterestnetwork.org/wp-content/uploads/2025/09/EOB-with-one-charge-denied-388.54.jpg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Lab tests denied.',
            keyAmounts: {
              totalCharges: '$265',
              patientResponsibility: '$265',
            },
            services: ['80053', '85025'],
            redFlags: ['Insurance denial'],
            explanation: 'Denials are often overturned on appeal.',
            nextSteps: ['Get doctor letter', 'Appeal'],
          },
        }],
      },
    },
  ];

  const loadSample = (type) => {
    setLoading(true);
    const sample = samples.find(s => s.type === type);
    setTimeout(() => {
      handleResult(sample.data);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* HEADER */}
      <header className="bg-blue-800 text-white py-14 text-center shadow-xl">
        <h1 className="text-4xl font-bold">ExplainMyBill</h1>
        <p className="text-xl mt-4">
          Medical bills explained in plain English.
        </p>
      </header>

      {/* TRUST / PRIVACY SECTION */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white border-l-8 border-green-600 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🔒</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your Privacy Comes First
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We <strong>do not store</strong> your medical bills, images, or personal data.
                Your file is processed securely and discarded immediately.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                We are <strong>not HIPAA-certified</strong> because we retain
                <strong> zero health information</strong>. Nothing is saved, sold,
                shared, or used for training.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="glass-card p-6 shadow-2xl">
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-8">
              <button
                onClick={reset}
                className="bg-gray-800 text-white px-6 py-3 rounded-xl"
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

      {/* SAMPLE BILLS */}
      <section className="container mx-auto px-6 pb-16 max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-8">
          Try a Sample Bill
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {samples.map((s, i) => (
            <button
              key={i}
              onClick={() => loadSample(s.type)}
              className="hover:scale-105 transition text-center"
            >
              <img
                src={s.img}
                alt={s.name}
                className="rounded-xl shadow-lg bg-white p-3"
              />
              <p className="mt-3 font-semibold">{s.name}</p>
            </button>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white py-8 text-center">
        <p className="font-semibold">30-Day Money-Back Guarantee</p>
        <p className="text-sm mt-2 opacity-80">
          © 2025 ExplainMyBill • Educational tool • Not medical or legal advice
        </p>
      </footer>
    </div>
  );
}
