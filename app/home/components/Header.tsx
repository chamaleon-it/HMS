import React, { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <header className="fixed w-full top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-[#3B82F6]/20 p-2 rounded-lg">
                            <Activity className="w-6 h-6 text-[#60A5FA]" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Synapse</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-slate-400 hover:text-white font-medium transition-colors text-sm"
                            >
                                {item.name}
                            </a>
                        ))}
                        <button className="bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-full font-semibold text-sm transition-all">
                            Login
                        </button>
                        <button className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]">
                            Book Demo
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black border-b border-white/10 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-slate-400 hover:text-white font-medium py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </a>
                            ))}
                            <button className="bg-[#3B82F6] hover:bg-[#60A5FA] text-white px-6 py-3 rounded-lg font-medium w-full">
                                Start Free Trial
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
