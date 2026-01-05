import React from 'react'

export default function HospitalName() {
    return (
        <div className="flex gap-5 items-center">
            <div className="h-14 w-14 bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                S
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">SYNAPSE HOSPITAL</h1>
                <p className="text-[10px] font-bold text-slate-700 uppercase">Multi-Speciality Care & Research Institute</p>
                <div className="mt-1 text-[10px] text-slate-600 leading-tight font-medium">
                    <p>123 Medical Enclave, Health City, Bangalore - 560001</p>
                    <p className="font-bold text-slate-800">GSTIN: 29AAAAA0000A1Z5 | DL No: KA-BNG-123456 | <span className="text-black">State Code: 29</span></p>
                    <p>Tel: +91 80 4455 6677 | Email: info@synapsehms.com</p>
                </div>
            </div>
        </div>
    )
}
