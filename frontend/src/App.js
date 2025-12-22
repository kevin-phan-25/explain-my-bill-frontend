import React, { useState, useEffect } from 'react';
import BillUploader from './components/BillUploader';
import ExplanationCard from './components/ExplanationCard';
import UpgradeModal from './components/UpgradeModal';
import Loader from './components/Loader';

function App() {
  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Sync with system preference on first load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleResult = (data) => {
    setResult(data);
    if (!data.isPaid) setShowUpgrade(true);
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition"
        aria-label="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            ExplainMyBill
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload any bill and get a simple explanation in seconds.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            🔒 Secure & private – your bill is deleted after analysis
          </p>
        </header>

        {!result ? (
          <BillUploader onResult={handleResult} onLoading={setLoading} />
        ) : (
          <ExplanationCard result={result} onUpgrade={() => setShowUpgrade(true)} />
        )}

        {loading && <Loader />}

        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            stripePromise={stripePromise}
          />
        )}
      </div>
    </div>
  );
}

export default App; // ← Critical: default export for CRA
