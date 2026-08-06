import React, { useState } from 'react'
import configuration from '@/config/configuration'
import { cn } from '@/lib/utils'

interface HospitalNameProps {
    className?: string;
    textClassName?: string;
    subTextClassName?: string;
    dark?: boolean;
}

export default function HospitalName({ className, textClassName, subTextClassName, dark }: HospitalNameProps) {
    const [logoSrc, setLogoSrc] = useState(configuration().logo || "/print/logo.png");

    return (
        <div className={cn("flex gap-3.5 items-center", className)}>
            <div className="shrink-0 flex items-center justify-center">
                <img
                    src={logoSrc}
                    alt="Hospital Logo"
                    className="w-16 h-16 object-contain"
                    onError={() => {
                        if (logoSrc !== "/logo.png" && logoSrc !== "/print/logo.png") {
                            setLogoSrc("/print/logo.png");
                        }
                    }}
                />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className={cn("text-xl font-bold tracking-tight", dark ? "text-white" : (textClassName || "text-slate-900"))}>
                    {configuration().hospitalName}
                </h1>
                <p className={cn("text-xs opacity-90", dark ? "text-white/90" : (subTextClassName || "text-slate-600"))}>
                    {configuration().hospitalAddress}
                </p>
                <p className={cn("text-xs font-medium opacity-90", dark ? "text-white/90" : (subTextClassName || "text-slate-600"))}>
                    Tel: {configuration().hospitalPhone}
                </p>
            </div>
        </div>
    )
}
