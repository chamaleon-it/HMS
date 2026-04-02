import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime } from "@/lib/fDateAndTime";
import Watermark from "@/components/print/Watermark";
import HospitalName from "@/components/print/HospitalName";
import { Badge } from "@/components/ui/badge";

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
        <div className="print-prescription hidden print:block bg-white text-black font-sans leading-tight overflow-visible">
            <svg width="0" height="0" className="absolute z-[-1]" style={{ width: 0, height: 0, visibility: 'hidden' }}>
                <filter id="edge-detect-hms" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" result="gray" />
                    <feConvolveMatrix order="3 3" preserveAlpha="true" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="gray" />
                </filter>
            </svg>
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
            margin: 0 !important;
            background: white !important;
            z-index: 999999999 !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
          .a4-page {
            width: 21cm;
            height: 29.4cm !important; /* 📏 3mm SAFETY MARGIN TO strictly PREVENT EXTRA PAGE */
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            background: white;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
            flex-shrink: 0;
            z-index: 10 !important;
          }
          .print-page-break {
            page-break-after: always !important;
          }
          .print-page-last {
            page-break-after: auto !important;
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
            opacity: 0.25 !important; /* 🛡️ FORCED VISIBILITY FOR PRINTERS */
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
            gap: 4px;
            padding: 5px 40px 15px 40px;
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
                const FIRST_PAGE_LIMIT = 28;
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
                        <div key={pageIdx} className={`a4-page shadow-none bg-white ${isLastPage ? 'print-page-last' : 'print-page-break'}`}>
                            {/* 🏥 ATOMIC WATERMARK (DIRECT INLINE) */}
                            <div className="watermark-print">
                                <img src="/print/logo.png" alt="watermark" className="w-[12cm] grayscale object-contain" style={{ opacity: 0.50 }} />
                            </div>

                            {/* 🏥 DIGITAL HEADER */}
                            <div className="bg-white text-black px-10 py-8">
                                <div className="flex justify-between items-start">
                                    <HospitalName />
                                    <div className="text-right space-y-2">
                                        <Badge className="bg-black text-white border-none px-3 py-1 font-bold text-xs hover:bg-slate-800 tracking-widest uppercase">Lab Report</Badge>
                                        <div className="space-y-0.5">
                                            {/* <p className="text-sm font-medium">Report ID: <span className="font-bold">{report._id?.toString().slice(-8).toUpperCase() || "—"}</span></p> */}
                                            <p className="text-[11px] text-black">{fDateandTime(new Date())}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="report-body">
                                {isFirstPage && (
                                    <div className="mb-3 pt-3 pb-3 border-y border-slate-300">
                                        <div className="grid grid-cols-2 gap-x-8 text-[12px] font-semibold text-slate-800 tracking-tight px-2">
                                            <div className="space-y-1">
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Name</span><span className="font-bold text-slate-900">: {patient?.name || "—"}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Age/Sex</span><span className="font-bold text-slate-900">: {`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yr` : "—"} / ${patient?.gender || "—"}`}</span></div>
                                                {/* <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Ref. By.</span><span className="font-bold text-slate-900">: {doctor?.name ? `Dr. ${doctor.name}` : "DIRECT"}</span></div> */}
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Ref. By.</span><span className="font-bold text-slate-900">: Dr. Nadirsha</span></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Collected Date</span><span className="font-bold text-slate-900">: {report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).split(",")[0] : "—"} </span></div>
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Reported Date</span><span className="font-bold text-slate-900">: {report.createdAt ? fDateandTime(report.createdAt).split(",")[0] : "—"}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-slate-500 font-medium">Printed Date</span><span className="font-bold text-slate-900">: {fDateandTime(new Date()).split(",")[0]}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* UNIFIED HEADER ROW */}
                                <div className="flex w-full bg-slate-200/50 border-y border-slate-300 text-[11px] font-bold text-black items-stretch relative z-8">
                                    <div className={`${pageHasCBC ? 'w-[65%]' : 'w-full'} pr-2`}>
                                        <table className="results-table w-full h-full border-none m-0">
                                            <colgroup>
                                                <col className="col-investigation" />
                                                <col className="col-result" />
                                                <col className="col-unit" />
                                                <col className="col-ref" />
                                            </colgroup>
                                            <thead className="bg-transparent border-none">
                                                <tr>
                                                    <th className="px-2 py-[5.5px] text-left">Parameter</th>
                                                    <th className="px-2 py-[5.5px] text-right">Result</th>
                                                    <th className="px-2 py-[5.5px] text-center">Unit</th>
                                                    <th className="px-2 py-[5.5px] text-left">Ref. Range</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                    {pageHasCBC && (
                                        <div className="w-[35%] flex items-center pl-6">
                                            <div className="uppercase tracking-wider">Histograms</div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT BODY */}
                                <div className="flex w-full gap-2 relative">
                                    <div className={`${pageHasCBC ? 'w-[65%]' : 'w-full'} pr-2`}>
                                        <table className="results-table">
                                            <colgroup>
                                                <col className="col-investigation" />
                                                <col className="col-result" />
                                                <col className="col-unit" />
                                                <col className="col-ref" />
                                            </colgroup>
                                            <tbody>
                                                {pageRows.map((row, rowIdx) => {
                                                    if (row.type === "PANEL") {
                                                        return (
                                                            <tr key={`panel-${rowIdx}`}>
                                                                <td colSpan={4} className="px-2 pt-3 pb-3">
                                                                    {row.name.toUpperCase() === "CBC" ? (
                                                                        <p className="font-black text-black text-[12px] uppercase tracking-widest mt-1">HEMATOLOGY ANALYSIS REPORT</p>
                                                                    ) : (
                                                                        <p className="font-black text-black text-[10px] uppercase tracking-widest mt-1">{row.name}</p>
                                                                    )}
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
                                                    const isMainTest = ["WBC", "HGB", "RBC", "PLT", "ESR"].some(main => typeof row.name?.name === 'string' && row.name.name.startsWith(main));
                                                    
                                                    // Add space before main tests to separate groups visually, unless it's the very first test below a panel heading
                                                    const renderSpacer = isMainTest && rowIdx > 0 && pageRows[rowIdx - 1]?.type !== "PANEL";

                                                    return (
                                                        <React.Fragment key={`test-wrap-${rowIdx}`}>
                                                            {renderSpacer && (
                                                                <tr className="h-2">
                                                                    <td colSpan={4}></td>
                                                                </tr>
                                                            )}
                                                            <tr key={`test-${rowIdx}`}>
                                                                <td className="px-2 py-1">
                                                                    <p className={`text-[11px] leading-tight ${isMainTest ? 'font-bold text-black' : 'font-medium text-slate-700 pl-4'}`}>
                                                                        {row.name?.name || "Unknown test"}
                                                                    </p>
                                                                </td>
                                                            <td className="px-2 py-1 text-right font-bold text-[11px] leading-tight">
                                                                <span className={isAbnormal ? "text-rose-600 font-black" : "text-black"}>
                                                                    {row.value || "—"}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1 text-center text-black text-[10px] font-medium leading-tight">
                                                                {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? (
                                                                    <span dangerouslySetInnerHTML={{ __html: row.name.unit }} />
                                                                ) : (
                                                                    "—"
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-1 text-[10px] font-semibold text-black leading-tight">
                                                                {min !== undefined && max !== undefined ? `${min} - ${max}` : "—"}
                                                            </td>
                                                        </tr>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {pageHasCBC && (
                                        <div className="w-[35%] flex flex-col pt-0 pl-2 relative right-0">
                                            <div className="flex flex-col gap-3 px-2 py-13">
                                                {/* WBC Graph */}
                                                {report?.graphs?.['WBC Histogram. BMP'] ? (
                                                    <div className="flex flex-col flex-1">
                                                        <div className="text-[11px] font-bold text-black self-start tracking-widest">WBC</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['WBC Histogram. BMP']}`}
                                                            alt="WBC Histogram"
                                                            className="w-full h-[120px] object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) contrast(500%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col flex-1">
                                                        <div className="text-[10px] font-bold text-slate-400 self-start">WBC</div>
                                                        <div className="w-full h-[120px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">WBC Graph Area</div>
                                                    </div>
                                                )}

                                                {/* RBC Graph */}
                                                {report?.graphs?.['RBC Histogram. BMP'] ? (
                                                    <div className="flex flex-col flex-1 mt-1 py-8">
                                                        <div className="text-[11px] font-bold text-black self-start tracking-widest">RBC</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['RBC Histogram. BMP']}`}
                                                            alt="RBC Histogram"
                                                            className="w-full h-[120px] object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) contrast(500%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col flex-1 mt-1">
                                                        <div className="text-[10px] font-bold text-slate-400 self-start">RBC</div>
                                                        <div className="w-full h-[120px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">RBC Graph Area</div>
                                                    </div>
                                                )}

                                                {/* PLT Graph */}
                                                {report?.graphs?.['PLT Histogram. BMP'] ? (
                                                    <div className="flex flex-col flex-1 mt-1 py-8">
                                                        <div className="text-[11px] font-bold text-black self-start tracking-widest">PLT</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['PLT Histogram. BMP']}`}
                                                            alt="PLT Histogram"
                                                            className="w-full h-[120px] object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) contrast(500%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col flex-1 mt-1">
                                                        <div className="text-[10px] font-bold text-slate-400 self-start">PLT</div>
                                                        <div className="w-full h-[120px] border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-[10px]">PLT Graph Area</div>
                                                    </div>
                                                )}
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
                                            <div className="text-center w-64 mt-5">
                                                {/* <div className="border-b-2 border-slate-900 mb-2 w-full"></div> */}
                                                <p className="font-black text-slate-900 uppercase leading-none tracking-tighter text-[11px]">LAB IN-CHARGE</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{report.technician || "LABORATORY"}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="bg-slate-50 border-t border-slate-500 px-2 py-0 text-[10px] text-black flex justify-between items-center footer">
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
