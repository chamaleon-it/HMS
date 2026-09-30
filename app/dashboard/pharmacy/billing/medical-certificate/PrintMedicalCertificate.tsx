"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PrintFooter,
  PrintHeader,
} from "@/components/print/PrintHeader";
import {
  certificatePronouns,
  formatCertificateDate,
  formatDoctorName,
  resumeDate,
} from "./certificateFormat";

export interface MedicalCertificateRecord {
  _id: string;
  patientName: string;
  age: string;
  gender: "Male" | "Female";
  reason: string;
  dateFrom: string;
  dateTo: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegistrationNumber: string;
  doctorSignature?: string | null;
  createdAt?: string;
}

const Field = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold underline decoration-slate-800 underline-offset-[3px]">
    {children}
  </span>
);

export default function PrintMedicalCertificate({
  certificate,
}: {
  certificate: MedicalCertificateRecord | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!certificate || !mounted) return null;

  const pronouns = certificatePronouns(certificate.gender);
  const patientName = certificate.patientName.trim();
  const titledName = /^(mr|mrs|ms|miss)\.?\s+/i.test(patientName)
    ? patientName
    : `${pronouns.title} ${patientName}`;
  const fitFrom = formatCertificateDate(resumeDate(certificate.dateTo));

  return createPortal(
    <div className="print-medical-certificate hidden print:block bg-white text-black font-montserrat">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        @media print {
          @page { margin: 0; size: A4 portrait; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: auto !important;
            overflow: visible !important;
          }
          body > *:not(.print-medical-certificate) { display: none !important; }
          .print-medical-certificate {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .certificate-sheet {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            overflow: hidden !important;
          }
        }
      `,
        }}
      />
      <article className="certificate-sheet relative flex flex-col bg-white text-black">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt=""
            className="h-[8cm] w-[8cm] object-contain opacity-10 grayscale"
          />
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <PrintHeader
          logoUrl="/print/logo.png"
          showSocials
          socialHandles={{
            youtube: "Bhumi_wellness",
            instagram: "bhumi_wellness_",
            email: "bhuminaturecure@gmail.com",
          }}
        />

        <div className="flex flex-1 flex-col px-12 pb-8 pt-10">
          <h1 className="text-center text-[22px] font-bold uppercase tracking-[0.22em] underline underline-offset-[6px]">
            Medical Certificate
          </h1>

          <p className="mt-12 text-justify text-[15px] leading-8 text-slate-900">
            This is to certify that <Field>{titledName}</Field> aged{" "}
            <Field>{certificate.age}</Field> was under my treatment for{" "}
            <Field>{certificate.reason}</Field> from{" "}
            <Field>{formatCertificateDate(certificate.dateFrom)}</Field> to{" "}
            <Field>{formatCertificateDate(certificate.dateTo)}</Field>.{" "}
            {pronouns.subject} has been advised complete rest and medical leave
            for the above period.
          </p>

          <p className="mt-6 text-justify text-[15px] leading-8 text-slate-900">
            {pronouns.subject} is fit to resume {pronouns.possessive} normal
            duties from <Field>{fitFrom}</Field>. {pronouns.subject} is advised
            to avoid long journeys and hard work.
          </p>

          <div className="mt-auto flex items-end justify-end pt-16">
            <div className="min-w-52 text-right">
              {certificate.doctorSignature ? (
                <img
                  src={certificate.doctorSignature}
                  alt=""
                  className="ml-auto mb-1 h-14 w-auto max-w-44 object-contain"
                />
              ) : (
                <div className="mb-2 h-14" />
              )}
              <p className="text-sm font-bold uppercase tracking-wide text-black">
                {formatDoctorName(certificate.doctorName)}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                {certificate.doctorQualification}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Reg. No: {certificate.doctorRegistrationNumber}
              </p>
            </div>
          </div>
        </div>

        <PrintFooter
          hospitalAddress="Old Rajama Theatre Rd, Opp. MSN Appartments, Koottanad"
          hospitalPhone="8505030406, 6282803887"
        />
        </div>
      </article>
    </div>,
    document.body,
  );
}
