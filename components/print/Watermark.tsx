import React from 'react'

const logo = "/print/logo.png";

export default function Watermark() {
    return (
        <div className="fixed inset-0 flex z-50 items-center justify-center pointer-events-none opacity-[0.1] hidden print:flex grayscale" style={{ zIndex: 100 }}>
            <img src={logo} alt="watermark" className="w-[12cm]" />
        </div>
    )
}
