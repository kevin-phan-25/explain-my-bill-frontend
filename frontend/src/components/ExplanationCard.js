import React, { useState } from 'react';
import PaidFeatures from './PaidFeatures';

export default function ExplanationCard({ result, onUpgrade }) {
  const [activePage, setActivePage] = useState(0);
  const page = result.pages[activePage];

  // Function to highlight red flags inline
  const highlightRedFlags = (text) => {
    if (!result.isPaid) return text;
    return text.replace(
      /(RED FLAG: .*?(\.|$))/gi,
      '<span class="bg-yellow-200 font-bold px-1 rounded">$1</span>'
    );
  };

  return (
    <div className="space-y-12 mt-12">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-blue-900 mb-6">Your Bill Explained</h2>
        <p className="text-2xl text-gray-700 max-w-4xl mx-auto">
          We've translated your medical bill into plain English so you can understand exactly what you're being charged for.
        </p>
      </div>

      {/* TL;DR Summary Box */}
      {result.isPaid && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto mb-10 shadow-xl">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Quick Summary</h3>
          <ul className="space-y-2 text-xl text-blue-800">
            <li>• Total pages: {result.pages.length}</li>
            <li>• Red Flags: {result.paidFeatures?.redFlags?.length || 0}</li>
            <li>• Potential Savings: {result.paidFeatures?.estimatedSavings?.potentialSavings || "N/A"}</li>
            <li>• Insurance Info: {result.paidFeatures?.insuranceLookup?.insurer || "Unknown"}</li>
          </ul>
        </div>
      )}

      {/* Upgrade Notice for Free Users */}
      {!result.isPaid && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-4 border-amber-300 rounded-3xl p-10 text-center max-w-4xl mx-auto shadow-2xl">
          <p className="text-2xl font-medium text-amber-900 mb-6">
            🔒 This is a free summary. Upgrade for the <strong>complete explanation</strong>, red flags, appeal letter, and savings tips.
          </p>
          <button onClick={onUpgrade} className="btn-upgrade">
            Unlock Full Explanation – $17.99
          </button>
        </div>
      )}

      {/* Page Tabs */}
      {result.pages.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {result.pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setActivePage(i)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${
                i === activePage
                  ? 'bg-blue-600 text-white shadow-xl'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={`View page ${p.page}`}
            >
              Page {p.page}
            </button>
          ))}
        </div>
      )}

      {/* Main Explanation – Simple & Beautiful */}
      <div className="glass-card p-12 max-w-5xl mx-auto">
        <div className="prose prose-2xl max-w-none text-gray-800">
          <div className="leading-relaxed space-y-6">
            {page.explanation.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-xl" dangerouslySetInnerHTML={{ __html: highlightRedFlags(paragraph.replace(/\n/g, '<br />')) }} />
            ))}
          </div>
        </div>

        {/* Paid Features */}
        {result.isPaid && result.paidFeatures && (
          <div className="mt-12">
            <PaidFeatures features={result.paidFeatures} />
          </div>
        )}

        {/* Next Steps Box */}
        {result.isPaid && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mt-10 shadow-xl">
            <h3 className="text-2xl font-bold text-green-900 mb-4">Next Steps</h3>
            <ol className="list-decimal list-inside text-xl text-green-800 space-y-2">
              <li>Verify any red-flag charges with your provider</li>
              <li>Call your insurance company for questions</li>
              <li>Use FairHealthConsumer.org to check average costs</li>
              <li>Keep this explanation for records or appeals</li>
            </ol>
          </div>
        )}
      </div>

      {/* Trust Reassurance */}
      <div className="text-center mt-12">
        <p className="text-lg text-gray-600 italic max-w-3xl mx-auto">
          Your bill was processed securely and has been deleted. We never store your data.
        </p>
      </div>
    </div>
  );
}
