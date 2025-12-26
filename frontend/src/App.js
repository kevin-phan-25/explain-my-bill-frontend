import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';
import PaidFeatures from './components/PaidFeatures.js;

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
  // FULL SAMPLE DATA (NO OCR FAIL)
  // ===============================
  const sampleBills = [
    {
      name: 'Routine Check-Up (Normal)',
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
      name: 'Emergency Room (High Charge)',
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
    {
      name: 'Denied Lab Tests',
      type: 'denied',
      image:
        'https://publicinterestnetwork.org/wp-content/uploads/2025/09/EOB-with-one-charge-denied-388.54.jpg',
      data: {
        isPaid: true,
        pages: [
          {
            structured: {
              summary: 'Standard labs denied as not medically necessary.',
              keyAmounts: {
                totalCharges: '$265.00',
                patientResponsibility: '$265.00',
              },
              services: ['80053', '85025'],
              redFlags: ['Full denial'],
              explanation:
                'Lab denials are commonly overturned with a doctor letter.',
              nextSteps: [
                'Request medical necessity letter',
                'Submit insurance appeal',
              ],
            },
          },
        ],
      },
    },
    {
      name: 'Surprise Ambulance Bill',
      type: 'ambulance',
      image:
        'https://armandalegshow.com/wp-content/uploads/2023/07/S10_EP01_No-Surprises-Update.png',
      data: {
        isPaid: true,
        pages: [
          {
            structured: {
              summary: 'Out-of-network ambulance transport.',
              keyAmounts: {
                totalCharges: '$1,800.00',
                insurancePaid: '$400.00',
                patientResponsibility: '$1,400.00',
              },
              services: ['A0429', 'A0425'],
              redFlags: ['Surprise billing'],
              explanation:
                'Ambulance services often trigger surprise bills. Protections may apply.',
              nextSteps: [
                'Check No Surprises Act',
                'Negotiate directly',
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
        <div className="glass-card p-6 shadow-2xl">
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        </div>

        {result && (
          <>
            <div className="text-center my-8">
              <button
                onClick={resetToUpload}
                className="bg-gray-800 text-white py-3 px-8 rounded-xl"
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
      <section className="container mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Try a Sample Bill
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {sampleBills.map((bill, i) => (
            <button
              key={i}
              onClick={() => loadSampleFromImage(bill.type)}
              className="text-center hover:scale-105 transition"
            >
              <img
                src={bill.image}
                alt={bill.name}
                className="rounded-xl shadow-xl bg-white p-4"
              />
              <p className="mt-4 font-bold text-lg">{bill.name}</p>
            </button>
          ))}
        </div>
      </section>

      <Testimonials />

      <footer className="bg-blue-900 text-white py-10 text-center">
        © 2025 ExplainMyBill • Educational only
      </footer>
    </div>
  );
}

export default App;
