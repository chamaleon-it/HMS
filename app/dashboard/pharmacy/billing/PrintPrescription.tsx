import { fDateandTime } from "@/lib/fDateAndTime";
import { OrderType } from "../interface";
import {
    PrescriptionHeader,
    PrescriptionPatientStrip,
    PrescriptionWatermark,
    PrescriptionSignature,
    PrescriptionFooter,
} from "@/components/print/PrescriptionHeader";

interface PrintPrescriptionProps {
    order: OrderType | null;
}

export default function PrintPrescription({ order }: PrintPrescriptionProps) {
    if (!order) return null;

    const patient = order.patient;
    const doctor = order.doctor;
    // doctorName stored on order takes priority; fall back to populated doctor name; null = Self = "-"
    const rawDoctorName = (order.doctorName && order.doctorName !== "-" && order.doctorName !== "")
        ? order.doctorName
        : doctor?.name || null;
    const displayDoctorName = !rawDoctorName || rawDoctorName === "-" ? "-" : `DR. ${rawDoctorName}`;

    const dObj = new Date(order.createdAt || new Date());
    const formattedDate = !isNaN(dObj.getTime())
        ? `${dObj.getDate().toString().padStart(2, "0")}/${(dObj.getMonth() + 1).toString().padStart(2, "0")}/${dObj.getFullYear()}`
        : "__________";
    let ageStr = "____";
    if (patient?.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth);
        const ageYears = new Date().getFullYear() - dob.getFullYear();
        ageStr = `${ageYears} Y`;
    }
    const sexStr = patient?.gender ? patient.gender.charAt(0).toUpperCase() : "____";
    const opNumber = patient?.mrn ? patient.mrn.replace("MRN", "P-") : "";

    return (
        <div className="print-prescription hidden print:block bg-white text-black font-sans leading-relaxed overflow-hidden">
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
          body > *:not(.print-prescription) {
            display: none !important;
          }
          .print-prescription { 
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
                    name={patient?.name || ""}
                    age={ageStr}
                    sex={sexStr}
                    date={formattedDate}
                    opNo={opNumber}
                />

                {/* MAIN BODY */}
                <div className="flex-1 relative flex flex-col p-6 bg-white overflow-hidden min-h-125 space-y-4 text-[13px]">
                    <PrescriptionWatermark />

                    {/* Prescription Type Header */}
                    <div className="flex justify-between items-center relative z-10 border-b border-slate-300 pb-2">
                        <h2 className="text-sm font-black text-[#2d3e36] uppercase tracking-wider">
                            PHARMACY PRESCRIPTION / DRUG ADVICE
                        </h2>
                        {doctor?.specialization && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Dept: {doctor.specialization}
                            </span>
                        )}
                    </div>

                    {/* MEDICINES TABLE */}
                    <div className="break-inside-avoid relative z-10 space-y-1">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-[#2d3e36] text-[10.5px] font-bold text-slate-700 uppercase tracking-wider text-left bg-slate-50">
                                    <th className="py-2.5 px-2 text-center w-10">#</th>
                                    <th className="py-2.5 px-2">Medicine / Strength</th>
                                    <th className="py-2.5 px-2 text-center">Dosage</th>
                                    <th className="py-2.5 px-2 text-center">Frequency</th>
                                    <th className="py-2.5 px-2 text-center">Duration</th>
                                    <th className="py-2.5 px-2 text-left">Instructions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {order.items.map((m, i) => {
                                    const itemName = typeof m.name === "object" && m.name !== null ? m.name.name : String(m.name || "—");
                                    const itemGeneric = typeof m.name === "object" && m.name !== null ? (m.name.generic || "—") : "—";
                                    return (
                                        <tr key={i} className="even:bg-slate-50/40">
                                            <td className="py-2.5 px-2 text-center font-bold text-slate-500 text-xs">{i + 1}</td>
                                            <td className="py-2.5 px-2 font-bold text-slate-900">
                                                <p className="font-bold text-slate-900">{itemName}</p>
                                                {itemGeneric !== "—" && (
                                                    <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">(GEN: {itemGeneric})</p>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-2 text-center font-semibold text-slate-900">{m.dosage || "—"}</td>
                                            <td className="py-2.5 px-2 text-center font-bold text-[#2d3e36]">{m.frequency || "—"}</td>
                                            <td className="py-2.5 px-2 text-center font-semibold text-slate-900">{m.duration || "—"}</td>
                                            <td className="py-2.5 px-2 text-xs font-semibold text-slate-700 italic">
                                                {m.food || "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ADDITIONAL INFORMATION */}
                    <div className="pt-2 border-t border-slate-200 relative z-10">
                        <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#2d3e36] mb-0.5">Additional Advice:</p>
                        <p className="text-slate-800 leading-relaxed font-medium italic text-xs">
                            {"Patient is advised to follow the prescribed medication schedule strictly. Any adverse reactions or lack of improvement should be reported immediately. This prescription is based on current clinical assessment."}
                        </p>
                    </div>

                    {/* SIGNATURE */}
                    <PrescriptionSignature
                        doctorName={displayDoctorName}
                        specialization={doctor?.specialization || "AUTHORIZED MEDICAL PRACTITIONER"}
                        signature={(doctor as any)?.signature}
                    />
                </div>

                {/* BOTTOM FOOTER SECTION */}
                <PrescriptionFooter />
            </div>
        </div>
    );
}
