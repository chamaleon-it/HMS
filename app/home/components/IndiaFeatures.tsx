import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode, MessageCircle, Languages } from 'lucide-react';

const IndiaFeatures = () => {
    return (
        <section className="py-24 bg-black/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                                Built for the <span className="text-secondary-glow">Indian Healthcare</span> Ecosystem
                            </h2>
                            <p className="text-slate-400 text-lg mb-10">
                                Synapse is fully compliant with Indian government standards and optimized for local workflows.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="bg-secondary/10 p-4 rounded-2xl h-fit border border-secondary/20 group-hover:border-secondary/50 transition-colors">
                                        <QrCode className="w-6 h-6 text-secondary-glow" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">ABDM Integrated</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Seamlessly create ABHA IDs, link health records, and share data securely via the Ayushman Bharat Digital Mission network.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-5 group">
                                    <div className="bg-green-500/10 p-4 rounded-2xl h-fit border border-green-500/20 group-hover:border-green-500/50 transition-colors">
                                        <MessageCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">WhatsApp Integration</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Send appointment reminders, prescriptions, and invoices directly to patients&apos; WhatsApp.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-5 group">
                                    <div className="bg-orange-500/10 p-4 rounded-2xl h-fit border border-orange-500/20 group-hover:border-orange-500/50 transition-colors">
                                        <Languages className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Multilingual Support</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Interface available in Hindi, Tamil, Telugu, Kannada, and 8 other regional languages.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Abstract Representation of ABDM/Network */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />

                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-secondary/20">AB</div>
                                        <div>
                                            <div className="font-bold text-white text-lg">Ayushman Bharat</div>
                                            <div className="text-sm text-slate-400">Digital Mission</div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Connected
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/20 transition-colors">
                                        <span className="text-slate-300">Health ID Creation</span>
                                        <span className="text-secondary-glow font-mono flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-secondary-glow animate-pulse" /> Success
                                        </span>
                                    </div>
                                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/20 transition-colors">
                                        <span className="text-slate-300">Record Linking</span>
                                        <span className="text-secondary-glow font-mono flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-secondary-glow animate-pulse" /> Active
                                        </span>
                                    </div>
                                    <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/20 transition-colors">
                                        <span className="text-slate-300">Consent Manager</span>
                                        <span className="text-secondary-glow font-mono flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-secondary-glow animate-pulse" /> Verified
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                    <p className="text-sm text-slate-500">
                                        Synapse is a certified PHR app and HIP provider.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default IndiaFeatures;
