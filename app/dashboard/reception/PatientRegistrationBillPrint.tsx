"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { numberToWords } from "@/lib/fNumber";
import { formatPatientAddress } from "@/lib/formatPatientAddress";
import configuration from "@/config/configuration";
import { format } from "date-fns";
import { formatRegistrationBillDay, registrationAmountInWords, registrationBillValidUpto } from "@/lib/registrationBillValidity";

interface Props {
  data: {
    patient: {
      name: string;
      mrn?: string;
      phoneNumber?: string;
      dateOfBirth?: string | Date;
      gender?: string;
      address?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      district?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    };
    doctor: any;
    date: string | Date;
    token?: string;
    tokenNumber?: number;
    fee?: number;
    consultationValidUntil?: string | Date | null;
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
  const patientAddress = formatPatientAddress(data.patient).toUpperCase();
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
  const feeAmount = typeof data.fee === "number" ? data.fee : 0;
  const validUptoDate = formatRegistrationBillDay(
    registrationBillValidUpto(createdDate, data.consultationValidUntil, {
      unpaid: feeAmount === 0,
    }),
  );

  const rawOpNo = data.patient?.mrn || "";
  const opNo = rawOpNo ? rawOpNo.replace(/^(MRN-?|P-)/i, "") : "—";

  const rawToken = data.token || (data.tokenNumber !== undefined ? String(data.tokenNumber) : "");
  let displayToken = rawToken && rawToken.includes("-") ? rawToken.split("-")[1] : rawToken || "—";
  if (/^0+\d+$/.test(displayToken)) {
    displayToken = String(parseInt(displayToken, 10));
  }

  const displayFee = feeAmount % 1 === 0 ? String(feeAmount) : feeAmount.toFixed(2);
  const rawWords = numberToWords(feeAmount).replace(/\s*ONLY$/i, "").trim();
  const words = registrationAmountInWords(feeAmount, `${rawWords} only`);

  const content = (
    <div
      className={`registration-bill-print ${
        preview ? "block" : "hidden print:block"
      } bg-white text-black select-none`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Thermal receipt (58–80mm): full roll width, equal side margins */
            .registration-bill-print {
              --rb-ink: #000000;
              --rb-paper: #ffffff;
              --rb-pad-x: 3.5mm;
              --rb-pad-y: 2.5mm;
              --rb-base: 11.5px;
              --rb-small: 10.5px;
              --rb-title: 13.5px;
              --rb-name: 12.5px;
              --rb-amount: 13.5px;
              --rb-label-w: 20mm;
              box-sizing: border-box;
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              padding: var(--rb-pad-y) var(--rb-pad-x);
              background: var(--rb-paper);
              color: var(--rb-ink);
              font-family: Arial, Helvetica, "DejaVu Sans", sans-serif;
              font-size: var(--rb-base);
              font-weight: 700;
              line-height: 1.35;
              letter-spacing: 0;
              overflow-wrap: anywhere;
              word-break: break-word;
            }
            .registration-bill-print *,
            .registration-bill-print *::before,
            .registration-bill-print *::after {
              box-sizing: border-box;
              color: var(--rb-ink) !important;
              border-color: var(--rb-ink) !important;
              -webkit-text-fill-color: var(--rb-ink) !important;
              background: transparent;
            }
            .registration-bill-print .rb-header {
              text-align: center;
              padding-bottom: 2px;
            }
            .registration-bill-print .rb-hospital {
              margin: 0;
              font-size: var(--rb-title);
              font-weight: 700;
              line-height: 1.2;
              text-transform: uppercase;
            }
            .registration-bill-print .rb-meta {
              margin: 1px 0 0;
              font-size: var(--rb-small);
              font-weight: 700;
              line-height: 1.25;
              text-transform: uppercase;
            }
            .registration-bill-print .rb-title-wrap {
              text-align: center;
              padding: 4px 0 2px;
            }
            .registration-bill-print .rb-title {
              margin: 0;
              font-size: var(--rb-title);
              font-weight: 700;
              line-height: 1.2;
            }
            .registration-bill-print .rb-meta-rows {
              margin: 4px 0;
              font-size: var(--rb-base);
            }
            .registration-bill-print .rb-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 4px;
              margin: 3px 0;
            }
            .registration-bill-print .rb-row-left,
            .registration-bill-print .rb-row-right {
              min-width: 0;
            }
            .registration-bill-print .rb-row-right {
              text-align: right;
              flex-shrink: 0;
              white-space: nowrap;
            }
            .registration-bill-print .rb-strong {
              font-weight: 700;
              font-size: var(--rb-name);
            }
            .registration-bill-print .rb-rule {
              border: 0;
              border-top: 1.5px solid #000;
              margin: 5px 0;
              height: 0;
            }
            .registration-bill-print .rb-detail {
              font-size: var(--rb-base);
            }
            .registration-bill-print .rb-detail-row {
              display: flex;
              align-items: stretch;
              margin: 0 0 6px;
              gap: 0;
            }
            .registration-bill-print .rb-detail-row:last-child {
              margin-bottom: 0;
            }
            .registration-bill-print .rb-detail-label {
              width: var(--rb-label-w);
              flex: 0 0 var(--rb-label-w);
              text-align: right;
              padding: 0 5px 0 0;
              margin-right: 5px;
              border-right: 1.5px solid #000;
              font-size: var(--rb-small);
              font-weight: 600;
              line-height: 1.25;
            }
            .registration-bill-print .rb-detail-value {
              flex: 1 1 auto;
              min-width: 0;
              padding-left: 2px;
              text-align: left;
              line-height: 1.3;
            }
            .registration-bill-print .rb-detail-value .rb-name {
              font-size: var(--rb-name);
              font-weight: 700;
              text-transform: uppercase;
              line-height: 1.25;
            }
            .registration-bill-print .rb-detail-value .rb-sub {
              font-size: var(--rb-small);
              font-weight: 600;
              text-transform: uppercase;
              line-height: 1.25;
              margin-top: 1px;
            }
            .registration-bill-print .rb-charges-head {
              display: flex;
              justify-content: space-between;
              gap: 6px;
              font-size: var(--rb-name);
              font-weight: 700;
              margin: 4px 0 6px;
            }
            .registration-bill-print .rb-charges-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 8px;
              font-size: var(--rb-base);
              font-weight: 600;
            }
            .registration-bill-print .rb-charges-line > span:first-child {
              min-width: 0;
              flex: 1 1 auto;
            }
            .registration-bill-print .rb-amount-box {
              flex: 0 0 auto;
              min-width: 14mm;
              border: 1.75px solid #000;
              padding: 2px 6px;
              text-align: center;
              font-size: var(--rb-amount);
              font-weight: 700;
              font-variant-numeric: tabular-nums;
              line-height: 1.2;
            }
            .registration-bill-print .rb-words {
              margin: 6px 0;
              font-size: var(--rb-base);
            }
            .registration-bill-print .rb-words-label {
              font-weight: 600;
            }
            .registration-bill-print .rb-words-value {
              font-weight: 700;
              margin-top: 2px;
              text-transform: none;
            }
            .registration-bill-print .rb-footer {
              margin-top: 14px;
              font-size: var(--rb-small);
              font-weight: 600;
            }
            .registration-bill-print .rb-sign {
              text-align: right;
              font-style: italic;
              margin-top: 18px;
              padding-right: 2px;
            }

            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 80mm !important;
                height: auto !important;
                min-height: 0 !important;
                display: block !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: #000000 !important;
                font-family: Arial, Helvetica, "DejaVu Sans", sans-serif !important;
              }
              body > *:not(.registration-bill-print) {
                display: none !important;
              }
              /* Center on the roll: full printable width + equal left/right padding */
              .registration-bill-print {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                visibility: visible !important;
                display: block !important;
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 auto !important;
                padding: 2.5mm 4mm !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: Arial, Helvetica, "DejaVu Sans", sans-serif !important;
                font-size: 11.5px !important;
                font-weight: 700 !important;
                line-height: 1.35 !important;
                overflow: visible !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
              }
              .registration-bill-print,
              .registration-bill-print * {
                visibility: visible !important;
                font-family: Arial, Helvetica, "DejaVu Sans", sans-serif !important;
                color: #000000 !important;
                border-color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .registration-bill-print .rb-hospital,
              .registration-bill-print .rb-title,
              .registration-bill-print .rb-meta,
              .registration-bill-print .rb-strong,
              .registration-bill-print .rb-name,
              .registration-bill-print .rb-sub,
              .registration-bill-print .rb-amount-box,
              .registration-bill-print .rb-words-value,
              .registration-bill-print .rb-charges-head,
              .registration-bill-print .rb-detail-label,
              .registration-bill-print .rb-footer {
                font-weight: 700 !important;
              }
              .registration-bill-print .rb-row-right,
              .registration-bill-print .rb-sign {
                padding-right: 0 !important;
              }
              .no-print, header, footer, nav, button, [role="dialog"], aside {
                display: none !important;
              }
            }

