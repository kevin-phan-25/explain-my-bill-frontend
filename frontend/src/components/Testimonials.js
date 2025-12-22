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
    <section className="bg-blue-50 py-20" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 id="testimonials-heading" className="text-4xl font-bold text-center text-blue-900 mb-4">
          What People Are Saying
        </h2>
        <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
          Real users sharing how ExplainMyBill helped them understand and fight their medical bills.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="glass-card p-8 text-center hover:shadow-2xl transition-shadow duration-300"
              tabIndex={0}
              aria-labelledby={`testimonial-name-${i}`}
            >
              <blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                "{t.text}"
              </blockquote>
              <figcaption id={`testimonial-name-${i}`} className="font-bold text-blue-900 text-xl">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
