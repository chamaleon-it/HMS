import React from 'react';
import { motion } from 'framer-motion';

const MedicalBackground = () => {
    // Realistic PQRST Wave Pattern
    const generateECGPath = (width, height) => {
        const baseline = height / 2;
        const beatWidth = 200;
        const beats = Math.ceil(width / beatWidth);

        let path = "";

        for (let i = 0; i <= beats; i++) {
            const startX = i * beatWidth;
            if (i === 0) path += `M ${startX} ${baseline}`;
            else path += ` L ${startX} ${baseline}`;

            path += ` L ${startX + 20} ${baseline}`;
            path += ` Q ${startX + 30} ${baseline - 10} ${startX + 40} ${baseline}`;
            path += ` L ${startX + 50} ${baseline}`;
            path += ` L ${startX + 55} ${baseline + 5}`;
            path += ` L ${startX + 65} ${baseline - 50}`;
            path += ` L ${startX + 75} ${baseline + 10}`;
            path += ` L ${startX + 85} ${baseline}`;
            path += ` Q ${startX + 110} ${baseline - 15} ${startX + 135} ${baseline}`;
            path += ` L ${startX + beatWidth} ${baseline}`;
        }

        return path;
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* EKG Line Animation - Static Strip with Moving Dot & Trail */}
            <div className="absolute top-1/2 left-0 w-full h-48 -translate-y-1/2 opacity-100">
                <div className="relative w-full h-full overflow-hidden">
                    {/* Static Container */}
                    <div className="absolute top-0 left-0 h-full w-full">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1920 100">
                            <defs>
                                {/* Gradient for the Mask (Spotlight effect) */}
                                <radialGradient id="mask-gradient">
                                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                                    <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="black" stopOpacity="0" />
                                </radialGradient>

                                {/* The Mask itself - moves with the dot */}
                                <mask id="ecg-mask">
                                    <circle r="150" fill="url(#mask-gradient)">
                                        <animateMotion
                                            dur="12s"
                                            repeatCount="indefinite"
                                            path={generateECGPath(1920, 100)}
                                            calcMode="paced"
                                        />
                                    </circle>
                                </mask>
                            </defs>

                            {/* The ECG Line - Only visible through the mask */}
                            <path
                                d={generateECGPath(1920, 100)}
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                mask="url(#ecg-mask)"
                                filter="drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                            />

                            {/* Moving Dot - Bright head of the comet */}
                            <circle r="4" fill="#60A5FA" filter="drop-shadow(0 0 8px rgba(96, 165, 250, 1))">
                                <animateMotion
                                    dur="12s"
                                    repeatCount="indefinite"
                                    path={generateECGPath(1920, 100)}
                                    calcMode="paced"
                                />
                            </circle>
                        </svg>
                    </div>

                    {/* Gradient Masks for Fade In/Out at edges */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
                </div>
            </div>

            {/* Floating Particles (Cells/Molecules) */}
            {[...Array(5)]?.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-white/5 bg-white/1 backdrop-blur-sm"
                    style={{
                        width: Math.random() * 50 + 20,
                        height: Math.random() * 50 + 20,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 50, 0],
                        rotate: [0, 360],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Hexagonal Grid Overlay - Subtle */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.03]" />
        </div>
    );
};

export default MedicalBackground;
