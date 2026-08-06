import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import configuration from "@/config/configuration";

interface BlankPrescriptionProps {
    data: {
        patient?: any;
        doctor?: any;
        date?: Date | string;
    } | null;
}

export default function BlankPrescription({ data }: BlankPrescriptionProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const logoUrl = configuration().logo || "/logo.png";
    const [logoError, setLogoError] = useState(false);

    if (!mounted) return null;

    const patient = data?.patient || null;
    const doctor = data?.doctor || null;
    const date = data?.date ? new Date(data.date) : new Date();

    const formattedDate = date ? `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}` : "__________";

    // Age calculation
    let ageStr = "____";
    if (patient?.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth);
        const ageYears = new Date().getFullYear() - dob.getFullYear();
        ageStr = `${ageYears} Y`;
    }

    const sexStr = patient?.gender ? patient.gender.charAt(0).toUpperCase() : "____";
    const patientName = patient?.name || "";
    const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "";

    return createPortal(
        <div className="print-blank-prescription hidden print:block bg-white text-black font-sans leading-relaxed overflow-visible">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body { 
            visibility: hidden !important; 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-blank-prescription { 
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-h-screen: 297mm !important;
            height: 100% !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="w-[210mm] min-h-[297mm] h-full mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none">

                {/* TOP HEADER SECTION */}
                <div className="relative flex justify-between items-stretch border-b border-slate-700 min-h-26.25">
                    {/* Top Left Dark Ribbon with Angle */}
                    <div className="w-[48%] bg-[#2d3e36] text-white pt-3 pb-3 pl-6 pr-8 flex flex-col justify-center space-y-1 relative"
                        style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}>
                        <div className="flex items-center gap-2 text-[10.5px] font-medium tracking-wide">
                            <span className="text-[#eb5757] font-bold text-xs">•</span>
                            <span>bhumi wellness</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] font-medium tracking-wide">
                            <span className="text-[#eb5757] font-bold text-xs">•</span>
                            <span>bhumi_wellness_</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] font-medium tracking-wide">
                            <span className="text-[#eb5757] font-bold text-xs">•</span>
                            <span>bhuminaturecure@gmail.com</span>
                        </div>
                    </div>

                    {/* Top Right Logo & Brand */}
                    <div className="flex items-center gap-3 pr-8 pt-3 pb-2 ml-auto">
                        {/* Configured Logo / Monogram Logo */}
                        <div className="w-13 h-13 relative flex items-center justify-center shrink-0">
                            {!logoError ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <svg viewBox="0 0 100 100" className="w-full h-full text-[#849a8c]">
                                    <path fill="currentColor" opacity="0.3" d="M50 5 C25 5, 5 25, 5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50 C95 25, 75 5, 50 5 Z M50 15 C69.3 15, 85 30.7, 85 50 C85 69.3, 69.3 85, 50 85 C30.7 85, 15 69.3, 15 50 C15 30.7, 30.7 15, 50 15 Z" />
                                    <text x="32" y="66" fontFamily="sans-serif" fontSize="42" fontWeight="300" fill="#7a9483">b</text>
                                    <text x="52" y="66" fontFamily="sans-serif" fontSize="42" fontWeight="300" fill="#7a9483">m</text>
                                    <path fill="#7a9483" d="M62 25 Q70 20 72 28 Q64 35 62 25 Z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black tracking-tight text-[#1c2923] uppercase font-serif">
                                {configuration().hospitalName || "BHUMI"}
                            </h1>
                            <p className="text-[9.5px] font-bold tracking-[0.22em] text-[#3d5248] uppercase">
                                NATURE CURE & WELLNESS
                            </p>
                        </div>
                    </div>
                </div>

                {/* PATIENT INFO STRIP */}
                <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-700 text-[12px] font-semibold text-black bg-white">
                    <div className="flex items-center gap-6 flex-1 pr-4">
                        <div className="flex items-center gap-1.5 flex-1 min-w-50">
                            <span>Name:</span>
                            <span className="font-bold text-black border-b border-dotted border-slate-400 flex-1 px-1 min-h-5">
                                {patientName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 w-24">
                            <span>Age:</span>
                            <span className="font-bold text-black border-b border-dotted border-slate-400 flex-1 text-center min-h-5">
                                {ageStr}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 w-24">
                            <span>Sex:</span>
                            <span className="font-bold text-black border-b border-dotted border-slate-400 flex-1 text-center min-h-5">
                                {sexStr}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 w-36">
                            <span>Date:</span>
                            <span className="font-bold text-black border-b border-dotted border-slate-400 flex-1 text-center min-h-5">
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* OP No Pill Box */}
                    <div className="border border-slate-600 rounded-full px-4 py-1 text-[11px] font-bold whitespace-nowrap bg-white shadow-xs">
                        <span>OP No: </span>
                        <span className="min-w-17.5 inline-block text-slate-800 tracking-wider">
                            {opNumber || "...................."}
                        </span>
                    </div>
                </div>

                {/* FULL-WIDTH MAIN PRESCRIPTION CANVAS */}
                <div className="flex-1 relative flex flex-col p-6 bg-white overflow-hidden min-h-125">

                    {/* Centered Watermark using Configured Logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                        {!logoError ? (
                            <img
                                src={logoUrl}
                                alt="Watermark"
                                className="w-[14cm] max-h-[80%] object-contain grayscale"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <svg viewBox="0 0 100 100" className="w-[14cm] h-[14cm] text-[#7a9483]">
                                <path fill="currentColor" opacity="0.3" d="M50 5 C25 5, 5 25, 5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50 C95 25, 75 5, 50 5 Z M50 15 C69.3 15, 85 30.7, 85 50 C85 69.3, 69.3 85, 50 85 C30.7 85, 15 69.3, 15 50 C15 30.7, 30.7 15, 50 15 Z" />
                                <text x="32" y="66" fontFamily="sans-serif" fontSize="42" fontWeight="300" fill="currentColor">b</text>
                                <text x="52" y="66" fontFamily="sans-serif" fontSize="42" fontWeight="300" fill="currentColor">m</text>
                                <path fill="currentColor" d="M62 25 Q70 20 72 28 Q64 35 62 25 Z" />
                            </svg>
                        )}
                    </div>

                    {/* DOCTOR SIGNATURE AT BOTTOM RIGHT */}
                    <div className="mt-auto pt-10 flex justify-end relative z-10">
                        <div className="text-right space-y-1 pr-4 min-w-50">
                            {doctor?.signature ? (
                                <img
                                    src={doctor.signature}
                                    alt="Doctor Signature"
                                    className="h-10 w-auto max-w-40 object-contain ml-auto mb-1"
                                />
                            ) : (
                                <div className="w-48 border-b-2 border-slate-700 border-dashed mb-2 ml-auto"></div>
                            )}
                            <p className="font-extrabold text-[11px] text-black uppercase tracking-wide">
                                {doctor?.name ? `DR. ${doctor.name}` : "Doctor's Signature"}
                            </p>
                            {doctor?.specialization && (
                                <p className="text-[9.5px] text-slate-700 font-semibold uppercase tracking-wider">
                                    {doctor.specialization}
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                {/* BOTTOM FOOTER SECTION */}
                <div className="relative flex justify-end items-stretch border-t border-slate-700 mt-auto min-h-18.75">
                    {/* Bottom Right Angled Ribbon */}
                    <div className="w-[62%] bg-[#2d3e36] text-white pt-2.5 pb-2.5 pr-8 pl-12 flex flex-col items-end justify-center space-y-0.5 relative"
                        style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}>
                        <p className="text-[10px] font-medium tracking-wide text-slate-100">
                            {configuration().hospitalAddress || "Old Rajana Theatre Bld, Opp. MSN Apartments, Koottanad"}
                        </p>
                        <p className="text-[10px] font-medium tracking-wide text-slate-100">
                            Booking No: <span className="font-semibold">{configuration().hospitalPhone || "8505030406"}</span>
                        </p>
                        {/* <p className="text-[10px] font-medium tracking-wide text-slate-100">
                            Online Consultation: <span className="font-semibold">6282803887</span>
                        </p> */}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
