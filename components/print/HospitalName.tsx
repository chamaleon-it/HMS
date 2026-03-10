import configuration from '@/config/configuration'
import React from 'react'

export default function HospitalName() {

    return (
        <div className="flex gap-3 items-center">
            <div className="h-full flex justify-center items-center">
                <img src={"/print/logo.png"} alt="Logo" width={100} height={80} className='w-[75px] h-[60px]' />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight">{configuration().hospitalName}</h1>
                <p className="text-xs opacity-75">{configuration().hospitalAddress}</p>
                {/* <p className="text-xs opacity-75">DIGIPIN: {configuration().hospitalDigiPin}</p> */}
                <p className="text-xs opacity-75">Tel: {configuration().hospitalPhone}</p>
                {/* <p className="text-xs opacity-75">Email: {configuration().hospitalEmail}</p> */}
            </div>
        </div>
    )
}
