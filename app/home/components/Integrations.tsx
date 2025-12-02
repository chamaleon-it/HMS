import React from 'react';
import { Database, Server, Smartphone, CreditCard, Activity, FileSpreadsheet } from 'lucide-react';

const Integrations = () => {
    const integrations = [
        { name: "Tally / QuickBooks", icon: FileSpreadsheet, desc: "Accounting Sync" },
        { name: "LIS Machines", icon: Activity, desc: "Bi-directional Sync" },
        { name: "Payment Gateways", icon: CreditCard, desc: "Razorpay, Stripe" },
        { name: "WhatsApp & SMS", icon: Smartphone, desc: "Patient Alerts" },
        { name: "PACS Servers", icon: Server, desc: "DICOM Imaging" },
        { name: "Govt Portals", icon: Database, desc: "ABDM, NDHM" },
    ];

    return (
        <section className="py-24 relative border-y border-white/5 bg-black/40">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                            Connects with <span className="text-[#60A5FA]">Everything</span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            Synapse isn&apos;t an island. It sits at the center of your hospital&apos;s ecosystem, connecting seamlessly with your existing hardware and software.
                        </p>
                        <ul className="space-y-4">
                            {["Zero-setup machine integration", "Real-time financial posting", "Automated patient communication"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {integrations.map((item, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center text-center hover:bg-white/10 transition-all hover:-translate-y-1">
                                <div className="bg-black/50 p-3 rounded-lg mb-4 text-[#60A5FA]">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="font-semibold text-white text-sm mb-1">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Integrations;
