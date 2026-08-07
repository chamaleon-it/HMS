"use client";

import React from "react";
import { numberToWords } from "@/lib/fNumber";
import configuration from "@/config/configuration";
import { format, addDays } from "date-fns";

interface Props {
  data: {
    patient: {
      name: string;
      mrn?: string;
      phoneNumber?: string;
      dateOfBirth?: string | Date;
      gender?: string;
      address?: string;
    };
    doctor: any;
    date: string | Date;
    token?: string;
    tokenNumber?: number;
    fee?: number;
  } | null;
}

export default function PatientRegistrationBillPrint({ data }: Props) {
  if (!data) return null;

  const docObj = typeof data.doctor === "object" ? data.doctor : null;
  const rawDocName = docObj?.name || (typeof data.doctor === "string" ? data.doctor : "DR. UMER MUKHTHAR");
  const docName = rawDocName.toLowerCase().startsWith("dr") ? rawDocName.toUpperCase() : `DR. ${rawDocName.toUpperCase()}`;
  const docQual = docObj?.qualification || docObj?.specialization || "MBBS, MD";

  const patientName = (data.patient?.name || "MUHAMMED AYAN").toUpperCase();
  const patientAddress = (data.patient?.address || "KERALA, INDIA").toUpperCase();
  const patientPhone = data.patient?.phoneNumber || "+919562745975";

  let ageStr = "5";
  if (data.patient?.dateOfBirth) {
    const diff = new Date().getFullYear() - new Date(data.patient.dateOfBirth).getFullYear();
    if (diff > 0) ageStr = `${diff}`;
  }
  const genderStr = data.patient?.gender ? data.patient.gender.charAt(0).toUpperCase() : "M";
  const ageSex = `${ageStr} ${genderStr}`;

  const createdDate = data.date ? new Date(data.date) : new Date();
  const formattedDate = format(createdDate, "dd/MM/yyyy");
  const validUptoDate = format(addDays(createdDate, 10), "dd/MM/yyyy");

  const opNo = data.patient?.mrn || "11114";
  const tokenNo = data.token || (data.tokenNumber ? String(data.tokenNumber) : "22");

  const feeAmount = data.fee ?? 100;
  const words = numberToWords(feeAmount);

  return (
    <div className="registration-bill-print hidden print:block bg-white text-black font-sans leading-snug select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                visibility: hidden !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .registration-bill-print, .registration-bill-print * {
                visibility: visible !important;
              }
              .registration-bill-print {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 auto !important;
                width: 78mm !important;
                padding: 4mm 3mm !important;
                font-family: Arial, Helvetica, sans-serif !important;
                font-size: 11px !important;
                line-height: 1.25 !important;
                color: black !important;
                background: white !important;
                display: block !important;
              }
              .no-print, header, footer, nav, button, [role="dialog"] {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Header / Hospital Branding */}
      <div className="text-center pb-2">
        <h2 className="font-extrabold text-[13px] tracking-tight uppercase leading-tight">
          {configuration().hospitalName || "BHUMI WELLNESS"}
        </h2>
        <p className="text-[10px] uppercase font-semibold text-gray-800">OLD RAJANA THEATRE ROAD</p>
        <p className="text-[9.5px] uppercase text-gray-800">OPP.MSN APPARTMENTS,KOOTTANAD</p>
        <p className="text-[9.5px] text-gray-800 font-medium">GSTIN :32BORPV3323K1ZJ</p>
        <p className="text-[9.5px] text-gray-800 font-medium">Mob :8505030406,6282803887</p>
      </div>

      {/* Bill Title */}
      <div className="text-center py-1">
        <h3 className="font-extrabold text-[12px] uppercase tracking-wider">
          PATIENT REGISTRATION BILL
        </h3>
      </div>

      {/* OP No & Date / Token No & Valid Upto */}
      <div className="space-y-1.5 my-2 text-[11px]">
        <div className="flex justify-between items-center">
          <span><span className="font-bold">OP No / Date :</span> <span className="font-extrabold text-[12px]">{opNo}</span></span>
          <span className="font-bold">{formattedDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span><span className="font-bold">Token No :</span> <span className="font-black text-[13px]">{tokenNo}</span></span>
          <span><span className="font-bold">Valid Upto :</span><span className="font-bold">{validUptoDate}</span></span>
        </div>
      </div>

      {/* Consultant Name & Patient Details Box */}
      <div className="border border-slate-400 my-2 text-[10.5px]">
        {/* Consultant Row */}
        <div className="flex border-b border-slate-300">
          <div className="w-25 shrink-0 p-1.5 font-bold text-gray-800 bg-slate-50/50">
            Consultant<br />Name
          </div>
          <div className="w-px bg-slate-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{docName}</div>
            <div className="font-semibold text-[9.5px] text-gray-600">{docQual}</div>
          </div>
        </div>

        {/* Patient Row */}
        <div className="flex border-b border-slate-300">
          <div className="w-25 shrink-0 p-1.5 font-bold text-gray-800 bg-slate-50/50">
            Patient<br />Details
          </div>
          <div className="w-px bg-slate-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{patientName}</div>
            <div className="font-semibold text-[9.5px] text-gray-600">{patientAddress}</div>
          </div>
        </div>

        {/* Age / Sex Row */}
        <div className="flex">
          <div className="w-25 shrink-0 p-1.5 font-bold text-gray-800 bg-slate-50/50">
            Age/Sex
          </div>
          <div className="w-px bg-slate-300 shrink-0" />
          <div className="p-1.5 font-bold text-black uppercase leading-tight flex-1">
            <div>{ageSex}</div>
            <div className="font-semibold text-[9.5px] text-gray-600">{patientPhone}</div>
          </div>
        </div>
      </div>

      {/* Particulars Table */}
      <div className="my-3">
        <div className="flex justify-between font-extrabold text-[11px] border-y border-slate-400 py-1 uppercase">
          <span>PARTICULARS</span>
          <span className="text-right">AMOUNT</span>
        </div>

        <div className="flex justify-between items-center py-2 text-[11px]">
          <span className="font-medium text-gray-900">Consultation Fee</span>
          <span className="font-bold text-black tabular-nums border border-slate-300 px-2.5 py-0.5 rounded-none bg-slate-50/50 text-[11.5px]">
            {feeAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="my-2.5 text-[10.5px]">
        <div className="font-semibold text-gray-800">Amount in Words :</div>
        <div className="font-extrabold text-black uppercase tracking-wide">{words}</div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-5 pt-2 text-[10.5px]">
        <div className="font-extrabold uppercase text-[10.5px]">
          {configuration().hospitalName || "BHUMI WELLNESS"}
        </div>
        <div className="text-right font-bold italic text-gray-800 mt-4">
          (Sign)
        </div>
      </div>
    </div>
  );
}
