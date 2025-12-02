import React from 'react';
import { motion } from 'framer-motion';

const ScannerCard = ({ children, className = "" }) => {
    return (
        <div className={`relative overflow-hidden group ${className}`}>
            {children}

            {/* Scanner Line */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-[#3B82F6]/20 to-transparent -translate-y-full group-hover:animate-scan" />
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#3B82F6]/0 group-hover:border-[#3B82F6]/50 transition-colors duration-300" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#3B82F6]/0 group-hover:border-[#3B82F6]/50 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#3B82F6]/0 group-hover:border-[#3B82F6]/50 transition-colors duration-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#3B82F6]/0 group-hover:border-[#3B82F6]/50 transition-colors duration-300" />
        </div>
    );
};

export default ScannerCard;
