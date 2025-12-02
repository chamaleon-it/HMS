import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black to-primary/10 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-3xl p-8 md:p-16 text-center backdrop-blur-md overflow-hidden relative group">

                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 group-hover:bg-primary/30 transition-all duration-700" />

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Ready to Transform Your Hospital?
                    </h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join 500+ modern hospitals using Synapse to streamline operations, reduce costs, and deliver superior patient care.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Book a Free Demo
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 hover:bg-white/10 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
                            Contact Sales
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="mt-8 text-sm text-slate-500">
                        No credit card required. Free migration support included.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
