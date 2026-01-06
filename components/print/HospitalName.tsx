import Image from 'next/image'
import React from 'react'

export default function HospitalName() {

    return (
        <div className="flex gap-3 items-center">
            <div className="h-full flex justify-center items-center">
                <Image src={"/print/logo-white.png"} alt="Logo" width={100} height={100} className='w-[100px] h-[100px] mt-3' loading='eager' fetchPriority='high' priority />
            </div>
            <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight">Mark Hospital</h1>
                <p className="text-xs opacity-75">Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                <p className="text-xs opacity-75">DIGIPIN: MC9-955-6T2F</p>
                <p className="text-xs opacity-75">Tel: +91 83019 26155, 04931 240077</p>
                <p className="text-xs opacity-75">Email: hospitalmark@gmail.com</p>
            </div>
        </div>
    )
}
