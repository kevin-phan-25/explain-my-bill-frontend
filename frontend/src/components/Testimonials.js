// src/components/Testimonials.js
import React from "react";
import { motion } from "framer-motion";

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-2xl ${i <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function Testimonials() {
  const testimonials = [
    { name: "Maria S., Chicago", rating: 5, text: "Spotted a duplicate charge on my $3,200 bill. Got $1,100 refunded!" },
    { name: "David L., Austin", rating: 5, text: "Finally understand my bills as a freelancer. No more fear." },
    { name: "Jennifer K., Seattle", rating: 5, text: "Decoded my child's pediatric bill in minutes. Huge relief." },
    { name: "Robert T., Miami", rating: 5, text: "Love the privacy — nothing stored. Felt safe uploading." },
    { name: "Emily R., Denver", rating: 5, text: "Appeal letter draft worked perfectly. Denied claim approved!" },
    { name: "Michael P., Boston", rating: 5, text: "Thought I owed $800 — actually $120 after adjustment spotted." },
    { name: "Sarah M., New York", rating: 5, text: "Reduced $7,000 ER bill to $1,000. Got a refund!" },
    { name: "James T., Los Angeles", rating: 4.8, text: "Saved over half on $10k hospital stay. Clear breakdown was key." },
    { name: "Lisa H., Houston", rating: 5, text: "Cancer treatment denial reversed using appeal guidance. Lifesaver." },
    { name: "Kevin R., Phoenix", rating: 5, text: "$4,000 surprise balance gone after audit tip." },
    { name: "Anna B., Portland", rating: 5, text: "Negotiated $2,500 bill down significantly. Worth every penny." },
    { name: "Carlos G., Atlanta", rating: 5, text: "Found errors that saved my family $1,800. Privacy-first is real." },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-indigo-950/50 dark:to-purple-950/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Trusted by Patients Nationwide
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Over 5,000+ bills analyzed • Average savings: $1,200+
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/30 hover:shadow-cyan-500/30 transition-all duration-500 flex flex-col"
            >
              <StarRating rating={t.rating} />
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic flex-1 mb-6">
                "{t.text}"
              </p>
              <p className="font-bold text-xl text-blue-900 dark:text-blue-300 text-right">
                — {t.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
