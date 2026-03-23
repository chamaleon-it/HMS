import { fDateandTime } from "@/lib/fDateAndTime";
import { OrderType } from "../interface";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";

interface PrintPrescriptionProps {
    order: OrderType | null;
}

export default function PrintPrescription({ order }: PrintPrescriptionProps) {
    if (!order) return null;

    const patient = order.patient;
    const doctor = order.doctor;

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
                <div className="bg-white text-black border-b border-slate-200 px-10 py-8">
                    <div className="flex justify-between items-start">
                        <HospitalName />
                        <div className="text-right space-y-2">
                            <span className="inline-block bg-black text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase hover:bg-slate-800 transition-colors">
                                PRESCRIPTION
                            </span>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">{fDateandTime(new Date()).split(",")[0]}</p>
                                <p className="text-[10px] text-black tracking-widest font-semibold">DRUG ADVICE PAGE</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-10 flex-1 flex flex-col gap-6 text-[13px]">
                    {/* PATIENT STRIP */}
                    <div className="border border-slate-200 rounded-lg px-6 py-4 grid grid-cols-4 gap-x-8 gap-y-2 bg-slate-50/50">
                        <Info label="Patient" value={patient?.name || "—"} />
                        <Info label="Age / G" value={`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / ${patient?.gender || "—"}`} />
                        <Info label="PID" value={patient?.mrn?.replace("MRN", "P-") || "—"} />
                        <Info label="Date" value={fDateandTime(order.createdAt).split(",")[0]} />
                        <div className="col-span-2">
                            <Info label="Doctor" value={`DR. ${doctor?.name || "—"}`} />
                        </div>
                        <div className="col-span-2 text-right">
                            <Info label="Dept" value={doctor?.specialization || "ENT"} />
                        </div>
                    </div>

                    {/* MEDICINES */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 box-border">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 text-[11px] font-bold text-black border-b border-slate-200 uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 text-center w-10">SL</th>
                                    <th className="px-3 py-3 text-left">Medicine / Strength</th>
                                    <th className="px-3 py-3 text-center">Dosage</th>
                                    <th className="px-3 py-3 text-center">Frequency</th>
                                    <th className="px-3 py-3 text-center">Duration</th>
                                    <th className="px-3 py-3 text-left">Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((m, i) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                        <td className="px-3 py-3 text-center font-bold text-black text-xs">{i + 1}</td>
                                        <td className="px-3 py-3">
                                            <p className="font-black text-black text-[12px]">{m.name.name}</p>
                                            <p className="text-[10px] text-black font-medium tracking-tight mt-0.5">(GEN: {m.name.generic || "—"})</p>
                                        </td>
                                        <td className="px-3 py-3 text-center font-bold text-black">{m.dosage || "—"}</td>
                                        <td className="px-3 py-3 text-center font-bold text-black">{m.frequency || "—"}</td>
                                        <td className="px-3 py-3 text-center font-bold text-black">{m.duration || "—"}</td>
                                        <td className="px-3 py-3 text-xs font-semibold text-black italic">
                                            {m.food || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ADDITIONAL INFORMATION */}
                    <div className="border-2 border-black rounded-lg p-5 bg-slate-50">
                        <p className="font-black text-[10px] uppercase tracking-widest text-black mb-2">Additional Advice</p>
                        <p className="text-black leading-relaxed font-bold italic text-[11px]">
                            {"Patient is advised to follow the prescribed medication schedule strictly. Any adverse reactions or lack of improvement should be reported immediately. This prescription is based on current clinical assessment."}
                        </p>
                    </div>

                    {/* SIGNATURE */}
                    <div className="mt-10 flex justify-end">
                        <div className="text-center w-64">
                            <div className="border-b-2 border-black mb-2 w-full"></div>
                            <p className="font-black text-black uppercase leading-none tracking-tighter">DR. {doctor?.name || "—"}</p>
                            <p className="text-[10px] font-bold text-black mt-1 uppercase tracking-widest">{doctor?.specialization || "SPECIALIST"}</p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-slate-50 border-t border-slate-200 px-10 py-6 text-[10px] text-black flex justify-between items-center normal-case">
                    <div className="space-y-1">
                        <p className="text-black font-bold">This prescription is valid only if signed by registered medical practitioner</p>
                        <p className="text-black font-medium">
                            For Appointments / Booking: <span className="text-black font-bold">+91 83019 26155 · 04931 240077 · hospitalmark@gmail.com</span>
                        </p>
                    </div>
                    <p className="text-black font-medium">
                        Powered by <span className="font-bold text-black tracking-tight uppercase">Synapse IT Services LLP</span>
                    </p>
                </div>
            </div>
            <Watermark />
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 min-h-6 items-start">
            <span className="text-black font-medium uppercase text-[10px] min-w-[50px] mt-0.5">{label}:</span>
            <span className="font-bold text-black line-clamp-2 leading-tight uppercase">{value}</span>
        </div>
    );
}
