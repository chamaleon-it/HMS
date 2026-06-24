import React from 'react'

import configuration from '@/config/configuration';

export default function Watermark() {
    const logo = configuration().logo;
    return (
        <div className="fixed inset-0  items-center justify-center pointer-events-none opacity-[0.1] hidden print:flex grayscale" style={{ zIndex: 100 }}>
            <img src={logo} alt="watermark" className="w-[12cm]" loading='eager' fetchPriority='high' />
        </div>
    )
}
