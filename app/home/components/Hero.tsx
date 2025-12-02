import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import MedicalBackground from './ui/MedicalBackground';

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">


            {/* Static Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <MedicalBackground />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary-glow font-medium text-sm mb-8 hover:bg-white/10 transition-colors cursor-default">
                            <Sparkles className="w-4 h-4" />
                            <span>Introducing Synapse v2.0</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-semibold text-white leading-tight mb-8 tracking-tight">
                            Streamline Operations & <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-glow via-purple-400 to-accent-glow animate-gradient-x">
                                Improve Patient Care
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl font-light">
                            The all-in-one healthcare OS that automates admin tasks, reduces waiting times, and boosts revenue by <span className="text-green-400 font-bold">30% 📈</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 relative overflow-hidden group animate-pulse-slow">
                                <span className="relative z-10 flex items-center gap-2">
                                    Book a Free Demo
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-full font-medium text-lg transition-all backdrop-blur-md hover:border-white/20">
                                Explore Features
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-8 lg:gap-16 text-sm font-medium text-slate-500 mb-20">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-semibold text-white">500+</span>
                                <span>Hospitals</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-semibold text-white">99.9%</span>
                                <span>Uptime</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-semibold text-white">2M+</span>
                                <span>Patients</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dashboard Mockup - Static with Float Animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full max-w-6xl"
                    >
                        <div className="relative rounded-xl bg-[#0B1121] border border-white/10 shadow-2xl overflow-hidden group animate-float">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                            {/* Browser Chrome */}
                            <div className="h-10 bg-[#0F172A] border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                </div>
                                <div className="ml-4 h-5 w-64 bg-white/5 rounded-md" />
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-1 bg-grid-white/5 min-h-[600px] relative">
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                                    alt="Dashboard Preview"
                                    className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-60 group-hover:mix-blend-normal transition-all duration-700"
                                />

                                {/* Floating Cards - Subtle Float Animation */}
                                <div className="absolute top-1/4 left-1/4 p-6 glass rounded-2xl animate-float [animation-delay:1s]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/20 rounded-xl text-primary-glow">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Daily Revenue</div>
                                            <div className="text-2xl font-semibold text-white">$42,593</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-1/4 right-1/4 p-6 glass rounded-2xl animate-float [animation-delay:2s]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-secondary/20 rounded-xl text-secondary-glow">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">System Status</div>
                                            <div className="text-2xl font-semibold text-white">100% Secure</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Data Stream Sidebar */}
                            <div className="absolute right-0 top-10 bottom-0 w-64 bg-black/40 border-l border-white/5 backdrop-blur-md p-4 overflow-hidden hidden lg:block">
                                <div className="text-xs font-mono text-primary/50 mb-4 border-b border-white/5 pb-2">LIVE VITALS</div>
                                <div className="space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 opacity-60 animate-pulse" style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                            <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-8 bg-white/5 rounded-full ml-auto" />
                                        </div>
                                    ))}
                                </div>
                                {/* Scrolling Code/Data Effect */}
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0B1121] to-transparent z-10" />
                                <div className="mt-8 space-y-2 opacity-30 font-mono text-[10px] text-blue-300">
                                    <div className="animate-scan" style={{ animationDuration: '4s' }}>
                                        <div>System.init(v2.0)</div>
                                        <div>Loading modules...</div>
                                        <div>&gt; Cardiology [OK]</div>
                                        <div>&gt; Neurology [OK]</div>
                                        <div>&gt; Pediatrics [OK]</div>
                                        <div>Connecting to neural net...</div>
                                        <div>Encryption: AES-256</div>
                                        <div>Status: ONLINE</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Glow Effect behind dashboard */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl -z-10 rounded-[3rem]" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
