import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";

interface ReportCardProps {
    report: any | null;
}

export default function ReportCard({ report }: ReportCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    const content = (
        <div className="print-prescription hidden print:flex print:flex-col bg-white text-black font-sans leading-relaxed overflow-visible">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          /* Hide all other elements in body so they don't take up pages */
          body > *:not(.print-prescription):not(script):not(style) {
            display: none !important;
          }
          html, body {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            visibility: visible !important;
            overflow: visible !important;
          }
          .print-prescription { 
            visibility: visible !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            overflow: visible !important;
            z-index: 999999999 !important;
          }
          .print-prescription * {
             visibility: visible !important;
          }
          .a4-page {
            width: 21cm;
            height: 29.6cm !important; /* 📏 1mm SAFETY MARGIN TO PREVENT EXTRA PAGE */
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            background: white;
            position: relative;
            page-break-after: always;
            box-sizing: border-box;
            overflow: hidden;
            flex-shrink: 0;
            z-index: 10 !important;
          }
          .a4-page:last-child {
            page-break-after: avoid !important;
            margin-bottom: 0 !important;
          }
          .watermark-print {
            position: absolute !important;
            inset: 0 !important;
            z-index: 0 !important; /* 🏥 ABOVE PAGE BASE, BELOW CONTENT */
            pointer-events: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .watermark-print, .watermark-print *, .watermark-print img {
            visibility: visible !important;
            display: flex !important;
            opacity: 0.15 !important; /* 🛡️ FORCED VISIBILITY FOR PRINTERS */
          }
          .header-reservoir {
             height: 4.5cm; /* 🏥 FIXED Letterhead Reservoir (Blank) */
             width: 100%;
             visibility: hidden !important;
          }
          .report-body {
            padding: 0 40px;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 20 !important; /* 🟢 CONTENT ABOVE WATERMARK */
          }
          .results-table {
            table-layout: fixed;
            width: 100%;
            border-collapse: collapse;
          }
          .col-investigation { width: 40%; }
          .col-result { width: 22%; }
          .col-unit { width: 13%; }
          .col-ref { width: 25%; }

          .bottom-grouping {
            margin-top: auto; /* ⚡ PINNED TO PAGE BOTTOM */
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px 40px 20px 40px;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 20 !important; /* 🟢 CONTENT ABOVE WATERMARK */
          }
          .signature-section {
            page-break-inside: avoid !important;
          }
          .note-section {
            page-break-inside: avoid !important;
          }
          .footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
 
            {(() => {
                const FIRST_PAGE_LIMIT = 24;
                const SUBSEQUENT_PAGE_LIMIT = 30;

                // 1. Prepare All Rows (Panel Headers + Tests)
                const testOrderMap = new Map<string, number>();
                const testToPanelMap = new Map<string, string>();
                let orderIndex = 0;

                (report.panels || []).forEach((panelIdStr: string) => {
                    const panelId = panelIdStr.toString();
                    const panelTests = (report.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));
                    panelTests.forEach((t: any) => {
                        const id = t.name?._id?.toString() || "";
                        if (!testToPanelMap.has(id)) testToPanelMap.set(id, panelId);
                    });

                    let orderedIds: string[] = [];
                    for (const t of panelTests) {
                        const panelDef = t.name?.panels?.find((p: any) => p.name === panelId);
                        if (panelDef?.tests?.length) {
                            orderedIds = panelDef.tests.map((testObj: any) => testObj?._id ? testObj._id.toString() : testObj.toString());
                            break;
                        }
                    }

                    if (orderedIds.length > 0) {
                        orderedIds.forEach(id => {
                            if (!testOrderMap.has(id.toString())) testOrderMap.set(id.toString(), orderIndex++);
                        });
                    } else {
                        panelTests.forEach((t: any) => {
                            if (!testOrderMap.has(t.name?._id?.toString() || "")) testOrderMap.set(t.name?._id?.toString() || "", orderIndex++);
                        });
                    }
                });

                const sortedTests = [...(report.test || [])].sort((a: any, b: any) => {
                    const aId = a.name?._id?.toString() || "";
                    const bId = b.name?._id?.toString() || "";
                    const aOrder = testOrderMap.has(aId) ? testOrderMap.get(aId)! : 999999;
                    const bOrder = testOrderMap.has(bId) ? testOrderMap.get(bId)! : 999999;
                    return aOrder - bOrder;
                });

                const allRows: any[] = [];
                let lastPanelId = "";
                sortedTests.forEach((t: any) => {
                    const tId = t.name?._id?.toString() || "";
                    const currentPanelId = testToPanelMap.get(tId) || "";
                    if (currentPanelId && currentPanelId !== lastPanelId) {
                        allRows.push({ type: "PANEL", name: currentPanelId, activePanel: currentPanelId });
                        lastPanelId = currentPanelId;
                    }
                    allRows.push({ type: "TEST", ...t, activePanel: lastPanelId });
                });

                // 2. Chunk Into Pages
                const pages: any[][] = [];
                let currentIndex = 0;
                while (currentIndex < allRows.length) {
                    const isFirstPage = pages.length === 0;
                    const limit = isFirstPage ? FIRST_PAGE_LIMIT : SUBSEQUENT_PAGE_LIMIT;
                    pages.push(allRows.slice(currentIndex, currentIndex + limit));
                    currentIndex += limit;
                }
                if (pages.length === 0) pages.push([]); // Guarantee at least one page

                const firstCBCPageIdx = pages.findIndex(page => 
                    page.some(row => {
                        const pName = row.activePanel || row.name;
                        return pName && typeof pName === 'string' && pName.toUpperCase().includes("CBC");
                    })
                );

                // 3. Render Pages
                return pages.map((pageRows, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const isLastPage = pageIdx === pages.length - 1;
                    const pageHasCBC = pageIdx === firstCBCPageIdx;

                    return (
                        <div key={pageIdx} className="a4-page shadow-none bg-white">
                            {/* 🏥 ATOMIC WATERMARK (DIRECT INLINE) */}
                            <div className="watermark-print">
                                <img src="/print/logo.png" alt="watermark" className="w-[12cm] grayscale object-contain" style={{ opacity: 0.15 }} />
                            </div>

                            {/* 🏥 HEADER RESERVOIR (BLANK SPACE FOR LETTERHEAD) */}
                            <div className="header-reservoir"></div>

                            {/* BODY */}
                            <div className="report-body">
                                {isFirstPage && (
                                    <div className="mb-2 border border-slate-500 rounded-lg px-4 py-2 flex flex-wrap gap-x-4 gap-y-0.5 bg-slate-50/50">
                                        <Info label="Patient" value={patient?.name || "—"} />
                                        <Info label="Age / G" value={`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}Y` : "—"} / ${patient?.gender || "—"}`} />
                                        <Info label="PID" value={patient?.mrn?.replace("MRN", "P-") || "—"} />
                                        <Info label="Referred By" value={`DR. ${doctor?.name || "DIRECT"}`} />
                                        <Info label="Reported Date" value={report.createdAt ? fDateandTime(report.createdAt).split(",")[0] : "—"} />
                                        <Info label="Sample Collected" value={report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).split(",")[0] : "—"} />
                                        <Info label="Printed Date" value={fDateandTime(new Date()).split(",")[0]} />
                                    </div>
                                )}

                                <div className="flex w-full gap-4 relative">
                                    <div className={`border border-slate-500 rounded-lg overflow-hidden ${pageHasCBC ? "w-[65%]" : "w-full"}`}>
                                        <table className="results-table">
                                        <thead className="bg-slate-50 text-[11px] font-bold text-black border-b border-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-2 py-1.5 text-left col-investigation">Investigation</th>
                                                <th className="px-2 py-1.5 text-right col-result">Result</th>
                                                <th className="px-2 py-1.5 text-center col-unit">Unit</th>
                                                <th className="px-2 py-1.5 text-left col-ref">Reference Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageRows.map((row, rowIdx) => {
                                                if (row.type === "PANEL") {
                                                    return (
                                                        <tr key={`panel-${rowIdx}`} className="bg-slate-100/50">
                                                            <td colSpan={4} className="px-3 py-1.5 border-b border-slate-200">
                                                                <p className="font-black text-black text-[11px] uppercase tracking-widest">{row.name}</p>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                const value = parseFloat(row.value);
                                                let isAbnormal = false;
                                                const min = row.name?.min;
                                                const max = row.name?.max;
                                                if (!isNaN(value) && ((min !== undefined && value < min) || (max !== undefined && value > max))) {
                                                    isAbnormal = true;
                                                }
                                                return (
                                                    <tr key={`test-${rowIdx}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/10">
                                                        <td className="px-2 py-[1px]">
                                                            <p className="font-black text-black text-[12px]">
                                                                {row.name?.name || "Unknown test"}
                                                            </p>
                                                        </td>
                                                        <td className="px-2 py-[1px] text-right font-bold">
                                                            <span className={isAbnormal ? "text-rose-600 font-black" : "text-black"}>
                                                                {row.value || "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-[1px] text-center text-black text-xs font-medium">
                                                            {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? (
                                                                <span dangerouslySetInnerHTML={{ __html: row.name.unit }} />
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-[1px] text-xs font-semibold text-black">
                                                            {min !== undefined && max !== undefined ? `${min} - ${max}` : "—"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {pageHasCBC && (
                                    <div className="w-[35%] flex flex-col gap-3 py-2 px-2 border-l-2 border-slate-100 relative right-0">
                                        {/* CBC Graph Spaces */}
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="text-[10px] font-bold text-slate-500 mb-0.5 self-start ml-2">WBC Histogram</div>
                                            <div className="w-full h-[150px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">WBC Graph Area</div>
                                        </div>
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="text-[10px] font-bold text-slate-500 mb-0.5 self-start ml-2">RBC Histogram</div>
                                            <div className="w-full h-[150px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">RBC Graph Area</div>
                                        </div>
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="text-[10px] font-bold text-slate-500 mb-0.5 self-start ml-2">PLT Histogram</div>
                                            <div className="w-full h-[150px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">PLT Graph Area</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                            {/* SIGNATURE & FOOTER (Pinned to Bottom) */}
                            <div className="bottom-grouping">
                                {isLastPage && (
                                    <>
                                        <div className="border-2 border-black rounded-lg p-2 bg-slate-50 note-section">
                                            <p className="font-black text-[10px] uppercase tracking-widest text-black mb-1">Note</p>
                                            <p className="text-black leading-relaxed font-bold italic text-[11px]">
                                                {"The results should be correlated clinically."}
                                            </p>
                                        </div>

                                        <div className="flex justify-end signature-section pb-0">
                                            <div className="text-center w-64">
                                                <div className="border-b-2 border-slate-900 mb-2 w-full"></div>
                                                <p className="font-black text-slate-900 uppercase leading-none tracking-tighter text-[11px]">LAB IN-CHARGE</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{report.technician || "LABORATORY"}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="bg-slate-50 border-t border-slate-500 px-4 py-0 text-[10px] text-black flex justify-between items-center footer">
                                    <div className="space-y-0">
                                        <p className="text-black font-bold text-[9px]">Please consult your physician with this report.</p>
                                        <p className="text-black font-medium text-[9px]">For Appointments: <span className="font-bold">+91 83019 26155 · 04931 240077</span></p>
                                    </div>
                                    <p className="text-black font-medium text-[9px]">Powered by <span className="font-bold">Synapse IT Services LLP</span></p>
                                </div>
                            </div>
                        </div>
                    );
                });
            })()}
        </div>
    );

    if (!mounted) return null;
    return createPortal(content, document.body);
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-1.5 min-h-[18px] items-center">
            <span className="text-black font-medium uppercase text-[10px] mt-0.5">{label}:</span>
            <span className="font-bold text-black text-[11px] line-clamp-2 leading-tight uppercase">{value}</span>
        </div>
    );
}
