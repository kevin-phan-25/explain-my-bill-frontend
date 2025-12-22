import React, { useState } from 'react';
import PageTab from './PageTab';

export default function ExplanationCard({ result, onUpgrade }) {
  const [activePage, setActivePage] = useState(0);

  return (
    <div className="space-y-8">
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold mb-4">Your Bill Explanation</h2>

        {!result.isPaid && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-lg font-medium text-amber-800">
              This is a free teaser summary. Upgrade for the full detailed breakdown.
            </p>
            <button onClick={onUpgrade} className="btn-primary mt-4">
              Unlock Full Explanation
            </button>
          </div>
        )}

        <div className="flex overflow-x-auto gap-4 pb-4 mb-8">
          {result.pages.map((page, i) => (
            <PageTab
              key={i}
              page={page}
              active={i === activePage}
              onClick={() => setActivePage(i)}
            />
          ))}
        </div>

        <div className="prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {result.pages[activePage].explanation}
          </pre>
        </div>

        {result.isPaid && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">
              Full explanation unlocked — thank you for your purchase!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
