import React from 'react'

interface DoctorHeaderProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
}

export default function DoctorHeader({ title, subtitle, children }: DoctorHeaderProps) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold leading-tight text-slate-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end justify-center text-right gap-3">
                {children && (
                    <div className="flex flex-wrap items-center gap-3">
                        {children}
                    </div>
                )}
            </div>
        </header>
    )
}
