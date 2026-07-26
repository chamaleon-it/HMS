import React, { useState } from 'react'
import configuration from '@/config/configuration'

export default function HospitalName() {
    const [logoSrc, setLogoSrc] = useState(configuration().logo || "/print/logo.png");

    return (
        <div className="flex gap-3.5 items-center">
            <div className="shrink-0 flex items-center justify-center">
                <img 
                  src={logoSrc} 
                  alt="Hospital Logo" 
                  className="w-[90px] h-auto object-contain"
                  onError={() => {
                    if (logoSrc !== "/logo.png") setLogoSrc("/logo.png");
                  }} 
                />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{configuration().hospitalName}</h1>
                <p className="text-xs text-slate-600 opacity-90">{configuration().hospitalAddress}</p>
                <p className="text-xs text-slate-600 opacity-90 font-medium">Tel: {configuration().hospitalPhone}</p>
            </div>
        </div>
    )
}
