import Image from 'next/image'
import React from 'react'

export default function HospitalName() {

    return (
        <div className="flex gap-5 items-center">
            <div className="h-14 w-14 flex items-center justify-center text-white text-2xl font-black relative">
                <Image src={"/print/logo.png"} alt="Logo" width={56} height={56} className='w-full h-full grayscale' loading='eager' fetchPriority='high' priority />

            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Mark Hospital</h1>
                <p className="text-[10px] font-bold text-slate-700 uppercase">Multi-Speciality Care & Research Institute</p>
                <div className="mt-1 text-[10px] text-slate-600 leading-tight font-medium">
                    <p>Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                    <p className="font-bold text-slate-800">DIGIPIN: MC9-955-6T2F | <span className="text-black">State Code: 29</span></p>
                    <p>Tel: +91 83019 26155, 04931 240077 | Email: hospitalmark@gmail.com</p>
                </div>
            </div>
        </div>
    )
}
