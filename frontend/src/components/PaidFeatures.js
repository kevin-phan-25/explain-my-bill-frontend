import React from 'react';

export default function PaidFeatures({ features }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Premium Insights Unlocked</h3>

      {features.redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Red Flags Detected</h4>
          <ul className="list-disc pl-6 text-red-700">
            {features.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h4 className="font-bold mb-3">💰 Estimated Savings</h4>
          <p className="text-2xl font-bold text-green-600">{features.estimatedSavings.potentialSavings}</p>
          <p className="text-gray-600">{features.estimatedSavings.reason}</p>
        </div>

        <div className="glass-card p-6">
          <h4 className="font-bold mb-3">🏥 Insurance Coverage</h4>
          <p className="font-medium">{features.insuranceLookup.insurer}</p>
          <p className="text-gray-600">{features.insuranceLookup.coverageNote}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h4 className="font-bold mb-3">📄 Appeal Letter Draft</h4>
        <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          {features.appealLetter}
        </pre>
      </div>

      <div className="glass-card p-6">
        <h4 className="font-bold mb-3">💡 Next Steps</h4>
        <p className="text-gray-700">{features.customAdvice}</p>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Share this explanation: <a href={features.shareableLink} className="text-primary underline">{features.shareableLink}</a>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Need help? Email <a href="mailto:support@explainmybill.com" className="text-primary">support@explainmybill.com</a>
        </p>
      </div>
    </div>
  );
}
