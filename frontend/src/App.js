import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';
import Testimonials from './components/Testimonials';

const stripePromise = loadStripe('pk_test_51YourTestKeyHere'); // Replace with your actual test key

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    // Force full paid experience for samples and dev mode
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('onrender.com');

    if (isDev || data.isPaid) {
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

  // === REALISTIC SAMPLE BILLS WITH FULL STRUCTURED DATA ===
  const sampleBills = [
    {
      name: "Routine Check-Up (Normal)",
      type: 'routine',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "This is a routine preventive visit with no major issues.",
            keyAmounts: {
              totalCharges: "$195.00",
              insuranceAdjusted: "$39.00",
              insurancePaid: "$117.00",
              patientResponsibility: "$39.00"
            },
            confidences: {
              totalCharges: 95,
              insurancePaid: 98,
              patientResponsibility: 97
            },
            services: ["Office Visit (99214)", "Blood Pressure Check", "Preventive Counseling"],
            redFlags: [],
            explanation: "This bill is for a standard annual check-up. Your insurance covered most of the cost as preventive care. The remaining $39 is your standard copay for an established patient visit. Everything appears correct and reasonable.",
            nextSteps: [
              "Pay the $39 balance",
              "Schedule your next annual visit",
              "No further action needed"
            ]
          }
        }]
      }
    },
    {
      name: "Emergency Room (High Charge)",
      type: 'er',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "High-cost ER visit with potentially inflated facility fees.",
            keyAmounts: {
              totalCharges: "$4,200.00",
              insuranceAdjusted: "$1,800.00",
              insurancePaid: "$1,800.00",
              patientResponsibility: "$600.00"
            },
            confidences: {
              totalCharges: 92,
              insurancePaid: 88,
              patientResponsibility: 90
            },
            services: ["Emergency Room Visit (99285)", "IV Fluids", "Blood Tests", "X-Ray"],
            redFlags: [
              "Facility fee significantly higher than national average",
              "Level 5 ER code used — often overcoded",
              "Potential surprise billing risk"
            ],
            explanation: "This is a very expensive ER bill. The facility charged $4,200 for what appears to be a moderate visit. Insurance negotiated down to $2,400 but you're still responsible for $600. ER bills like this are frequently reduced through negotiation or appeal.",
            nextSteps: [
              "Request a detailed itemized bill",
              "Compare charges at FairHealthConsumer.org (search your ZIP code)",
              "Call the hospital billing department to negotiate",
              "Submit an appeal to your insurance if denied services",
              "Consider No Surprises Act protection if out-of-network"
            ]
          }
        }]
      }
    },
    {
      name: "Denied Lab Tests",
      type: 'denied',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "Multiple lab tests denied as 'not medically necessary'.",
            keyAmounts: {
              totalCharges: "$265.00",
              insuranceAdjusted: "$0.00",
              insurancePaid: "$0.00",
              patientResponsibility: "$265.00"
            },
            confidences: {
              totalCharges: 96,
              insurancePaid: 100,
              patientResponsibility: 98
            },
            services: ["Comprehensive Metabolic Panel (80053)", "Complete Blood Count (85025)"],
            redFlags: [
              "Full denial of standard labs",
              "Denials for routine bloodwork often overturned on appeal",
              "Missing pre-authorization documentation"
            ],
            explanation: "Your insurance denied these standard blood tests, leaving you responsible for the full amount. This is common but frequently reversible with proper documentation from your doctor.",
            nextSteps: [
              "Contact your doctor's office for a letter of medical necessity",
              "Submit a formal appeal to your insurance within 180 days",
              "Reference diagnosis codes from your visit",
              "Request peer-to-peer review if needed"
            ]
          }
        }]
      }
    },
    {
      name: "Surprise Ambulance Bill",
      type: 'ambulance',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "High-cost ambulance transport with limited insurance coverage.",
            keyAmounts: {
              totalCharges: "$1,800.00",
              insuranceAdjusted: "$1,000.00",
              insurancePaid: "$400.00",
              patientResponsibility: "$1,400.00"
            },
            confidences: {
              totalCharges: 94,
              insurancePaid: 85,
              patientResponsibility: 92
            },
            services: ["Basic Life Support Ambulance (A0429)", "Mileage Charge (A0425)"],
            redFlags: [
              "Surprise out-of-network ambulance billing",
              "High mileage charges",
              "Limited insurance coverage for ground transport"
            ],
            explanation: "Ambulance services are frequently out-of-network and result in surprise bills. Your insurance paid only a portion, leaving you with a large balance. Federal and state protections may apply.",
            nextSteps: [
              "Check if this qualifies under the No Surprises Act",
              "Request itemized breakdown of mileage and services",
              "Contact ambulance company to negotiate",
              "File complaint with your state insurance commissioner if needed"
            ]
          }
        }]
      }
    },
    {
      name: "Out-of-Network Specialist",
      type: 'out_network',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "Out-of-network provider with high balance billing.",
            keyAmounts: {
              totalCharges: "$650.00",
              insuranceAdjusted: "$500.00",
              insurancePaid: "$120.00",
              patientResponsibility: "$530.00"
            },
            confidences: {
              totalCharges: 93,
              insurancePaid: 87,
              patientResponsibility: 91
            },
            services: ["New Patient Office Visit (99204)"],
            redFlags: [
              "Significant balance billing",
              "Out-of-network provider",
              "Possible gap exception available"
            ],
            explanation: "You saw a specialist outside your insurance network, resulting in limited coverage and high out-of-pocket cost. Many insurers offer 'gap exceptions' for necessary out-of-network care.",
            nextSteps: [
              "Request a 'gap exception' or in-network rate adjustment",
              "Ask provider if they participate in any surprise billing protections",
              "Submit appeal with documentation of medical necessity",
              "Negotiate directly with provider billing office"
            ]
          }
        }]
      }
    },
    {
      name: "Dental Cleaning + X-Ray",
      type: 'dental',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "Routine dental cleaning with full preventive coverage.",
            keyAmounts: {
              totalCharges: "$270.00",
              insuranceAdjusted: "$90.00",
              insurancePaid: "$180.00",
              patientResponsibility: "$90.00"
            },
            confidences: {
              totalCharges: 96,
              insurancePaid: 95,
              patientResponsibility: 97
            },
            services: ["Adult Prophylaxis (D1110)", "Full Mouth X-Rays (D0210)", "Comprehensive Exam (D0150)"],
            redFlags: [],
            explanation: "Standard preventive dental visit. Your insurance covered cleanings and exam at 100%, with X-rays at 80%. The remaining $90 is typical for annual X-rays not fully covered.",
            nextSteps: [
              "Pay the $90 balance",
              "Schedule cleaning for other family members",
              "Check remaining annual maximum"
            ]
          }
        }]
      }
    },
    {
      name: "Eye Exam & Glasses (Vision)",
      type: 'vision',
      data: {
        isPaid: true,
        pages: [{
          structured: {
            summary: "Routine vision exam with frame/lens allowance applied.",
            keyAmounts: {
              totalCharges: "$485.00",
              insuranceAdjusted: "$200.00",
              insurancePaid: "$150.00",
              patientResponsibility: "$335.00"
            },
            confidences: {
              totalCharges: 94,
              insurancePaid: 90,
              patientResponsibility: 93
            },
            services: ["Refraction (92015)", "Routine Eye Exam", "Frames & Lenses"],
            redFlags: [],
            explanation: "Vision insurance typically covers exam and provides an allowance for glasses. You received $150 toward frames/lenses. The remaining cost is for upgraded frames or lenses beyond allowance.",
            nextSteps: [
              "Pay remaining balance",
              "Consider cheaper frames online next time",
              "Check if contacts are covered alternatively"
            ]
          }
        }]
      }
    }
  ];

  // Load sample bill — now instantly shows full analysis
  const loadSampleFromImage = (type) => {
    setLoading(true);
    
    // Find the matching sample
    const sample = sampleBills.find(b => b.type === type);
    if (sample) {
      // Small delay for realism
      setTimeout(() => {
        handleResult(sample.data);
        setLoading(false);
      }, 800);
    }
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

      <main id="main-content" className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="glass-card p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-4">Upload Your Medical Bill</h2>
          <p className="text-base text-center text-gray-700 mb-6">
            Get a clear explanation in seconds — secure and private.
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

      {/* Sample Bills Section */}
      <div className="container mx-auto px-6 mt-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
          Or Try a Sample Bill Instantly
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sampleBills.map((bill, i) => (
            <div key={i} className="text-center">
              <button
                onClick={() => loadSampleFromImage(bill.type)}
                className="block w-full transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label={`Analyze sample ${bill.name}`}
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500 mb-4">
                  <span className="text-6xl">📄</span>
                </div>
                <p className="mt-6 text-2xl font-bold text-blue-900">
                  {bill.name}
                </p>
                <p className="text-lg text-gray-600 mt-2">Click to see full analysis</p>
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
            rel="noopener noreferrer"
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
