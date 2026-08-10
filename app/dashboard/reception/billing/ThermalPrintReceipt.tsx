"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatINR, numberToWords } from "@/lib/fNumber";
import configuration from "@/config/configuration";
import { format, addDays } from "date-fns";

interface ThermalPrintReceiptProps {
  bill: any;
}

export default function ThermalPrintReceipt({ bill }: ThermalPrintReceiptProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!bill || !mounted) return null;

  const docObj = typeof bill.doctor === "object" ? bill.doctor : null;
  const docName = docObj?.name
    ? (docObj.name.toLowerCase().startsWith("dr") ? docObj.name : `DR. ${docObj.name}`).toUpperCase()
    : bill.doctor === "Self"
      ? "SELF"
      : typeof bill.doctor === "string" && bill.doctor !== "N/A"
        ? bill.doctor.toUpperCase()
        : "DR. UMER MUKHTHAR E.V";

  const docQual = docObj?.qualification || docObj?.specialization || "BUMS\nGM";

  const patientName = (bill.patient?.name || "RAMSEENA").toUpperCase();
  const patientAddress = (bill.patient?.address || "CHEKANNUR").toUpperCase();
  const patientPhone = bill.patient?.phoneNumber || "9745300835";
  const ageStr = bill.patient?.dateOfBirth
    ? `${new Date().getFullYear() - new Date(bill.patient.dateOfBirth).getFullYear()}`
    : "40";
  const genderStr = bill.patient?.gender ? bill.patient.gender.charAt(0).toUpperCase() : "F";
  const ageSex = `${ageStr}  ${genderStr}`;

  const createdDate = bill.createdAt ? new Date(bill.createdAt) : new Date();
  const formattedDate = format(createdDate, "dd/MM/yyyy");
  const validUptoDate = format(addDays(createdDate, 10), "dd/MM/yyyy");

  const opNo = bill.patient?.mrn || bill.mrn || "14369";
  const rawToken = bill.token || (bill.tokenNumber ? `${docName.replace(/^DR\.\s*/i, '').split(' ')[0]}-${String(bill.tokenNumber).padStart(2, '0')}` : "");
  const displayToken = (rawToken && rawToken.includes("-")) ? rawToken.split("-")[1] : (rawToken || "—");

  const items = bill.items && bill.items.length > 0 ? bill.items : [{ name: "Consultation Charges", total: 200, unitPrice: 200, quantity: 1 }];
  const grandTotal = items.reduce((sum: number, item: any) => sum + (item.total ?? (item.unitPrice * (item.quantity || 1))), 0) - (bill.discount || 0);

  const words = numberToWords(grandTotal);

  return createPortal(
    <div className="thermal-receipt-print-wrapper hidden print:block bg-white text-black font-sans text-[11px] leading-snug select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body > *:not(.thermal-receipt-print-wrapper) {
                display: none !important;
              }
              .thermal-receipt-print-wrapper, .thermal-receipt-print-wrapper * {
                visibility: visible !important;
              }
              .thermal-receipt-print-wrapper {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 auto !important;
                width: 76mm !important;
                padding: 4mm 3mm !important;
                font-family: Arial, Helvetica, sans-serif !important;
                font-size: 11px !important;
                line-height: 1.3 !important;
                color: black !important;
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Header / Hospital Branding */}
      <div className="text-center pb-2">
        <h2 className="font-extrabold text-[12px] tracking-tight uppercase leading-tight">
          {configuration().hospitalName || "BHUMI NATURE CURE & WELLNESS"}
        </h2>
        <p className="text-[10px] uppercase font-semibold text-gray-800">OLD RAJANA THEATRE ROAD</p>
        <p className="text-[9.5px] uppercase text-gray-800">OPP.MSN APPARTMENTS,KOOTTANAD</p>
        <p className="text-[9.5px] text-gray-800 font-medium">GSTIN :32BORPV3323K1ZJ</p>
        <p className="text-[9.5px] text-gray-800 font-medium">Mob :8505030406,6282803887</p>
      </div>

      {/* Bill Title */}
      <div className="text-center py-1">
        <h3 className="font-extrabold text-[12px] uppercase tracking-wide">
          Patient Registration Bill
        </h3>
      </div>

      {/* OP No & Date / Token No & Valid Upto */}
      <div className="space-y-1 my-1.5 text-[11px] font-bold">
        <div className="flex justify-between items-center">
          <span>OP No / Date : <span className="font-extrabold text-[12px]">{opNo}</span></span>
          <span className="font-semibold">{formattedDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Token No : <span className="font-black text-[13px]">{displayToken}</span></span>
          <span className="font-semibold">Valid Upto :{validUptoDate}</span>
        </div>
      </div>

      {/* Consultant Name & Patient Details Box */}
      <div className="border border-gray-400 rounded-none my-2 text-[10.5px]">
        {/* Consultant Row */}
        <div className="flex border-b border-gray-300">
          <div className="w-26.25 shrink-0 p-1.5 font-bold text-gray-700 bg-gray-50/50">
            Consultant<br />Name
          </div>
          <div className="w-px bg-gray-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{docName}</div>
            <div className="font-semibold text-[9.5px] text-gray-700 whitespace-pre-line">{docQual}</div>
          </div>
        </div>

        {/* Patient Row */}
        <div className="flex border-b border-gray-300">
          <div className="w-26.25 shrink-0 p-1.5 font-bold text-gray-700 bg-gray-50/50">
            Patient<br />Details
          </div>
          <div className="w-px bg-gray-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{patientName}</div>
            <div className="font-semibold text-[9.5px] text-gray-700">{patientAddress}</div>
          </div>
        </div>

        {/* Age / Sex Row */}
        <div className="flex">
          <div className="w-26.25 shrink-0 p-1.5 font-bold text-gray-700 bg-gray-50/50">
            Age/Sex
          </div>
          <div className="w-px bg-gray-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{ageSex}</div>
            <div className="font-semibold text-[9.5px] text-gray-700">{patientPhone}</div>
          </div>
        </div>
      </div>

      {/* Particulars Table */}
      <div className="my-2">
        <div className="flex justify-between font-bold text-[11px] border-y border-gray-400 py-1 uppercase">
          <span>Particulars</span>
          <span className="text-right">Amount</span>
        </div>

        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center py-1.5 text-[11px] border-b border-gray-200">
            <span className="font-medium text-gray-900">{item.name}</span>
            <span className="font-bold text-black tabular-nums border border-gray-300 px-2 py-0.5 rounded-none bg-gray-50/30">
              {(item.total ?? (item.unitPrice * (item.quantity || 1))).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Amount in Words */}
      <div className="my-2.5 text-[10.5px]">
        <div className="font-semibold text-gray-800">Amount in Words :</div>
        <div className="font-bold text-black uppercase tracking-wide">{words}</div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-4 pt-2 text-[10.5px]">
        <div className="font-bold uppercase text-[10px]">
          {configuration().hospitalName || "BHUMI NATURE CURE & WELLNESS"}
        </div>
        <div className="text-right font-semibold italic text-gray-700 mt-3">
          (Sign)
        </div>
      </div>
    </div>,
    document.body
  );
}
