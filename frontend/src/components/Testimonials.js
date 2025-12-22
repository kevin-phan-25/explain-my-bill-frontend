// Add this component in src/components/Testimonials.js
import React from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      text: "I was shocked by a $1,200 ER bill. ExplainMyBill showed me an overcharge and helped me draft an appeal. I got $800 back!",
    },
    {
      name: "John D.",
      text: "Finally understood what all those CPT codes meant. Saved hours of confusion and stress.",
    },
    {
      name: "Lisa R.",
      text: "The privacy promise made me feel safe uploading my bill. No data stored — that's huge for medical info.",
    },
  ];

  return (
    <div className="bg-blue-50 py-20 mt-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
          Trusted by People Like You
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-8 text-center">
              <p className="text-lg text-gray-700 italic mb-6">"{t.text}"</p>
              <p className="font-bold text-blue-900">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
