
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface BlankPrescriptionProps {
    data: {
        patient: any;
        doctor: any;
        date: Date | string;
    } | null;
}

export default function BlankPrescription({ data }: BlankPrescriptionProps) {
    const [mounted, setMounted] = useState(false);

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
                <div className="bg-white text-black border-b border-slate-500 px-10 py-8">
                    <div className="flex justify-between items-start">
                        <HospitalName />
                        <div className="text-right space-y-2">
                            <span className="inline-block bg-black text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase hover:bg-slate-800 transition-colors">
                                PRESCRIPTION
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
                    <div className="border border-slate-500 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-slate-50/50">
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
                            <Info label="Doctor" value={doctor?.name ? `DR. ${doctor.name}` : "—"} />
                        </div>
                        <div className="shrink-0">
                            <Info label="Dept" value={doctor?.specialization || "ENT"} />
                        </div>
                    </div>

                    {/* EMPTY SPACE for writing */}
                    <div className="flex-1 border border-slate-500 rounded-lg bg-slate-50/5 text-slate-100 flex flex-col items-center justify-center min-h-[500px]">
                        <p className="text-4xl font-black opacity-10 uppercase tracking-[1em]">Rx Prescription</p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-slate-50 border-t border-slate-500 px-10 py-3 text-[10px] text-black flex justify-between items-center normal-case mt-auto">
                    <div className="space-y-1">
                        <p className="text-black font-bold">This prescription is valid only if signed by registered medical practitioner</p>
                        <p className="text-black font-medium">
                            For Appointments / Booking: <span className="text-black font-bold">+91 83019 26155 · 04931 240077 · hospitalmark@gmail.com</span>
                        </p>
                    </div>
                    <p className="text-black font-medium">
                        Powered by <span className="font-bold text-black tracking-tight uppercase">Caresoft Innovations LLP</span>
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
