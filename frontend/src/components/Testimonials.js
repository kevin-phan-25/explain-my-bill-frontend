// src/components/Testimonials.js
import React from "react";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-indigo-950/50 dark:to-purple-950/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Trusted by People Like You
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Real patients saving real money with clear, private bill explanations.
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
              className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/30 hover:shadow-cyan-500/30 transition-all duration-500"
            >
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic mb-8">
                "{t.text}"
              </p>
              <p className="font-bold text-xl text-blue-900 dark:text-blue-300 text-right">
                —
