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

    const items = order.items || [];
    const PAGE_1_LIMIT = 13;
    const SUBSEQUENT_PAGE_LIMIT = 18;

    // Chunk items into pages
    const pages: Array<{ items: Array<any & { globalIndex: number }>; isLastPage: boolean }> = [];
    if (items.length <= PAGE_1_LIMIT) {
        pages.push({
            items: items.map((it, idx) => ({ ...it, globalIndex: idx + 1 })),
            isLastPage: true,
        });
    } else {
        // Page 1
        pages.push({
            items: items.slice(0, 14).map((it, idx) => ({ ...it, globalIndex: idx + 1 })),
            isLastPage: false,
        });

        let remaining = items.slice(14);
        let offset = 14;
        while (remaining.length > 0) {
            const isFinal = remaining.length <= SUBSEQUENT_PAGE_LIMIT;
            const takeCount = isFinal ? remaining.length : SUBSEQUENT_PAGE_LIMIT;
            const chunk = remaining.slice(0, takeCount);
            pages.push({
                items: chunk.map((it, idx) => ({ ...it, globalIndex: offset + idx + 1 })),
                isLastPage: isFinal,
            });
            offset += takeCount;
            remaining = remaining.slice(takeCount);
        }
    }

    return (
        <div className="print-prescription hidden print:block bg-white text-black font-sans leading-relaxed">
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
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          body > *:not(.print-prescription) {
            display: none !important;
          }
          .print-prescription { 
            visibility: visible !important;
            display: block !important;
            position: static !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .a4-print-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            background: white !important;
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            {pages.map((page, pageIdx) => {
                const totalPages = pages.length;
                const pageNum = pageIdx + 1;

                return (
                    <div
                        key={pageIdx}
                        className="a4-print-page w-[210mm] h-[297mm] max-h-[297mm] mx-auto flex flex-col relative z-20 bg-white border border-slate-200 print:border-none print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:p-0 overflow-hidden"
                    >
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
                        <div className="flex-1 relative flex flex-col p-6 bg-white overflow-hidden space-y-3 text-[13px]">
                            <PrescriptionWatermark />

                            {/* Prescription Type Header */}
                            <div className="flex justify-between items-center relative z-10 border-b border-slate-300 pb-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-black text-[#2d3e36] uppercase tracking-wider">
                                        {pageIdx === 0
                                            ? "PHARMACY PRESCRIPTION / DRUG ADVICE"
                                            : "PHARMACY PRESCRIPTION / DRUG ADVICE (CONTINUED)"}
                                    </h2>
                                    {totalPages > 1 && (
                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                            Page {pageNum} of {totalPages}
                                        </span>
                                    )}
                                </div>
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
                                            <th className="py-2 px-2 text-center w-10">#</th>
                                            <th className="py-2 px-2">Medicine / Strength</th>
                                            <th className="py-2 px-2 text-center">Dosage</th>
                                            <th className="py-2 px-2 text-center">Frequency</th>
                                            <th className="py-2 px-2 text-center">Duration</th>
                                            <th className="py-2 px-2 text-left">Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {page.items.map((m) => {
                                            const itemName = typeof m.name === "object" && m.name !== null ? m.name.name : String(m.name || "—");
                                            const itemGeneric = typeof m.name === "object" && m.name !== null ? (m.name.generic || "—") : "—";
                                            return (
                                                <tr key={m.globalIndex} className="even:bg-slate-50/40">
                                                    <td className="py-2 px-2 text-center font-bold text-slate-500 text-xs">{m.globalIndex}</td>
                                                    <td className="py-2 px-2 font-bold text-slate-900">
                                                        <p className="font-bold text-slate-900">{itemName}</p>
                                                        {itemGeneric !== "—" && (
                                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">(GEN: {itemGeneric})</p>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-2 text-center font-semibold text-slate-900">{m.dosage || "—"}</td>
                                                    <td className="py-2 px-2 text-center font-bold text-[#2d3e36]">{m.frequency || "—"}</td>
                                                    <td className="py-2 px-2 text-center font-semibold text-slate-900">{m.duration || "—"}</td>
                                                    <td className="py-2 px-2 text-xs font-semibold text-slate-700 italic">
                                                        {m.food || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ON LAST PAGE: ADDITIONAL INFORMATION & SIGNATURE */}
                            {page.isLastPage && (
                                <>
                                    <div className="pt-2 border-t border-slate-200 relative z-10">
                                        <p className="font-bold text-[10.5px] uppercase tracking-wider text-[#2d3e36] mb-0.5">Additional Advice:</p>
                                        <p className="text-slate-800 leading-relaxed font-medium italic text-xs">
                                            {"Patient is advised to follow the prescribed medication schedule strictly. Any adverse reactions or lack of improvement should be reported immediately. This prescription is based on current clinical assessment."}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <PrescriptionSignature
                                            doctorName={displayDoctorName}
                                            specialization={doctor?.specialization || "AUTHORIZED MEDICAL PRACTITIONER"}
                                            signature={(doctor as any)?.signature}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* BOTTOM FOOTER SECTION */}
                        <PrescriptionFooter pageNumber={pageNum} totalPages={totalPages} />
                    </div>
                );
            })}
        </div>
    );
}
