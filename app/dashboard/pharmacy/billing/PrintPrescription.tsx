import { fDateandTime } from "@/lib/fDateAndTime";
import { OrderType } from "../interface";

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
            margin: 0.5cm;
            size: A4;
          }
          body { 
            visibility: hidden !important; 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Inter', 'Roboto', 'Arial', sans-serif !important;
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

            <div className="max-w-[21cm] mx-auto min-h-screen p-8 flex flex-col text-[12px] text-slate-900">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
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
                                <p>Tel: +91 80 4455 6677 | Email: pharmacy@synapsehospital.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right border-l-2 pl-6 border-slate-200">

                        <div className="text-[10px] font-bold text-slate-700 space-y-0.5">
                            <p>Date: {fDateandTime(new Date()).split(",")[0]}</p>
                            <p>Time: {fDateandTime(new Date()).split(",")[1]}</p>
                        </div>
                    </div>
                </div>

                {/* Patient & Prescription Details */}
                <div className="grid grid-cols-12 gap-y-2 mb-4 border-b border-slate-300 pb-4">
                    <div className="col-span-6 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-24">Patient ID</span>
                        <span className="font-bold">: {order.mrn}</span>

                    </div>
                    <div className="col-span-6 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-40">Prescribed Date & Time</span>
                        <span className="font-medium">: {fDateandTime(order.createdAt).split(",")[0]} {fDateandTime(order.createdAt).split(",")[1]}</span>
                    </div>

                    <div className="col-span-12 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-24">Patient Name</span>
                        <span className="font-bold">: {patient?.name}</span>
                    </div>

                    <div className="col-span-6 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-24">Age/Gender</span>
                        <span className="font-medium">: {patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / {patient?.gender || "—"}</span>
                    </div>
                    <div className="col-span-6 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-40">Department</span>
                        <span className="font-medium">: General Op</span>
                    </div>

                    <div className="col-span-12 flex items-baseline gap-2">
                        <span className="text-[11px] font-bold uppercase w-24">Doctor</span>
                        <span className="font-medium">: Dr. {doctor?.name || "—"}</span>
                    </div>

                </div>

                {/* Medicines Section */}
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-sm font-bold border-b-2 border-slate-900 pb-0.5">Medicines Issued</h3>
                        <span className="text-[11px] font-bold">Issue No: PHR/{order._id.slice(-3)}</span>
                    </div>

                    <table className="w-full text-left border-collapse border-b border-slate-900">
                        <thead className="border-y border-slate-900">
                            <tr>
                                <th className="py-2 text-[10px] font-black uppercase w-8">Sl</th>
                                <th className="py-2 text-[10px] font-black uppercase">Drug & Strength</th>
                                <th className="py-2 text-[10px] font-black uppercase text-center">Dosage</th>
                                <th className="py-2 text-[10px] font-black uppercase text-center">Frequency</th>
                                <th className="py-2 text-[10px] font-black uppercase text-center">Duration</th>
                                <th className="py-2 text-[10px] font-black uppercase">Instruction</th>
                                <th className="py-2 text-[10px] font-black uppercase text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index} className="border-b border-slate-200 align-top">
                                    <td className="py-3 text-[11px]">{index + 1}.</td>
                                    <td className="py-3 pr-2">
                                        <div className="text-xs font-bold leading-tight uppercase underline underline-offset-2 decoration-slate-400">
                                            {item.name.name}
                                        </div>
                                    </td>
                                    <td className="py-3 text-center text-[11px] font-medium whitespace-nowrap">{item.dosage || "—"}</td>
                                    <td className="py-3 text-center text-[10px] font-medium">
                                        {item.frequency || "—"}<br />

                                    </td>
                                    <td className="py-3 text-center text-[11px] font-medium whitespace-nowrap">
                                        {item.duration || "—"}<br />
                                    </td>
                                    <td className="py-3 text-[10px] font-medium text-slate-600">
                                        {item.food || "—"}
                                    </td>
                                    <td className="py-3 text-right text-[11px] font-bold whitespace-nowrap">
                                        {item.quantity} Nos
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-6">
                        <div className="text-[10px] font-bold uppercase mb-4 text-slate-400">Additional Information</div>
                        <div className="min-h-[100px] border border-slate-100 bg-slate-50/30 rounded p-4">
                            {/* Space for notes or additional info */}
                        </div>
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="mt-auto pt-12">
                    <div className="flex justify-between items-end">
                        <div className="text-center w-48">
                            <div className="h-0.5 bg-slate-900/50 w-full mb-2"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-500">Dispensed By</p>
                        </div>
                        <div className="text-center w-64">
                            <p className="text-[8px] italic text-slate-400 mb-2">System generated on {fDateandTime(new Date())}</p>
                            <div className="h-1 bg-slate-900 w-full mb-2"></div>
                            <p className="text-[11px] font-black uppercase tracking-tighter">Authorized Pharmacist</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 underline decoration-slate-200 underline-offset-2">Synapse Hospital</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
