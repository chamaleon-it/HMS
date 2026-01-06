import Image from 'next/image'
import React from 'react'

export default function HospitalName() {

    return (
        <div className="flex gap-1.5 items-center">
            <div className="flex items-center justify-center mt-2">
                <Image src={"/print/logo-white.png"} alt="Logo" width={90} height={90} className='w-full h-full' loading='eager' fetchPriority='high' priority />
            </div>
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold tracking-tight">Mark Hospital</h1>
                <p className="text-xs opacity-75">Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                <p className="text-xs opacity-75">DIGIPIN: MC9-955-6T2F</p>
                <p className="text-xs opacity-75">Tel: +91 83019 26155, 04931 240077</p>
                <p className="text-xs opacity-75">Email: hospitalmark@gmail.com</p>
            </div>
        </div>
    )
}
