import React, { useEffect } from "react";
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import configuration from "@/config/configuration";

interface ReportCardProps {
    report: any | null;
}

export default function ReportCard({ report }: ReportCardProps) {
    useEffect(() => {
        if (report?.patient?.name && report?.patient?.mrn) {
            const originalTitle = document.title;
            const pid = report.patient.mrn.replace("MRN", "P-");
            const timestamp = fDateandTime(new Date());
            document.title = `${report.patient.name}_${pid}_${timestamp}`;
            return () => {
                document.title = originalTitle;
            };
        }
    }, [report]);
    if (!report) return null;

    const patient = report.patient;
    const doctor = report.doctor;

    return (
        <div className="print-prescription hidden print:block bg-white text-slate-900 font-sans leading-relaxed overflow-visible">
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
                <div className="bg-white text-slate-900 border-b border-slate-200 px-10 py-8">
                    <div className="flex justify-between items-start">
                        <HospitalName />
                        <div className="text-right space-y-2">
                            <span className="inline-block bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase hover:bg-slate-800 transition-colors">
                                LAB REPORT
                            </span>
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-slate-700 tracking-widest uppercase">Report No: {String(report.mrn).padStart(4, "0")}</p>
                                <p className="text-[10px] text-slate-500 tracking-widest font-semibold">LABORATORY INVESTIGATION</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-5 flex-1 flex flex-col gap-3 text-[13px]">
                    {/* PATIENT STRIP */}
                    <div className="border border-slate-200 rounded-lg px-6 py-4 flex flex-wrap gap-x-5 gap-y-2 bg-slate-50/50">
                        <Info label="Patient" value={patient?.name || "—"} />
                        <Info label="Age / G" value={`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / ${patient?.gender || "—"}`} />
                        <Info label="PID" value={patient?.mrn?.replace("MRN", "P-") || "—"} />
                        <Info label="Referred By" value={`DR. ${doctor?.name || "DIRECT"}`} />
                        <Info label="Sample Collected" value={report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).split(",")[0] : "—"} />
                        <Info label="Reported Date" value={report.createdAt ? fDateandTime(report.createdAt).split(",")[0] : "—"} />
                        <Info label="Printed Date" value={fDateandTime(new Date()).split(",")[0]} />
                    </div>

                    {/* TEST DETAILS */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 box-border">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 text-left w-1/3">Investigation</th>
                                    <th className="px-3 py-3 text-center">Result</th>
                                    <th className="px-3 py-3 text-center">Unit</th>
                                    <th className="px-3 py-3 text-left">Reference Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.test.map((t: any, i: number) => {
                                    // Check if out of range roughly
                                    const value = parseFloat(t.value);
                                    let isAbnormal = false;
                                    const min = t.name?.min;
                                    const max = t.name?.max;
                                    if (!isNaN(value) && ((min !== undefined && value < min) || (max !== undefined && value > max))) {
                                        isAbnormal = true;
                                    }
                                    return (
                                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-3 py-3">
                                                <p className="font-black text-slate-900 text-[12px]">{t.name?.name || "Unknown test"}</p>
                                            </td>
                                            <td className="px-3 py-3 text-center font-bold">
                                                <span className={isAbnormal ? "text-rose-600 font-black" : "text-slate-700"}>
                                                    {t.value || "—"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-500 text-xs font-medium">{t.name?.unit || "—"}</td>
                                            <td className="px-3 py-3 text-xs font-semibold text-slate-600">
                                                {min !== undefined && max !== undefined ? `${min} - ${max}` : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ADDITIONAL INFORMATION */}
                    <div className="border-2 border-slate-900 rounded-lg p-5 bg-slate-50">
                        <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Note</p>
                        <p className="text-slate-700 leading-relaxed font-bold italic text-[11px]">
                            {"This is a computer generated report and does not require a physical signature. The results should be correlated clinically."}
                        </p>
                    </div>

                    {/* SIGNATURE */}
                    <div className="mt-10 flex justify-end">
                        <div className="text-center w-64">
                            <div className="border-b-2 border-slate-900 mb-2 w-full"></div>
                            <p className="font-black text-slate-900 uppercase leading-none tracking-tighter">LAB IN-CHARGE</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{report.lab?.name || "LABORATORY"}</p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-slate-50 border-t border-slate-200 px-10 py-6 text-[10px] text-slate-500 flex justify-between items-center normal-case">
                    <div className="space-y-1">
                        <p className="text-slate-700 font-bold">Please consult your physician with this report.</p>
                        <p className="text-slate-500 font-medium">
                            For Appointments / Booking: <span className="text-slate-700 font-bold">{configuration().hospitalPhone} · {configuration().hospitalEmail}</span>
                        </p>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Powered by <span className="font-bold text-slate-700 tracking-tight uppercase">Synapse IT Services LLP</span>
                    </p>
                </div>
            </div>
            <Watermark />
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 min-h-6 items-center">
            <span className="text-slate-400 font-medium uppercase text-[10px] mt-0.5">{label}:</span>
            <span className="font-bold text-slate-900 line-clamp-2 leading-tight uppercase">{value}</span>
        </div>
    );
}
