"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  preview?: boolean;
}

export default function PatientRegistrationBillPrint({ data, preview = false }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !data) return null;

  const rawHospitalName = configuration().hospitalName || "BHUMI NATURE CURE & WELLNESS";
  const hospitalName =
    rawHospitalName === "BHUMI WELLNESS" ? "BHUMI NATURE CURE & WELLNESS" : rawHospitalName;

  const docObj = typeof data.doctor === "object" ? data.doctor : null;
  const rawDocName = String(
    docObj?.name || (typeof data.doctor === "string" ? data.doctor : "") || "DR. UMER MUKHTHAR E.V"
  );
  const docName = rawDocName.toLowerCase().startsWith("dr")
    ? rawDocName.toUpperCase()
    : `DR. ${rawDocName.toUpperCase()}`;

  let docQual = docObj?.qualification || "";
  let docSpec = docObj?.specialization || docObj?.department || "";
  if (!docQual && !docSpec && docName.includes("UMER")) {
    docQual = "BUMS";
    docSpec = "GM";
  }

  const patientName = (data.patient?.name || "PATIENT").toUpperCase();
  const patientAddress = (data.patient?.address || "").toUpperCase();
  const patientPhone = data.patient?.phoneNumber || "";

  let ageStr = "—";
  if (data.patient?.dateOfBirth) {
    const diff = new Date().getFullYear() - new Date(data.patient.dateOfBirth).getFullYear();
    if (diff >= 0) ageStr = `${diff}`;
  }
  const genderStr = data.patient?.gender ? data.patient.gender.charAt(0).toUpperCase() : "—";
  const ageSex = `${ageStr}  ${genderStr}`;

  const createdDate = data.date ? new Date(data.date) : new Date();
  const formattedDate = format(createdDate, "dd/MM/yyyy");
  const validUptoDate = format(addDays(createdDate, 10), "dd/MM/yyyy");

  const rawOpNo = data.patient?.mrn || "";
  const opNo = rawOpNo ? rawOpNo.replace(/^(MRN-?|P-)/i, "") : "—";

  const rawToken = data.token || (data.tokenNumber !== undefined ? String(data.tokenNumber) : "");
  let displayToken = rawToken && rawToken.includes("-") ? rawToken.split("-")[1] : rawToken || "—";
  if (/^0+\d+$/.test(displayToken)) {
    displayToken = String(parseInt(displayToken, 10));
  }

  const feeAmount = typeof data.fee === "number" ? data.fee : 0;
  const displayFee = feeAmount % 1 === 0 ? String(feeAmount) : feeAmount.toFixed(2);
  const rawWords = feeAmount === 0 ? "ZERO" : numberToWords(feeAmount).replace(/\s*ONLY$/i, "").trim();
  const words = `${rawWords} only`;

  const content = (
    <div
      className={`registration-bill-print ${
        preview ? "block" : "hidden print:block"
      } bg-white text-black font-montserrat leading-snug select-none`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Montserrat', sans-serif !important;
                color: #000000 !important;
              }
              body > *:not(.registration-bill-print) {
                display: none !important;
              }
              .registration-bill-print, .registration-bill-print * {
                visibility: visible !important;
                font-family: 'Montserrat', sans-serif !important;
                color: #000000 !important;
                border-color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
              }
              .registration-bill-print {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 auto !important;
                width: 76mm !important;
                padding: 4mm 2.5mm !important;
                font-family: 'Montserrat', sans-serif !important;
                font-size: 10.5px !important;
                line-height: 1.25 !important;
                color: #000000 !important;
                background: #ffffff !important;
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
      <div className="text-center pb-1">
        <h2 className="font-bold text-[12px] tracking-tight uppercase leading-tight text-black">
          {hospitalName}
        </h2>
        <p className="text-[9.5px] uppercase font-normal text-black leading-tight">OLD RAJANA THEATRE ROAD</p>
        <p className="text-[9.5px] uppercase font-normal text-black leading-tight">OPP.MSN APPARTMENTS,KOOTTANAD</p>
        <p className="text-[9.5px] text-black font-normal leading-tight">GSTIN :32BORPV3323K1ZJ</p>
        <p className="text-[9.5px] text-black font-normal leading-tight">Mob :8505030406,6282803887</p>
      </div>

      {/* Bill Title */}
      <div className="text-center py-1">
        <h3 className="font-bold text-[13.5px] text-black tracking-normal">
          Patient Registration Bill
        </h3>
      </div>

      {/* OP No & Date / Token No & Valid Upto */}
      <div className="space-y-1 my-1.5 text-[10.5px]">
        <div className="flex justify-between items-center">
          <span>
            <span className="font-normal text-black">OP No / Date :</span>{" "}
            <span className="font-bold text-black text-[11px]">{opNo}</span>
          </span>
          <span className="font-normal text-black">{formattedDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>
            <span className="font-normal text-black">Token No : </span>
            <span className="font-bold text-black text-[11px]">{displayToken}</span>
          </span>
          <span>
            <span className="font-normal text-black">Valid Upto :</span>
            <span className="font-normal text-black">{validUptoDate}</span>
          </span>
        </div>
      </div>

      {/* Divider 1 */}
      <div className="border-b border-black my-2" />

      {/* Consultant Name & Patient Details (with vertical divider line) */}
      <div className="text-[10.5px]">
        {/* Consultant Row */}
        <div className="flex items-stretch pb-2.5">
          <div className="w-[82px] shrink-0 text-right pr-2.5 border-r border-black font-normal text-[10px] text-black leading-tight">
            Consultant<br />Name
          </div>
          <div className="flex-1 pl-2.5 text-left leading-tight">
            <div className="font-bold text-[11px] uppercase text-black">{docName}</div>
            {docQual && <div className="font-normal text-[9.5px] text-black uppercase">{docQual}</div>}
            {docSpec && <div className="font-normal text-[9.5px] text-black uppercase">{docSpec}</div>}
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="flex items-stretch pb-2.5">
          <div className="w-[82px] shrink-0 text-right pr-2.5 border-r border-black font-normal text-[10px] text-black leading-tight">
            Patient<br />Details
          </div>
          <div className="flex-1 pl-2.5 text-left leading-tight">
            <div className="font-bold text-[11px] uppercase text-black">{patientName}</div>
            {patientAddress && (
              <div className="font-normal text-[9.5px] text-black uppercase">{patientAddress}</div>
            )}
          </div>
        </div>

        {/* Age / Sex Row */}
        <div className="flex items-stretch">
          <div className="w-[82px] shrink-0 text-right pr-2.5 border-r border-black font-normal text-[10px] text-black leading-tight">
            Age/Sex
          </div>
          <div className="flex-1 pl-2.5 text-left leading-tight">
            <div className="font-normal text-[10.5px] text-black">{ageSex}</div>
            {patientPhone && (
              <div className="font-normal text-[10.5px] text-black tracking-tight">{patientPhone}</div>
            )}
          </div>
        </div>
      </div>

      {/* Divider 2 */}
      <div className="border-b border-black my-2" />

      {/* Particulars & Amount Table */}
      <div className="my-1.5">
        <div className="flex justify-between font-bold text-[11px] text-black mb-1.5">
          <span>Particulars</span>
          <span className="text-right">Amount</span>
        </div>

        <div className="flex justify-between items-center py-0.5 text-[10.5px]">
          <span className="font-normal text-black">Consultation Charges</span>
          <span className="font-bold text-black tabular-nums border border-black px-3 py-0.5 text-center min-w-[58px] text-[11px]">
            {displayFee}
          </span>
        </div>
      </div>

      {/* Divider 3 */}
      <div className="border-b border-black my-2" />

      {/* Amount in Words */}
      <div className="my-2 text-[10.5px]">
        <div className="font-normal text-black">Amount in Words :</div>
        <div className="font-bold text-black tracking-wide">{words}</div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-5 pt-1 text-[10px]">
        <div className="font-normal text-black">
          For {hospitalName.toUpperCase()}
        </div>
        <div className="text-right italic text-[10px] text-black mt-6 pr-1">
          (Sign)
        </div>
      </div>
    </div>
  );

  if (preview) {
    return content;
  }

  return createPortal(content, document.body);
}
