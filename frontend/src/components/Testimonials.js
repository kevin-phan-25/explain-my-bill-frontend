// src/components/Testimonials.js
import React from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Maria S., Chicago",
      text: "I received a $3,200 hospital bill that made no sense. ExplainMyBill spotted a duplicate charge and helped me draft an appeal. Insurance refunded $1,100!",
    },
    {
      name: "David L., Austin",
      text: "As a freelancer without great insurance, these bills terrify me. This tool explained every code and adjustment in simple terms. Finally feel in control.",
    },
    {
      name: "Jennifer K., Seattle",
      text: "My child's pediatric bill had mysterious codes. Within minutes, I understood what each procedure was and why it cost what it did. Huge relief.",
    },
    {
      name: "Robert T., Miami",
      text: "The privacy promise made me comfortable uploading my bill. Knowing nothing is stored is exactly what I needed for sensitive medical info.",
    },
    {
      name: "Emily R., Denver",
      text: "Saved me hours of Googling CPT codes. The appeal letter draft was perfect — insurance reconsidered my denied claim.",
    },
    {
      name: "Michael P., Boston",
      text: "Thought I owed $800 out-of-pocket. The explanation showed an insurance adjustment I missed. Ended up owing only $120. Thank you!",
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
