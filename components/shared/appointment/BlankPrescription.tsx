import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
    PrescriptionHeader,
    PrescriptionPatientStrip,
    PrescriptionWatermark,
    PrescriptionSignature,
    PrescriptionFooter,
} from "@/components/print/PrescriptionHeader";

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
        <div className="print-blank-prescription hidden print:block bg-white text-black font-sans leading-relaxed overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body { 
            margin: 0 !important;
            padding: 0 !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > *:not(.print-blank-prescription) {
            display: none !important;
          }
          .print-blank-prescription { 
            visibility: visible !important;
            display: flex !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            flex-direction: column !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden">
                {/* TOP HEADER SECTION */}
                <PrescriptionHeader />

                {/* PATIENT INFO STRIP */}
                <PrescriptionPatientStrip
                    name={patientName}
                    age={ageStr}
                    sex={sexStr}
                    date={formattedDate}
                    opNo={opNumber}
                />

                {/* FULL-WIDTH MAIN PRESCRIPTION CANVAS */}
                <div className="flex-1 relative flex flex-col p-8 bg-white overflow-hidden">
                    <PrescriptionWatermark />

                    {/* DOCTOR SIGNATURE AT BOTTOM RIGHT */}
                    <div className="mt-auto pt-6">
                        <PrescriptionSignature
                            doctorName={doctor?.name}
                            specialization={doctor?.specialization}
                            signature={doctor?.signature}
                        />
                    </div>
                </div>

                {/* BOTTOM FOOTER SECTION */}
                <PrescriptionFooter />
            </div>
        </div>,
        document.body
    );
}
