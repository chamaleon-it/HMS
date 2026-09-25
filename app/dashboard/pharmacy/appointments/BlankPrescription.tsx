
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import configuration from "@/config/configuration";
import usePrintBranding from "@/hooks/usePrintBranding";
import BrandingFooter from "@/components/print/BrandingFooter";
import { doctorPrintLines } from "@/lib/doctorPrintLines";

interface BlankPrescriptionProps {
    data: {
        patient: any;
        doctor: any;
        date: Date | string;
    } | null;
}

export default function BlankPrescription({ data }: BlankPrescriptionProps) {
    const [mounted, setMounted] = useState(false);
    const { slogan, advertisement, services } = usePrintBranding();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!data || !mounted) return null;

    const { patient, doctor, date } = data;

    return createPortal(
        <div className="print-blank-prescription hidden print:block bg-white text-black font-sans leading-relaxed overflow-visible">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: A4;
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
            width: 100% !important;
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

            <div className="max-w-[21cm] mx-auto min-h-screen flex flex-col relative z-20 bg-white">
                {/* HEADER */}
                <div className="bg-white text-black border-b border-slate-400 px-10 pt-8 pb-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <HospitalName />
                            {slogan && (
                                <p className="mt-1 text-[11px] italic text-slate-600">{slogan}</p>
                            )}
                        </div>
                        <div className="text-right space-y-2">
                            <span className="inline-block border border-black px-4 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase">
                                Prescription
                            </span>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">{fDateandTime(date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-5 flex-1 flex flex-col gap-4 text-[12px]">
                    {/* PATIENT STRIP - Single Row */}
                    <div className="border-y border-slate-300 px-1 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex-1 min-w-0">
                            <Info label="Patient" value={patient?.name || "—"} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Age/G" value={`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"}/${patient?.gender?.[0] || "—"}`} />
                        </div>
                        <div className="shrink-0">
                            <Info label="PID" value={patient?.mrn?.replace("MRN", "P-") || "—"} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Doctor" value={doctorPrintLines(doctor).name} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Designation" value={doctorPrintLines(doctor).designation} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Qualification" value={doctorPrintLines(doctor).qualification} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Specialization" value={doctorPrintLines(doctor).specialization} />
                        </div>
                    </div>

                    {/* EMPTY SPACE for writing */}
                    <div className="flex-1 border border-slate-300 rounded-lg relative min-h-[500px] overflow-hidden">
                        <p className="absolute left-4 top-3 font-serif text-2xl font-bold leading-none text-black">Rx</p>

                        {/* Parameters at top right */}
                        <div className="absolute top-0 right-0 w-48 border-l border-b border-slate-300 p-4 bg-white rounded-bl-lg">
                            <div className="space-y-4 text-black font-bold text-[10px] uppercase">
                                <div className="flex items-end gap-2">
                                    <span className="w-12">Weight</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="w-12">BP</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="w-12">Temp</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="w-12">SPO2</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="w-12">GRBS</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="w-12">PR</span>
                                    <div className="flex-1 border-b border-slate-400 border-dotted h-3"></div>
                                </div>
                            </div>
                        </div>

                       
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-400 px-10 py-3 text-[10px] text-black flex justify-between items-end normal-case mt-auto">
                    <div className="space-y-1">
                        <p className="font-semibold">This prescription is valid only if signed by registered medical practitioner</p>
                        <p>
                            For Appointments / Booking: <span className="font-bold">{configuration().hospitalPhone} · {configuration().hospitalEmail}</span>
                        </p>
                        <BrandingFooter services={services} advertisement={advertisement} />
                    </div>
                    <p>
                        Powered by <span className="font-bold tracking-tight uppercase">Caresoft Innovations LLP</span>
                    </p>
                </div>
            </div>

            <Watermark />
        </div>,
        document.body
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-1.5 min-h-5 items-center">
            <span className="text-black font-medium uppercase text-[9px] mt-0.5">{label}:</span>
            <span className="font-bold text-black leading-tight uppercase truncate">{value}</span>
        </div>
    );
}
