import React from 'react';
import { Building2 } from 'lucide-react';

const TrustSection = () => {
    // Placeholder for hospital logos - using text for now as requested
    const hospitals = [
        "Apollo Hospitals",
        "Fortis Healthcare",
        "Max Healthcare",
        "Manipal Hospitals",
        "Narayana Health",
        "Medanta"
    ];

    return (
        <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <p className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-widest">
                    Trusted by 500+ Modern Hospitals across India
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {hospitals?.map((hospital, index) => (
                        <div key={index} className="flex items-center gap-2 group cursor-default">
                            <Building2 className="w-6 h-6 text-slate-600 group-hover:text-[#3B82F6] transition-colors" />
                            <span className="text-xl font-bold text-slate-600 group-hover:text-slate-300 transition-colors">
                                {hospital}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
