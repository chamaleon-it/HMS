import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Does Synapse work without the internet?",
        answer: "Yes! Our Hybrid Architecture ensures that your hospital operations never stop. You can continue to admit patients, bill services, and manage wards offline. Data syncs automatically when the connection is restored."
    },
    {
        question: "Is my patient data secure?",
        answer: "Absolutely. We use military-grade AES-256 encryption for all data. We are HIPAA and GDPR compliant, and our servers are hosted in secure, ISO-certified data centers within India."
    },
    {
        question: "How long does implementation take?",
        answer: "For most mid-sized hospitals (50-200 beds), we can go live in under 7 days. Our team handles data migration, staff training, and hardware setup."
    },
    {
        question: "Do you support Tally integration?",
        answer: "Yes, Synapse pushes all financial data (invoices, receipts, expenses) to Tally automatically at the end of the day, saving your accountant hours of manual entry."
    },
    {
        question: "What kind of support do you offer?",
        answer: "We provide 24/7 priority support via phone, email, and WhatsApp. You also get a dedicated account manager for the first 3 months to ensure smooth adoption."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-24 bg-black/30">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-400">
                        Everything you need to know about modernizing your hospital.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-semibold text-white text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
