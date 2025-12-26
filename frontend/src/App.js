import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // KEEP TEST KEY — safe for testing

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('onrender.com');

  const handleResult = (data) => {
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

  const sampleBills = [
    {
      name: 'Routine Check-Up (Normal)',
      type: 'routine',
      image: 'https://miro.medium.com/v2/resize:fit:1200/1*MpSlUJoxPjb9jk6PG525vA.jpeg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Routine preventive visit.',
            keyAmounts: {
              totalCharges: '$195.00',
              insurancePaid: '$117.00',
              patientResponsibility: '$39.00',
            },
            services: ['Office Visit (99214)'],
            redFlags: [],
            explanation: 'This was a standard preventive visit. Insurance covered most costs. The remaining $39 is a normal copay.',
            nextSteps: ['Pay $39', 'No further action needed'],
          },
        }],
      },
    },
    {
      name: 'Emergency Room (High Charge)',
      type: 'er',
      image: 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-07/250722-hospital-bills-mb-1407-69aafe.jpg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'High-cost ER visit with inflated facility fees.',
            keyAmounts: {
              totalCharges: '$4,200.00',
              insurancePaid: '$1,800.00',
              patientResponsibility: '$600.00',
            },
            services: ['ER Visit (99285)', 'Labs', 'X-Ray'],
            redFlags: ['Level 5 ER code', 'Facility fees above average'],
            explanation: 'ER visits are frequently overcoded. This bill is commonly negotiable.',
            nextSteps: ['Request itemized bill', 'Negotiate with hospital', 'Check FairHealthConsumer.org'],
          },
        }],
      },
    },
    {
      name: 'Denied Lab Tests',
      type: 'denied',
      image: 'https://publicinterestnetwork.org/wp-content/uploads/2025/09/EOB-with-one-charge-denied-388.54.jpg',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Standard labs denied as not medically necessary.',
            keyAmounts: {
              totalCharges: '$265.00',
              patientResponsibility: '$265.00',
            },
            services: ['80053', '85025'],
            redFlags: ['Full denial'],
            explanation: 'Lab denials are commonly overturned with a doctor letter.',
            nextSteps: ['Request medical necessity letter', 'Submit insurance appeal'],
          },
        }],
      },
    },
    {
      name: 'Surprise Ambulance Bill',
      type: 'ambulance',
      image: 'https://armandalegshow.com/wp-content/uploads/2023/07/S10_EP01_No-Surprises-Update.png',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: 'Out-of-network ambulance transport.',
            keyAmounts: {
              totalCharges: '$1,800.00',
              insurancePaid: '$400.00',
              patientResponsibility: '$1,400.00',
            },
            services: ['A0429', 'A0425'],
            redFlags: ['Surprise billing'],
            explanation: 'Ambulance services often trigger surprise bills. Protections may apply.',
            nextSteps: ['Check No Surprises Act', 'Negotiate directly'],
          },
        }],
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

      <div className="container mx-auto px-6 -mt-8 relative z-10 mb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-green-400">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl">🔒</span>
            <h2 className="text-3xl font-black text-gray-800">Your Privacy Is 100% Protected</h2>
          </div>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We <strong>delete your bill immediately</strong> after analysis. 
            No data is stored, shared, or retained. 
            We keep <strong>zero</strong> personal or health information — ever.
          </p>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
            Upload Your Medical Bill
          </h2>
          <p className="text-center text-gray-700 mb-10 text-lg">
            Get a clear, accurate breakdown in seconds — completely private and secure.
          </p>
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-12">
              <button
                onClick={resetToUpload}
                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transition hover:scale-105"
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

      <section className="container mx-auto px-6 py-16 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
          Or Try a Sample Bill Instantly
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {sampleBills.map((bill, i) => (
            <button
              key={i}
              onClick={() => loadSampleFromImage(bill.type)}
              className="group text-center transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label={`Try sample: ${bill.name}`}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-all">
                <img
                  src={bill.image}
                  alt={bill.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <p className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition">
                    {bill.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Click for full review</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Testimonials />

      <footer className="bg-blue-900 text-white py-16 text-center">
        <div className="container mx-auto px-6">
          <p className="text-4xl font-bold mb-6">30-Day Money-Back Guarantee</p>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Try any plan risk-free. Not satisfied? Get a full refund within 30 days — no questions asked.
          </p>
          <p className="text-lg opacity-90">
            © 2025 ExplainMyBill • Educational tool • Not medical or legal advice
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
