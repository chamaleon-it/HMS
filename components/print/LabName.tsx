import React from 'react'
import configuration from '@/config/configuration'
export default function LabName() {

    return (
        <div className="flex gap-3 items-center">
            <div className="shrink-0 flex items-center justify-center">
                <img src={configuration().logo} alt="Logo" className="w-[100px] h-auto object-contain" loading="eager" fetchPriority="high" />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight">{configuration().hospitalName}</h1>
                <p className="text-xs opacity-75">{configuration().hospitalAddress}</p>
                {/* <p className="text-xs opacity-75">DIGIPIN: MC9-955-6T2F</p> */}
                <p className="text-xs opacity-75">Tel: {configuration().hospitalPhone}</p>
                {/* <p className="text-xs opacity-75">Email: {configuration().hospitalEmail}</p> */}
            </div>
        </div>
    )
}