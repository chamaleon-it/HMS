import { fDateandTime } from "@/lib/fDateAndTime";
import { OrderType } from "../interface";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import configuration from "@/config/configuration";
import usePrintBranding from "@/hooks/usePrintBranding";
import BrandingFooter from "@/components/print/BrandingFooter";

interface PrintPrescriptionProps {
    order: OrderType | null;
}

export default function PrintPrescription({ order }: PrintPrescriptionProps) {
    const { slogan, advertisement, services } = usePrintBranding();

    if (!order) return null;

    const patient = order.patient;
    const doctor = order.doctor;
    // doctorName stored on order takes priority; fall back to populated doctor name; null = Self = "-"
    const rawDoctorName = order.doctorName || doctor?.name || null;
    const displayDoctorName = !rawDoctorName || rawDoctorName === "-" ? "-" : `DR. ${rawDoctorName}`;

    return (
        <div className="print-prescription hidden print:block bg-white text-black font-sans leading-relaxed overflow-visible">
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
          .print-prescription { 
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            padding: 0 !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `}} />

            <div className="max-w-[21cm] mx-auto min-h-screen flex flex-col">
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
                                <p className="text-xs font-semibold">{fDateandTime(order.createdAt).split(",")[0]}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="px-10 py-6 flex-1 flex flex-col gap-5 text-[13px]">
                    {/* PATIENT STRIP */}
                    <div className="grid grid-cols-4 gap-x-6 gap-y-2 border-y border-slate-300 py-3">
                        <Info label="Patient" value={patient?.name || "—"} />
                        <Info label="Age / Sex" value={`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / ${patient?.gender || "—"}`} />
                        <Info label="PID" value={patient?.mrn?.replace("MRN", "P-") || "—"} />
                        <Info label="Date" value={fDateandTime(order.createdAt).split(",")[0]} />
                        <Info label="Doctor" value={displayDoctorName} />
                        <Info label="Dept" value={displayDoctorName === "-" ? "-" : doctor?.specialization || "GENERAL MEDICINE"} />
                    </div>

                    {/* MEDICINES */}
                    <div className="flex-1">
                        <p className="mb-2 font-serif text-2xl font-bold leading-none text-black">Rx</p>
                        <table className="w-full border-collapse">
                            <thead className="border-b border-slate-400 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th className="py-2 text-center w-8">#</th>
                                    <th className="py-2 text-left">Medicine / Strength</th>
                                    <th className="py-2 text-center">Dosage</th>
                                    <th className="py-2 text-center">Frequency</th>
                                    <th className="py-2 text-center">Duration</th>
                                    <th className="py-2 text-left">Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((m, i) => (
                                    <tr key={i} className="border-b border-dotted border-slate-300 last:border-0">
                                        <td className="py-2.5 text-center text-xs font-semibold text-slate-600">{i + 1}</td>
                                        <td className="py-2.5">
                                            <p className="font-bold text-black text-[12px]">{m.name.name}</p>
                                            {m.name.generic && (
                                                <p className="text-[10px] text-slate-500 leading-none mt-0.5">{m.name.generic}</p>
                                            )}
                                        </td>
                                        <td className="py-2.5 text-center font-semibold text-black">{m.dosage || "—"}</td>
                                        <td className="py-2.5 text-center font-semibold text-black">{m.frequency || "—"}</td>
                                        <td className="py-2.5 text-center font-semibold text-black">{m.duration || "—"}</td>
                                        <td className="py-2.5 text-xs italic text-slate-700">
                                            {m.food || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ADDITIONAL INFORMATION */}
                    <div className="border-l-2 border-slate-400 pl-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Advice</p>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                            Follow the prescribed medication schedule strictly. Report any
                            adverse reaction or lack of improvement immediately.
                        </p>
                    </div>

                    {/* SIGNATURE */}
                    <div className="mt-8 flex justify-end">
                        <div className="text-center w-64">
                            <div className="border-b border-black mb-2 w-full"></div>
                            <p className="font-bold text-black uppercase leading-none">{displayDoctorName}</p>
                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">{doctor?.specialization || "SPECIALIST"}</p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-400 px-10 py-4 text-[10px] text-black flex justify-between items-end normal-case">
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
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 font-medium uppercase text-[9px] tracking-wider">{label}</span>
            <span className="font-bold text-black text-[12px] leading-tight uppercase truncate">{value}</span>
        </div>
    );
}
