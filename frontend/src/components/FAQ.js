// src/components/FAQ.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/10 transition"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white pr-4">{question}</h3>
        <span className="text-3xl text-blue-600 dark:text-blue-400">{isOpen ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="px-8 pb-6"
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is my medical bill really private and secure?",
      a: "Yes — 100%. Your bill is processed entirely in memory and deleted immediately after analysis. We do not store, log, or share any part of your bill. No accounts, no emails, no data retention.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. You can use ExplainMyBill completely anonymously — no sign-up, no email, no personal information required.",
    },
    {
      q: "How accurate is the analysis?",
      a: "Very accurate. We use advanced AI (GPT-4o + Gemini) combined with robust pattern matching to extract and explain charges. Thousands of users have successfully appealed bills using our insights.",
    },
    {
      q: "What file types can I upload?",
      a: "PDF, JPG, PNG, and Excel files. For best results, use a clear photo or searchable PDF of the summary page.",
    },
    {
      q: "Can this replace professional advice?",
      a: "No — this is an educational tool only. Always verify with your provider and insurance. We are not medical or legal advisors.",
    },
    {
      q: "What happens after I upgrade?",
      a: "You get instant access to red flags, estimated savings, personalized next steps, and professional appeal letter drafts — all for one bill or unlimited.",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Everything you need to know before uploading
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
