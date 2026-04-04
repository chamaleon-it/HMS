import React from 'react'

export default function LabName() {

    return (
        <div className="flex gap-3 items-center">
            <div className="shrink-0 flex items-center justify-center">
                <img src="/print/logo.png" alt="Logo" className="w-[100px] h-auto object-contain" loading="eager" fetchPriority="high" />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight">Nela Clinical Lab</h1>
                <p className="text-xs opacity-75">Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                {/* <p className="text-xs opacity-75">DIGIPIN: MC9-955-6T2F</p> */}
                <p className="text-xs opacity-75">Tel: +91 83019 26155, 04931 240077</p>
                <p className="text-xs opacity-75">Email: nelaclinilab@gmail.com</p>
            </div>
        </div>
    )
}