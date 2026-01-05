import Image from 'next/image'
import React from 'react'

export default function HospitalName() {

    return (
        <div className="flex gap-5 items-center">
            <div className="size-[100px] flex items-center justify-center text-white text-2xl font-black relative">
                <Image src={"/print/logo.png"} alt="Logo" width={100} height={100} className='w-full h-full' loading='eager' fetchPriority='high' priority />

            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mark Hospital</h1>
                <p className="text-xs opacity-75 mt-1">Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                <p className="text-xs opacity-75 mt-1">DIGIPIN: MC9-955-6T2F</p>
                <p className="text-xs opacity-75 mt-1">Tel: +91 83019 26155, 04931 240077 , Email: hospitalmark@gmail.com</p>
            </div>
        </div>
    )
}
