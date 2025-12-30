"use client";

import AppShell from "@/components/layout/app-shell";
import { fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function InvoiceView() {
  const { id } = useParams();

  const { data: billingData } = useSWR<{
    message: string;
    data: {
      _id: string;
      user: string;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        email: string;
        gender: string;
        dateOfBirth: Date;
        conditions: string[];
        allergies: string;
        notes: string;
        createdBy: string;
        status: string;
        mrn: string;
        createdAt: string;
        updatedAt: string;
        address?: string;
      };
      items: {
        name: string;
        quantity: number;
        unitPrice: number;
        gst: number;
        discount: number;
        total: number;
      }[];
      roundOff: boolean;
      cash: number;
      online: number;
      insurance: number;
      discount: number;
      mrn: string;
      createdAt: Date;
      updatedAt: Date;
      doctor?: string;
      department?: string;
      note?: string;
    };
  }>(`/billing/${id}`);

  const billing = billingData?.data;

  if (!billing) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </AppShell>
    );
  }

  // Calculations for totals
  const subtotal = billing.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice - item.discount),
    0
  );

  const totalGst = billing.items.reduce(
    (sum, item) =>
      sum + ((item.quantity * item.unitPrice - item.discount) * item.gst) / 100,
    0
  );

  const grandTotal = billing.items.reduce((s, { total }) => s + total, 0);

  const paymentMethod =
    billing.insurance > 0
      ? "Insurance"
      : billing.online > 0
        ? "Online"
        : "Cash";

  return (
    <AppShell>
      <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen overflow-auto gap-4">
        <div className="w-full flex justify-start">
          <Link
            href="/dashboard/pharmacy/billing"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-900 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bills
          </Link>
        </div>
        {/* Receipt Container - Adapted from PrintReceipt.tsx */}
        <div className="bg-white text-black font-sans leading-relaxed shadow-lg w-full p-[1.5cm] flex flex-col text-[10.5px]">
          {/* Formal Header */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
            <div className="flex gap-5 items-center">
              <div className="h-14 w-14 bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                S
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  SYNAPSE HOSPITAL
                </h1>
                <p className="text-[10px] font-bold text-slate-700 uppercase">
                  Multi-Speciality Care & Research Institute
                </p>
                <div className="mt-1 text-[10px] text-slate-600 leading-tight font-medium">
                  <p>123 Medical Enclave, Health City, Bangalore - 560001</p>
                  <p className="font-bold text-slate-800">
                    GSTIN: 29AAAAA0000A1Z5 | DL No: KA-BNG-123456 |{" "}
                    <span className="text-black">State Code: 29</span>
                  </p>
                  <p>
                    Tel: +91 80 4455 6677 | Email: pharmacy@synapsehospital.com
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right border-l-2 pl-6 border-slate-200">
              <h2 className="text-lg font-black text-slate-900 uppercase mb-1 tracking-tighter">
                CASH RECEIPT
              </h2>
              <div className="text-[10px] font-bold text-slate-700 space-y-0.5">
                <p>
                  Invoice No:{" "}
                  <span className="text-black font-black">
                    {billing.mrn}
                  </span>
                </p>
                <p>
                  Date:{" "}
                  {billing.createdAt
                    ? fDateandTime(billing.createdAt).split(",")[0]
                    : "—"}
                </p>
                <p>
                  Time:{" "}
                  {billing.createdAt
                    ? fDateandTime(billing.createdAt).split(",")[1]
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="mb-6 bg-slate-50 p-4 border border-slate-200">
            <h3 className="text-[9.5px] font-black uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1 flex justify-between">
              <span>Patient & Billing Information</span>
              <span className="text-slate-900">
                Bill Type: {paymentMethod} / OP Pharmacy
              </span>
            </h3>
            <div className="grid grid-cols-4 gap-y-3 gap-x-8">
              <div className="col-span-2">
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  Patient Name
                </p>
                <p className="text-[13px] font-black text-slate-900 uppercase leading-none tracking-tight">
                  {billing.patient.name}
                </p>
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  MRN Number
                </p>
                <p className="text-[11px] font-black text-slate-900">
                  {billing.patient.mrn || "—"}
                </p>
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  Patient ID
                </p>
                <p className="text-[11px] font-black text-slate-900">
                  {billing.patient.mrn?.replace("MRN", "PID") || "—"}
                </p>
              </div>

              <div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  Age / Gender
                </p>
                <p className="text-[11px] font-bold text-slate-800">
                  {billing.patient.dateOfBirth
                    ? `${new Date().getFullYear() -
                    new Date(billing.patient.dateOfBirth).getFullYear()
                    }Y`
                    : "—"}{" "}
                  / {billing.patient.gender || "—"}
                </p>
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  Phone
                </p>
                <p className="text-[11px] font-bold text-slate-800">
                  {billing.patient.phoneNumber || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                  Payment Mode
                </p>
                <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                  {paymentMethod}
                </p>
              </div>

              {billing.patient.address && (
                <div className="col-span-4 mt-0.5">
                  <p className="text-[8.5px] text-slate-500 font-bold uppercase mb-0.5">
                    Address
                  </p>
                  <p className="text-[10px] font-medium text-slate-600 italic leading-tight">
                    {billing.patient.address}
                  </p>
                </div>
              )}

              <div className="col-span-4 mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-400">
                  Prescribed By:
                </span>
                <span className="text-[11px] font-black text-slate-800 uppercase">
                  Dr. {billing.doctor || "—"}
                </span>
                <span className="text-slate-300 mx-1">|</span>
                <span className="text-[9px] font-black uppercase text-slate-400">
                  Dept:
                </span>
                <span className="text-[11px] font-black text-slate-800 uppercase">
                  {billing.department || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 overflow-visible">
            <table className="w-full border-collapse border border-slate-900 overflow-visible">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="border border-slate-900 py-2 px-2 text-left text-[9.5px] uppercase font-black">
                    Sl
                  </th>
                  <th className="border border-slate-900 py-2 px-3 text-left text-[9.5px] uppercase font-black w-1/3">
                    Description
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">
                    Batch
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">
                    Exp
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-center text-[9.5px] uppercase font-black">
                    HSN
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-right text-[9.5px] uppercase font-black">
                    Qty
                  </th>
                  <th className="border border-slate-900 py-2 px-3 text-right text-[9.5px] uppercase font-black">
                    Rate
                  </th>
                  <th className="border border-slate-900 py-2 px-2 text-right text-[9.5px] uppercase font-black">
                    GST
                  </th>
                  <th className="border border-slate-900 py-2 px-3 text-right text-[9.5px] uppercase font-black">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {billing.items.map((item, index) => (
                  <tr key={index} className="h-8">
                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 py-1 px-3 text-[11px] font-black uppercase text-slate-900 leading-tight">
                      {item.name}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-600">
                      B-7721
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-center font-bold text-slate-600">
                      12/26
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-[9px] text-slate-500 text-center uppercase">
                      3004
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-[11px] text-right font-black tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="border border-slate-300 py-1 px-3 text-[11px] text-right tabular-nums font-bold italic">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-[10px] text-slate-600 text-right tabular-nums font-bold">
                      {item.gst}%
                    </td>
                    <td className="border border-slate-300 py-1 px-3 text-[11px] font-black text-right tabular-nums text-slate-900">
                      {formatINR(item.total)}
                    </td>
                  </tr>
                ))}
                {/* Empty rows to push totals down */}
                {Array.from({
                  length: Math.max(0, 5 - billing.items.length),
                }).map((_, i) => (
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
                  <td
                    colSpan={8}
                    className="border border-slate-900 py-2.5 px-4 text-right text-[11px] uppercase tracking-widest text-slate-600"
                  >
                    Invoice Total (Inclusive of all taxes)
                  </td>
                  <td className="border border-slate-900 py-2.5 px-4 text-right text-[13px] tabular-nums font-black underline decoration-2 underline-offset-2">
                    {formatINR(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Calculation & Terms */}
          <div className="mt-6 flex justify-between items-start gap-12 border-t border-slate-100 pt-6">
            <div className="flex-1">
              <div className="text-[10px] uppercase font-black text-slate-900 mb-2 border-b-2 border-slate-900 inline-block">
                Terms & Conditions
              </div>
              <ul className="text-[9.5px] text-slate-700 space-y-1 font-medium list-disc ml-4">
                <li>
                  Invoice once generated cannot be cancelled or modified.
                </li>
                <li className="font-bold text-slate-900">
                  Please check the medicines before leaving the pharmacy
                  (Return within 24H with original invoice & intact strip).
                </li>
                <li>Refrigerated items will not be accepted for return.</li>
              </ul>
              {billing.note && (
                <div className="mt-4 p-3 border border-slate-200 bg-slate-50 text-left">
                  <p className="text-[8.5px] font-black text-slate-400 uppercase leading-none mb-1">
                    Pharmacist Note
                  </p>
                  <p className="text-xs text-slate-800 italic font-bold">
                    "{billing.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="w-72 border-2 border-slate-900 p-4 bg-slate-50">
              <div className="space-y-2 border-b border-slate-200 pb-3 mb-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>Gross Amount</span>
                  <span className="text-slate-900 tabular-nums">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>CGST/SGST Total</span>
                  <span className="text-slate-900 tabular-nums">
                    {formatINR(totalGst)}
                  </span>
                </div>
                {billing.discount > 0 && (
                  <div className="flex justify-between text-[11px] font-black text-rose-600 uppercase">
                    <span>Discount (Billing level)</span>
                    <span className="tabular-nums">
                      - {formatINR(billing.discount)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-black font-black">
                <span className="text-[13px] font-black uppercase">
                  Net Payable
                </span>
                <span className="text-[16px] font-black tabular-nums border-b-4 border-double border-slate-900 leading-none">
                  {formatINR(grandTotal - (billing.discount || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-6 flex justify-between items-end h-24">
            <div className="text-left text-[10px] font-black uppercase border-b border-slate-200 pb-1">
              Seal Area
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2" />
              <p className="text-[9.5px] font-bold text-slate-500 uppercase">
                Receiver's Sign
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-slate-400 italic mb-4">
                Digitally verified by pharmacist-on-duty
              </p>
              <div className="w-48 border-b-2 border-slate-900 mb-2" />
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none">
                Authorized Pharmacist
              </p>
              <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                (Reg No: PH/2045/BNG)
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center border-t border-slate-200 flex flex-col gap-1 items-center">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
              Computer Generated Invoice – No Signature Required
            </p>
            <p className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase underline decoration-slate-200 underline-offset-4 mt-1">
              Valid legal document generated by Synapse HMS.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
