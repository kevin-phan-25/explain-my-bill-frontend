export default function ExplanationCard({ explanation, isPaid }) {
  return (
    <div className="mt-6 bg-white shadow-xl rounded-xl p-6 max-w-xl w-full animate-fadeIn">
      <h2 className="text-2xl font-semibold text-primary mb-4">
        {isPaid ? "Your Bill Explanation" : "Preview Explanation"}
      </h2>
      <p className="text-gray-700 whitespace-pre-line">{explanation}</p>
      {!isPaid && (
        <p className="mt-4 text-sm text-gray-500 italic">
          Upgrade to get the full detailed explanation.
        </p>
      )}
    </div>
  );
}
