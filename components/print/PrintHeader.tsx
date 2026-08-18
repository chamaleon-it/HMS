import React, { useState } from "react";
import { Mail } from "lucide-react";
import configuration from "@/config/configuration";
import { cn } from "@/lib/utils";

export interface PrintHeaderProps {
  logoUrl?: string;
  hospitalName?: string;
  hospitalEmail?: string;
  hospitalPhone?: string;
  title?: string;
  subTitle?: string;
  socialHandles?: {
    youtube?: string;
    instagram?: string;
    email?: string;
  };
  showSocials?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

export function PrintHeader({
  logoUrl: propLogoUrl,
  hospitalName: propHospitalName,
  hospitalEmail: propHospitalEmail,
  hospitalPhone: propHospitalPhone,
  title,
  subTitle,
  socialHandles,
  showSocials = true,
  rightContent,
  className,
}: PrintHeaderProps) {
  const logoUrl = propLogoUrl || configuration().logo || "/logo.png";
  const [logoError, setLogoError] = useState(false);
  const hospitalName =
    propHospitalName || configuration().hospitalName || "BHUMI";
  const hospitalEmail =
    propHospitalEmail || configuration().hospitalEmail || "info@bhumiwellness.com";
  const ytHandle = socialHandles?.youtube || "bhumi wellness";
  const igHandle = socialHandles?.instagram || "bhumi_wellness_";
  const emailHandle = socialHandles?.email || hospitalEmail;

  return (
    <div
      className={cn(
        "relative flex justify-between items-stretch border-b border-slate-700 min-h-20 bg-white font-montserrat",
        className
      )}
    >
      {/* Top Left Dark Ribbon with Angle */}
      {showSocials ? (
        <div
          className="w-[48%] bg-synapse-light text-white pt-2.5 pb-2.5 pl-6 pr-8 flex flex-col justify-center space-y-1 relative"
          style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
            <svg
              className="w-3.5 h-3.5 text-white shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>{ytHandle}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
            <svg
              className="w-3.5 h-3.5 text-white shrink-0 fill-none stroke-current stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>{igHandle}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
            <Mail className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">{emailHandle}</span>
          </div>
        </div>
      ) : (
        <div className="w-[48%]" />
      )}

      {/* Top Right Logo & Brand */}
      <div className="flex items-center gap-3 pr-8 pt-2 pb-1.5 ml-auto">
        <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
          {!logoError ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#849a8c]">
              <path
                fill="currentColor"
                opacity="0.3"
                d="M50 5 C25 5, 5 25, 5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50 C95 25, 75 5, 50 5 Z M50 15 C69.3 15, 85 30.7, 85 50 C85 69.3, 69.3 85, 50 85 C30.7 85, 15 69.3, 15 50 C15 30.7, 30.7 15, 50 15 Z"
              />
              <text
                x="32"
                y="66"
                fontFamily="sans-serif"
                fontSize="42"
                fontWeight="300"
                fill="#7a9483"
              >
                b
              </text>
              <text
                x="52"
                y="66"
                fontFamily="sans-serif"
                fontSize="42"
                fontWeight="300"
                fill="#7a9483"
              >
                m
              </text>
              <path fill="#7a9483" d="M62 25 Q70 20 72 28 Q64 35 62 25 Z" />
            </svg>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-synapse-light uppercase font-montserrat leading-tight">
            {hospitalName}
          </h1>
          {subTitle && (
            <p className="text-[10px] text-slate-600 font-medium">{subTitle}</p>
          )}
          {title && (
            <p className="text-[11px] font-bold tracking-wider text-slate-800 uppercase font-montserrat mt-0.5">
              {title}
            </p>
          )}
          {rightContent}
        </div>
      </div>
    </div>
  );
}

export default PrintHeader;

export interface PrintPatientStripProps {
  name?: string;
  age?: string;
  sex?: string;
  date?: string;
  opNo?: string;
  className?: string;
}

export function PrintPatientStrip({
  name,
  age,
  sex,
  date,
  opNo,
  className,
}: PrintPatientStripProps) {
  return (
    <div
      className={cn(
        "px-6 py-1.5 flex items-center justify-between border-b border-slate-700 text-[13px] font-bold text-black bg-white font-montserrat",
        className
      )}
    >
      <div className="flex items-center gap-6 flex-1 pr-4">
        <div className="flex items-center gap-2 flex-1 min-w-44">
          <span className="text-slate-800">Name:</span>
          <span className="font-semibold text-black text-[13.5px] border-b border-dotted border-slate-500 flex-1 px-1 min-h-5 leading-normal truncate">
            {name || ""}
          </span>
        </div>
        <div className="flex items-center gap-2 w-24">
          <span className="text-slate-800">Age:</span>
          <span className="font-semibold text-black text-[13.5px] border-b border-dotted border-slate-500 flex-1 text-center min-h-5 leading-normal">
            {age || "____"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-20">
          <span className="text-slate-800">Sex:</span>
          <span className="font-semibold text-black text-[13.5px] border-b border-dotted border-slate-500 flex-1 text-center min-h-5 leading-normal">
            {sex || "____"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-32">
          <span className="text-slate-800">Date:</span>
          <span className="font-semibold text-black text-[13.5px] border-b border-dotted border-slate-500 flex-1 text-center min-h-5 leading-normal">
            {date || "__________"}
          </span>
        </div>
      </div>

      {/* OP No Pill Box */}
      <div className="border border-slate-700 rounded-full px-3.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-white shadow-xs">
        <span className="text-slate-700">OP No: </span>
        <span className="min-w-14 inline-block text-slate-900 tracking-wider font-extrabold">
          {opNo || "...................."}
        </span>
      </div>
    </div>
  );
}

export function PrintWatermark({ className }: { className?: string }) {
  const logoUrl = configuration().logo || "/logo.png";
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none opacity-10",
        className
      )}
    >
      {!logoError ? (
        <img
          src={logoUrl}
          alt="Watermark"
          className="w-[14cm] max-h-[80%] object-contain grayscale"
          onError={() => setLogoError(true)}
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-[14cm] h-[14cm] text-[#7a9483]">
          <path
            fill="currentColor"
            opacity="0.3"
            d="M50 5 C25 5, 5 25, 5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50 C95 25, 75 5, 50 5 Z M50 15 C69.3 15, 85 30.7, 85 50 C85 69.3, 69.3 85, 50 85 C30.7 85, 15 69.3, 15 50 C15 30.7, 30.7 15, 50 15 Z"
          />
          <text
            x="32"
            y="66"
            fontFamily="sans-serif"
            fontSize="42"
            fontWeight="300"
            fill="currentColor"
          >
            b
          </text>
          <text
            x="52"
            y="66"
            fontFamily="sans-serif"
            fontSize="42"
            fontWeight="300"
            fill="currentColor"
          >
            m
          </text>
          <path fill="currentColor" d="M62 25 Q70 20 72 28 Q64 35 62 25 Z" />
        </svg>
      )}
    </div>
  );
}

export interface PrintSignatureProps {
  doctorName?: string;
  specialization?: string;
  signature?: string;
  label?: string;
  className?: string;
}

export function PrintSignature({
  doctorName,
  specialization,
  signature,
  label,
  className,
}: PrintSignatureProps) {
  const formattedDoctorName = doctorName
    ? doctorName.toUpperCase().startsWith("DR.")
      ? doctorName.toUpperCase()
      : `DR. ${doctorName.toUpperCase()}`
    : label || "Doctor's Signature";

  return (
    <div
      className={cn(
        "mt-auto pt-2 flex justify-end relative z-10 font-montserrat",
        className
      )}
    >
      <div className="text-right space-y-0.5 pr-4 min-w-48">
        {signature ? (
          <img
            src={signature}
            alt="Signature"
            className="h-10 w-auto max-w-40 object-contain ml-auto mb-0.5"
          />
        ) : (
          <div className="w-48 border-b-2 border-slate-700 border-dashed mb-1 ml-auto"></div>
        )}
        <p className="font-black text-xs text-black uppercase tracking-wide">
          {formattedDoctorName}
        </p>
        {specialization && (
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">
            {specialization}
          </p>
        )}
      </div>
    </div>
  );
}

export interface PrintFooterProps {
  pageNumber?: number;
  totalPages?: number;
  hospitalAddress?: string;
  hospitalPhone?: string;
  leftContent?: React.ReactNode;
  note?: string;
  className?: string;
}

export function PrintFooter({
  pageNumber,
  totalPages,
  hospitalAddress,
  hospitalPhone,
  leftContent,
  note,
  className,
}: PrintFooterProps = {}) {
  const address =
    hospitalAddress ||
    configuration().hospitalAddress ||
    "Old Rajana Theatre Bld, Opp. MSN Apartments, Koottanad";
  const phone =
    hospitalPhone || configuration().hospitalPhone || "8505030406";

  return (
    <div
      className={cn(
        "relative flex justify-between items-stretch border-t border-slate-700 mt-auto min-h-14 bg-white font-montserrat",
        className
      )}
    >
      {/* Optional Page Number Indicator / Custom Content on Left */}
      <div className="flex items-center pl-6 text-[10.5px] font-bold text-slate-600 tracking-wider">
        {leftContent ? (
          leftContent
        ) : totalPages && totalPages > 1 && pageNumber ? (
          <span>
            Page {pageNumber} of {totalPages}
          </span>
        ) : note ? (
          <span>{note}</span>
        ) : null}
      </div>

      {/* Bottom Right Angled Ribbon */}
      <div
        className="w-[62%] bg-synapse-light text-white pt-2 pb-2 pr-8 pl-12 flex flex-col items-end justify-center space-y-0.5 relative ml-auto"
        style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <p className="text-[10.5px] font-semibold tracking-wide text-slate-100">
          {address}
        </p>
        <p className="text-[10.5px] font-semibold tracking-wide text-slate-100">
          Booking No: <span className="font-bold">{phone}</span>
        </p>
      </div>
    </div>
  );
}
