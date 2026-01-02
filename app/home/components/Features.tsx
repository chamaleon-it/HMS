import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, BedDouble, Pill, Microscope, FileText, Users, LucideProps } from 'lucide-react';
import ScannerCard from './ui/ScannerCard';

const features = [
    {
        icon: Stethoscope,
        title: 'AI Doctor Assistant',
        description: 'Consultations 3x faster. AI suggests prescriptions, takes notes, and pulls history instantly.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Pill,
        title: 'Smart Pharmacy',
        description: '1-Click Sync with suppliers. AI predicts stock needs so you never run out of meds.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: Microscope,
        title: 'Auto-Pathology',
        description: 'Zero-error reports. Machines talk directly to Synapse. Auto-verification for normal values.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
    },
    {
        icon: BedDouble,
        title: 'Live Ward View',
        description: 'See every bed in real-time. Auto-discharge summaries ready before the patient leaves.',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
    },
    {
        icon: FileText,
        title: 'Instant Claims',
        description: '100% settlement rate. AI catches billing errors before you hit submit.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
    },
    {
        icon: Users,
        title: 'Staff & Payroll',
        description: 'Biometric attendance linked to payroll. Shift planning optimized by AI.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
    },
];

const FeatureCard = ({ feature, index }: {
    feature: {
        icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        title: string;
        description: string;
        color: string;
        bg: string;
    }; index: number
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            <ScannerCard className="h-full rounded-2xl border border-white/10 bg-white/5 px-8 py-10">
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.1), transparent 40%)`,
                    }}
                />
                <div className={`mb-6 inline-flex items-center justify-center rounded-xl ${feature.bg} p-3`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </ScannerCard>
        </motion.div>
    );
};

const Features = () => {
    return (
        <section id="features" className="py-24 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                        Features
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Everything you need. <br />
                        <span className="text-slate-500">Nothing you don&apos;t.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        We stripped away the clutter to build a hospital OS that just works. Fast, intuitive, and powerful.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features?.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
