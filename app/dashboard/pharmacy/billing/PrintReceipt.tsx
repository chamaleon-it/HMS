import React from "react";
import { formatINR } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";

interface PrintReceiptProps {
    payload: {
        patient: string;
        items: {
            name: string;
            quantity: number;
            unitPrice: number;
            gst: number;
            total: number;
        }[];
        cash: number;
        online: number;
        insurance: number;
        discount: number;
        doctor?: string;
        department?: string;
        note?: string;
    };
    patient: {
        name: string;
        mrn?: string;
        phoneNumber?: string;
        gender?: string;
        dateOfBirth?: string | Date;
        address?: string;
    } | null;
    invoiceDetails: {
        prefix: string;
        roundOffAmount: number;
        subtotal: number;
        totalGst: number;
        grandTotal: number;
    };
}

export default function PrintReceipt({
    payload,
    patient,
    invoiceDetails,
}: PrintReceiptProps) {

    if (!patient) return null;

    const invoiceNo = `${invoiceDetails.prefix}-${new Date().getTime().toString().slice(-6)}`;
    const paymentMethod = payload.insurance ? "Insurance" : payload.online ? "Online" : "Cash";

    return (
        <div className="print-receipt hidden print:block bg-white text-black font-sans leading-relaxed overflow-visible">
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
            font-family: 'Inter', 'Roboto', 'Arial', sans-serif !important;
          }
          .print-receipt { 
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

            <div className="max-w-[21cm] mx-auto min-h-screen p-[1.5cm] flex flex-col text-[10.5px]">
                {/* Formal Header */}
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
                        <h2 className="text-lg font-black text-slate-900 uppercase mb-1 tracking-tighter">CASH RECEIPT</h2>
                        <div className="text-[10px] font-bold text-slate-700 space-y-0.5">
                            <p>Invoice No: <span className="text-black font-black">{invoiceNo}</span></p>
                            <p>Date: {fDateandTime(new Date()).split(",")[0]}</p>
                            <p>Time: {fDateandTime(new Date()).split(",")[1]}</p>
                        </div>
                    </div>
                </div>

                {/* Patient Information Section */}
                <div className="mb-6 bg-slate-50 p-4 border border-slate-200">
                    <h3 className="text-[9.5px] font-black uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1 flex justify-between">
                        <span>Patient & Billing Information</span>
                        <span className="text-slate-900">Bill Type: {paymentMethod} / OP Pharmacy</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-y-3 gap-x-8">
                        <div className="col-span-2">
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Patient Name</p>
                            <p className="text-[13px] font-black text-slate-900 uppercase leading-none tracking-tight">{patient.name}</p>
                        </div>
                        <div>
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">MRN Number</p>
                            <p className="text-[11px] font-black text-slate-900">{patient.mrn || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Patient ID</p>
                            <p className="text-[11px] font-black text-slate-900">{patient.mrn?.replace("MRN", "PID") || "—"}</p>
                        </div>

                        <div>
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Age / Gender</p>
                            <p className="text-[11px] font-bold text-slate-800">{patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / {patient.gender || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Phone</p>
                            <p className="text-[11px] font-bold text-slate-800">{patient.phoneNumber || "—"}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Payment Mode</p>
                            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">{paymentMethod}</p>
                        </div>

                        {patient.address && (
                            <div className="col-span-4 mt-0.5">
                                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">Address</p>
                                <p className="text-[10px] font-medium text-slate-600 italic leading-tight">{patient.address}</p>
                            </div>
                        )}

                        <div className="col-span-4 mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-slate-400">Prescribed By:</span>
                            <span className="text-[11px] font-black text-slate-800 uppercase">Dr. {payload.doctor || "—"}</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-[9px] font-black uppercase text-slate-400">Dept:</span>
                            <span className="text-[11px] font-black text-slate-800 uppercase">{payload.department || "—"}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-visible">
                    <table className="w-full border-collapse border border-slate-900 overflow-visible">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className="border border-slate-900 py-2 px-2 text-left text-[9.5px] uppercase font-black">Sl</th>
                                <th className="border border-slate-900 py-2 px-3 text-left text-[9.5px] uppercase font-black w-1/3">Description</th>
                                <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">Batch</th>
                                <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">Exp</th>
                                <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">HSN</th>
                                <th className="border border-slate-900 py-2 px-2 text-right text-[9.5px] uppercase font-black">Qty</th>
                                <th className="border border-slate-900 py-2 px-3 text-right text-[9.5px] uppercase font-black">Rate</th>
                                <th className="border border-slate-900 py-2 px-2 text-right text-[9.5px] uppercase font-black">GST</th>
                                <th className="border border-slate-900 py-2 px-3 text-right text-[9.5px] uppercase font-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payload.items.map((item, index) => (
                                <tr key={index} className="h-8">
                                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-400">{index + 1}</td>
                                    <td className="border border-slate-300 py-1 px-3 text-[11px] font-black uppercase text-slate-900 leading-tight">
                                        {item.name}
                                    </td>
                                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-600">B-7721</td>
                                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-600">12/26</td>
                                    <td className="border border-slate-300 py-1 px-2 text-[9px] text-slate-500 text-center uppercase">3004</td>
                                    <td className="border border-slate-300 py-1 px-2 text-[11px] text-right font-black tabular-nums">{item.quantity}</td>
                                    <td className="border border-slate-300 py-1 px-3 text-[11px] text-right tabular-nums font-bold italic">{formatINR(item.unitPrice)}</td>
                                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-slate-600 text-right tabular-nums font-bold">{item.gst}%</td>
                                    <td className="border border-slate-300 py-1 px-3 text-[11px] font-black text-right tabular-nums text-slate-900">
                                        {formatINR(item.total)}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty rows to push totals down */}
                            {Array.from({ length: Math.max(0, 5 - payload.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="h-8">
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                    <td className="border border-slate-200"></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-black">
                                <td colSpan={8} className="border border-slate-900 py-2.5 px-4 text-right text-[11px] uppercase tracking-widest text-slate-600">Invoice Total (Inclusive of all taxes)</td>
                                <td className="border border-slate-900 py-2.5 px-4 text-right text-[13px] tabular-nums font-black underline decoration-2 underline-offset-2">
                                    {formatINR(payload.items.reduce((a, b) => a + b.total, 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Calculation & Terms */}
                <div className="mt-6 flex justify-between items-start gap-12 border-t border-slate-100 pt-6">
                    <div className="flex-1">
                        <div className="text-[10px] uppercase font-black text-slate-900 mb-2 border-b-2 border-slate-900 inline-block">Terms & Conditions</div>
                        <ul className="text-[9.5px] text-slate-700 space-y-1 font-medium list-disc ml-4">
                            <li>Invoice once generated cannot be cancelled or modified.</li>
                            <li className="font-bold text-slate-900">Please check the medicines before leaving the pharmacy (Return within 24H with original invoice & intact strip).</li>
                            <li>Refrigerated items will not be accepted for return.</li>
                        </ul>
                        {payload.note && (
                            <div className="mt-4 p-3 border border-slate-200 bg-slate-50 text-left">
                                <p className="text-[8.5px] font-black text-slate-400 uppercase leading-none mb-1">Pharmacist Note</p>
                                <p className="text-xs text-slate-800 italic font-bold">"{payload.note}"</p>
                            </div>
                        )}
                    </div>

                    <div className="w-72 border-2 border-slate-900 p-4 bg-slate-50">
                        <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                                <span>Gross Amount</span>
                                <span className="text-slate-900 tabular-nums">{formatINR(invoiceDetails.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                                <span>CGST/SGST Total</span>
                                <span className="text-slate-900 tabular-nums">{formatINR(invoiceDetails.totalGst)}</span>
                            </div>
                            {payload.discount > 0 && (
                                <div className="flex justify-between text-[11px] font-black text-rose-600 uppercase">
                                    <span>Discount (Billing level)</span>
                                    <span className="tabular-nums">- {formatINR(payload.discount)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-black font-black">
                            <span className="text-[13px] font-black uppercase">Net Payable</span>
                            <span className="text-[16px] font-black tabular-nums border-b-4 border-double border-slate-900 leading-none">{formatINR(invoiceDetails.grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="mt-6 flex justify-between items-end h-24">
                    <div className="text-left text-[10px] font-black uppercase border-b border-slate-200 pb-1">Seal Area</div>
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-400 mb-2" />
                        <p className="text-[9.5px] font-bold text-slate-500 uppercase">Receiver's Sign</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-bold text-slate-400 italic mb-4">Digitally verified by pharmacist-on-duty</p>
                        <div className="w-48 border-b-2 border-slate-900 mb-2" />
                        <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none">Authorized Pharmacist</p>
                        <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">(Reg No: PH/2045/BNG)</p>
                    </div>
                </div>

                <div className="mt-auto pt-6 text-center border-t border-slate-200 flex flex-col gap-1 items-center">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Computer Generated Invoice – No Signature Required</p>
                    <p className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase underline decoration-slate-200 underline-offset-4 mt-1">Valid legal document generated by Synapse HMS.</p>
                </div>
            </div>
        </div>
    );
}