            /* Narrow thermal (~58mm) */
            @media print and (max-width: 62mm) {
              @page {
                size: 58mm auto;
                margin: 0;
              }
              html, body {
                width: 100% !important;
                max-width: 58mm !important;
              }
              .registration-bill-print {
                --rb-label-w: 17mm;
                --rb-base: 10.5px;
                --rb-small: 10px;
                --rb-title: 12px;
                --rb-name: 11.5px;
                --rb-amount: 12px;
                width: 100% !important;
                max-width: 58mm !important;
                margin: 0 auto !important;
                padding: 2mm 3mm !important;
              }
            }
          `,
        }}
      />

      {/* Header / Hospital Branding */}
      <div className="rb-header">
        <h2 className="rb-hospital">{hospitalName}</h2>
        <p className="rb-meta">OLD RAJANA THEATRE ROAD</p>
        <p className="rb-meta">OPP.MSN APPARTMENTS,KOOTTANAD</p>
        <p className="rb-meta">GSTIN :32BORPV3323K1ZJ</p>
        <p className="rb-meta">Mob :8505030406,6282803887</p>
      </div>

      {/* Bill Title */}
      <div className="rb-title-wrap">
        <h3 className="rb-title">Patient Registration Bill</h3>
      </div>

      {/* OP No & Date / Token No & Valid Upto */}
      <div className="rb-meta-rows">
        <div className="rb-row">
          <span className="rb-row-left">
            OP No / Date : <span className="rb-strong">{opNo}</span>
          </span>
          <span className="rb-row-right">{formattedDate}</span>
        </div>
        <div className="rb-row">
          <span className="rb-row-left">
            Token No : <span className="rb-strong">{displayToken}</span>
          </span>
          <span className="rb-row-right">Valid Upto : {validUptoDate}</span>
        </div>
      </div>

      <hr className="rb-rule" />

      {/* Consultant | Patient | Age/Sex */}
      <div className="rb-detail">
        <div className="rb-detail-row">
          <div className="rb-detail-label">
            Consultant
            <br />
            Name
          </div>
          <div className="rb-detail-value">
            <div className="rb-name">{docName}</div>
            {docQual && <div className="rb-sub">{docQual}</div>}
            {docSpec && <div className="rb-sub">{docSpec}</div>}
          </div>
        </div>

        <div className="rb-detail-row">
          <div className="rb-detail-label">
            Patient
            <br />
            Details
          </div>
          <div className="rb-detail-value">
            <div className="rb-name">{patientName}</div>
            {patientAddress && <div className="rb-sub">{patientAddress}</div>}
          </div>
        </div>

        <div className="rb-detail-row">
          <div className="rb-detail-label">Age/Sex</div>
          <div className="rb-detail-value">
            <div>{ageSex}</div>
            {patientPhone && <div>{patientPhone}</div>}
          </div>
        </div>
      </div>

      <hr className="rb-rule" />

      {/* Particulars & Amount */}
      <div>
        <div className="rb-charges-head">
          <span>Particulars</span>
          <span>Amount</span>
        </div>
        <div className="rb-charges-line">
          <span>Consultation Charges</span>
          <span className="rb-amount-box">{displayFee}</span>
        </div>
      </div>

      <hr className="rb-rule" />

      {/* Amount in Words */}
      <div className="rb-words">
        <div className="rb-words-label">Amount in Words :</div>
        <div className="rb-words-value">{words}</div>
      </div>

      {/* Footer / Signature */}
      <div className="rb-footer">
        <div>For {hospitalName.toUpperCase()}</div>
        <div className="rb-sign">(Sign)</div>
      </div>
    </div>
  );

  if (preview) {
    return content;
  }

  return createPortal(content, document.body);
}
