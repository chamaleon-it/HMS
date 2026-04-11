import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime } from "@/lib/fDateAndTime";
import HospitalName from "@/components/print/HospitalName";


interface ReportCardProps {
    report: any | null;
    panels?: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[] }[];
}

export default function ReportCard({ report, panels }: ReportCardProps) {
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
            font-family: 'Roboto', sans-serif;
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
            height: 29.7cm !important; /* 📏 FULL A4 HEIGHT */
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
          .col-result { width: 10%; }
          .col-unit { width: 14%; }
          .col-ref { width: 22%; }
          .col-note { width: 14%; }

          .bottom-grouping {
            margin-top: auto; /* ⚡ PINNED TO PAGE BOTTOM */
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 5px 0 0 0;
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
                const FIRST_PAGE_LIMIT = 30;
                const SUBSEQUENT_PAGE_LIMIT = 30;

                // 1. Prepare All Rows (Panel Headers + Tests)
                const allRows: any[] = [];
                const testMap = new Map<string, any>();
                (report.test || []).forEach((t: any) => {
                    testMap.set(t.name?._id?.toString() || "", t);
                });

                const processedTestIds = new Set<string>();

                (report.panels || []).forEach((panelIdStr: string) => {
                    const panelId = panelIdStr.toString();
                    const panelTests = (report.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));
                    if (panelTests.length === 0) return;

                    const panelConfig = panels?.find(p => p.name === panelId);

                    allRows.push({
                        type: "PANEL",
                        name: panelId,
                        activePanel: panelId,
                        mainHeading: panelConfig?.mainHeading
                    });

                    let orderedIds: string[] = [];
                    for (const t of panelTests) {
                        const panelDef = t.name?.panels?.find((p: any) => p.name === panelId);
                        if (panelDef?.tests?.length) {
                            orderedIds = panelDef.tests.map((testObj: any) => testObj?._id ? testObj._id.toString() : testObj.toString());
                            break;
                        }
                    }

                    if (orderedIds.length === 0) {
                        orderedIds = panelTests.map((t: any) => t.name?._id?.toString() || "");
                    }

                    const subheadings = panelConfig?.subheadings || [];
                    const testSubheadings = panelConfig?.testSubheadings || {};

                    subheadings.forEach(sub => {
                        const subTestIds = orderedIds.filter(id => testSubheadings[id] === sub && testMap.has(id));
                        if (subTestIds.length > 0) {
                            allRows.push({ type: "SUBHEADING", name: sub, activePanel: panelId });
                            subTestIds.forEach(id => {
                                allRows.push({ type: "TEST", ...testMap.get(id), activePanel: panelId, hasSubheading: true });
                                processedTestIds.add(id);
                                testMap.delete(id);
                            });
                        }
                    });

                    orderedIds.forEach(id => {
                        if (!processedTestIds.has(id) && testMap.has(id)) {
                            allRows.push({ type: "TEST", ...testMap.get(id), activePanel: panelId, hasSubheading: false });
                            processedTestIds.add(id);
                            testMap.delete(id);
                        }
                    });
                });

                Array.from(testMap.values()).forEach((t: any) => {
                    allRows.push({ type: "TEST", ...t, activePanel: "" });
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
                        <div key={pageIdx} className={`a4-page shadow-none bg-white font-roboto ${isLastPage ? 'print-page-last' : 'print-page-break'}`}>
                            {/* 🏥 ATOMIC WATERMARK (DIRECT INLINE) */}
                            <div className="watermark-print">
                                <img src="/print/logo.png" alt="watermark" className="w-[12cm] grayscale object-contain" style={{ opacity: 0.50 }} />
                            </div>

                            {/* 🏥 DIGITAL HEADER */}
                            <div className="relative w-full bg-white text-black flex flex-col pt-0 break-inside-avoid">
                                {/* Top Bar */}


                                {/* Content Wrapper */}
                                <div className="w-full relative flex justify-between items-start pt-1 pb-1.25 px-10">
                                    <div className="relative z-10 w-[60%]">
                                        <HospitalName />
                                    </div>

                                    {/* Date */}
                                    {/* <div className="absolute right-10 top-28 z-10">
                                        <p className="text-[12px] text-black font-semibold">
                                            Report No : {String(report.mrn).padStart(4, "0")}
                                        </p>
                                    </div> */}
                                </div>

                                {/* Ribbon Wrapper */}
                                <div className="absolute right-0 top-0 w-[50%] z-1 flex flex-col items-end">
                                    {/* Darker coral upper shape */}
                                    <div
                                        className="h-14 w-85 flex items-center justify-end"
                                        style={{
                                            backgroundColor: '#d66a54',
                                            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 37px 100%)'
                                        }}
                                    >
                                        <span className="text-white text-[26px] font-sans font-medium pr-11.25">
                                            LAB REPORT
                                        </span>
                                    </div>
                                    {/* Lighter coral lower shape */}
                                    <div
                                        className="h-6 w-50"
                                        style={{
                                            backgroundColor: '#e6a69a',
                                            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 16px 100%)'
                                        }}
                                    ></div>
                                </div>
                            </div>


                            {/* BODY */}
                            <div className="report-body">
                                {isFirstPage && (
                                    <div className="mb-3 pt-3 pb-3 border-y border-slate-300">
                                        <div className="grid grid-cols-2 gap-x-8 text-[13px] font-semibold text-black tracking-tight px-2">
                                            <div className="space-y-1">
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Name</span><span className="font-bold text-black uppercase">: {patient?.name || "—"}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Age/Sex</span><span className="font-bold text-black">: {`${patient?.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yr` : "—"} / ${patient?.gender || "—"}`}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Ref. By.</span><span className="font-bold text-black">: {doctor?.name ? `Dr. ${doctor.name}` : "Self"}</span></div>
                                                {/* <div className="flex gap-2"><span className="w-20 text-black font-bold">Ref. By.</span><span className="font-bold text-black">: Dr. Nader Shah</span></div> */}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex gap-2"><span className="w-35 text-black font-medium">Report No</span><span className="font-bold text-black">: {String(report.mrn).padStart(4, "0")}</span></div>
                                                <div className="flex gap-2"><span className="w-35 text-black font-medium">Sample Collected On</span><span className="font-bold text-black">: {report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).split(",")[0] : "—"} </span></div>
                                                <div className="flex gap-2"><span className="w-35 text-black font-medium">Result Reported On</span><span className="font-bold text-black">: {report.testStartedAt ? fDateandTime(report.testStartedAt).split(",")[0] : "—"}</span></div>
                                                <div className="flex gap-2"><span className="w-35 text-black font-medium">Result Printed On</span><span className="font-bold text-black">: {fDateandTime(new Date()).split(",")[0]}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PANEL HEADINGS (Moved above the table headings) */}
                                {/* {(() => {
                                    const pagePanels = Array.from(new Set(pageRows.map(r => r.activePanel).filter(Boolean)));
                                    if (pagePanels.length === 0) return null;

                                    const panelTitles = pagePanels.map(pId => {
                                        const panelConf = panels?.find(p => p.name === pId);
                                        return panelConf?.mainHeading || pId;
                                    });

                                    return (
                                        <div className="w-full text-center pb-2 pt-1">
                                            <p className="font-bold text-black text-[17px] uppercase">
                                                {panelTitles.join(" / ")}
                                            </p>
                                        </div>
                                    );
                                })()} */}

                                {/* UNIFIED HEADER ROW */}
                                <div className="flex w-full bg-[#f4c3b9] border-y border-[#f4c3b9] text-[11px] font-bold text-black items-stretch relative z-8">
                                    <div className={`${pageHasCBC ? 'w-[70%]' : 'w-full'} pr-2`}>
                                        <table className="results-table w-full h-full border-none m-0">
                                            <colgroup>
                                                <col className="col-investigation" />
                                                <col className="col-result" />
                                                <col className="col-unit" />
                                                <col className="col-ref" />
                                                <col className="col-note" />
                                            </colgroup>
                                            <thead className="bg-transparent border-none">
                                                <tr>
                                                    <th className="px-2 py-[5.5px] text-left">Parameter</th>
                                                    <th className="px-2 py-[5.5px] text-center">Result</th>
                                                    <th className="px-2 py-[5.5px] text-center">Unit</th>
                                                    <th className="px-2 py-[5.5px] text-left">Ref. Range</th>
                                                    <th className="px-2 py-[5.5px] text-left">Note</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                    {pageHasCBC && (
                                        <div className="w-[30%] flex items-center px-4">
                                            <div className="uppercaser">Histograms</div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT BODY */}
                                <div className="flex w-full gap-2 relative">
                                    <div className={`${pageHasCBC ? 'w-[70%]' : 'w-full'} pr-2`}>
                                        <table className="results-table">
                                            <colgroup>
                                                <col className="col-investigation" />
                                                <col className="col-result" />
                                                <col className="col-unit" />
                                                <col className="col-ref" />
                                                <col className="col-note" />
                                            </colgroup>
                                            <tbody>
                                                {pageRows.map((row, rowIdx) => {
                                                    if (row.type === "PANEL") {
                                                        return (
                                                            row.mainHeading && <tr key={`panel-${rowIdx}`}>
                                                                <td colSpan={5} className="px-2 pt-4">
                                                                    <p className="font-bold text-black text-[18px] uppercase mt-1 underline underline-offset-2">{row.mainHeading}</p>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    if (row.type === "SUBHEADING") {
                                                        return (
                                                            <tr key={`subheading-${rowIdx}`}>
                                                                <td colSpan={5} className="px-2 pt-2 pb-0.5">
                                                                    <p className="font-semibold text-black text-[16px]">{row.name}</p>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    const value = parseFloat(row.value);
                                                    let isAbnormal = false;
                                                    const min = row.name?.range?.[0]?.min;
                                                    const max = row.name?.range?.[0]?.max;
                                                    if (!isNaN(value) && ((min !== undefined && min !== null && value < min) || (max !== undefined && max !== null && value > max))) {
                                                        isAbnormal = true;
                                                    }


                                                    return (
                                                        <React.Fragment key={`test-wrap-${rowIdx}`}>

                                                            <tr key={`test-${rowIdx}`}>
                                                                <td className="px-2 py-[5.5px]">
                                                                    <p className={`text-[15px]  text-black font-semibold pl-4`}>
                                                                        {row.name?.name || "Unknown test"}
                                                                    </p>
                                                                    {/* <p className="text-[8px] text-black pl-4">Method: {row.name?.method}</p> */}
                                                                </td>
                                                                <td className="px-2 py-[2px] text-center text-[15px] leading-tight whitespace-nowrap">
                                                                    <span className={isAbnormal ? "font-bold" : "text-black"}>
                                                                        {row.value || " "}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 py-[2px] text-center text-black text-[10px] font-medium leading-tight">
                                                                    {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? (
                                                                        <span dangerouslySetInnerHTML={{ __html: row.name.unit }} />
                                                                    ) : (
                                                                        " "
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-[2px] text-[14px] font-semibold text-black leading-tight">
                                                                    {row.name?.range && row.name.range.length > 0 ? (
                                                                        row.name.range.map((r: any, idx: number) => {
                                                                            const hasMin = r.min !== undefined && r.min !== null && r.min !== "";
                                                                            const hasMax = r.max !== undefined && r.max !== null && r.max !== "";
                                                                            if (!hasMin && !hasMax) return null;
                                                                            return (
                                                                                <div key={idx} className="whitespace-nowrap pb-[2px]">
                                                                                    {r.name && (row.name.range.length > 1 || r.name.toLowerCase() !== "normal") ? (
                                                                                        <span className="font-medium opacity-80 pr-1">{r.name}:</span>
                                                                                    ) : null}
                                                                                    {hasMin ? r.min : "0"} - {hasMax ? r.max : "N/A"}
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : "\u00A0"}
                                                                </td>
                                                                <td className="px-2 py-[2px] text-[10px] text-black leading-tight whitespace-pre-wrap">
                                                                    {row.name?.note}
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {pageHasCBC && (
                                        <div className="w-[30%] flex flex-col pt-6 px-4 relative right-0">
                                            <div className="flex flex-col gap-6 w-full">
                                                {/* WBC Graph */}
                                                {report?.graphs?.['WBC Histogram. BMP'] ? (
                                                    <div className="flex flex-col w-full pt-7">
                                                        <div className="text-[11px] font-bold text-black pl-1">WBC</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['WBC Histogram. BMP']}`}
                                                            alt="WBC Histogram"
                                                            className="w-full h-24 object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col w-full">
                                                        <div className="text-[10px] font-bold text-black pl-1">WBC</div>
                                                        <div className="w-full h-24 border border-dashed border-slate-200 rounded flex items-center justify-center text-black text-[10px]">WBC Graph Area</div>
                                                    </div>
                                                )}

                                                {/* RBC Graph */}
                                                {report?.graphs?.['RBC Histogram. BMP'] ? (
                                                    <div className="flex flex-col w-full pt-1">
                                                        <div className="text-[11px] font-bold text-black pl-1">RBC</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['RBC Histogram. BMP']}`}
                                                            alt="RBC Histogram"
                                                            className="w-full h-24 object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col w-full">
                                                        <div className="text-[10px] font-bold text-black pl-1">RBC</div>
                                                        <div className="w-full h-24 border border-dashed border-slate-200 rounded flex items-center justify-center text-black text-[10px]">RBC Graph Area</div>
                                                    </div>
                                                )}

                                                {/* PLT Graph */}
                                                {report?.graphs?.['PLT Histogram. BMP'] ? (
                                                    <div className="flex flex-col w-full pt-28">
                                                        <div className="text-[11px] font-bold text-black pl-1">PLT</div>
                                                        <img
                                                            src={`data:image/png;base64,${report.graphs['PLT Histogram. BMP']}`}
                                                            alt="PLT Histogram"
                                                            className="w-full h-24 object-contain object-left mix-blend-multiply"
                                                            style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col w-full">
                                                        <div className="text-[10px] font-bold text-black pl-1">PLT</div>
                                                        <div className="w-full h-24 border border-dashed border-slate-200 rounded flex items-center justify-center text-black text-[10px]">PLT Graph Area</div>
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
                                        {/* <div className="border-2 border-black-light rounded-lg p-2 bg-slate-50 note-section mx-10">
                                            <p className="font-bold text-[10px] uppercase text-black mb-1">Note</p>
                                            <p className="text-black leading-relaxed font-bold italic text-[12px]">
                                                {"The results should be correlated clinically."}
                                            </p>
                                        </div> */}

                                        <div className="flex justify-between signature-section pb-2 px-10 mt-2.5">
                                            <div className="text-center w-64">
                                                {/* <div className="border-b-2 border-slate-900 mb-2 w-full"></div> */}
                                                <p className="font-bold text-black uppercase leading-none text-[12px]">LAB IN-CHARGE</p>
                                                <p className="text-[10px] font-bold text-black mt-1 uppercase">{report.technician || "LABORATORY"}</p>
                                            </div>
                                            <div className="text-center w-64">
                                                {/* <div className="border-b-2 border-slate-900 mb-2 w-full"></div> */}
                                                <p className="font-bold text-black uppercase leading-none  text-[12px]">LAB TECHNICIAN</p>
                                                {/* <p className="text-[10px] font-bold text-black mt-1 uppercase ">{report.technician || "LABORATORY"}</p> */}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="px-10 py-3 text-black flex justify-between items-center footer" style={{ backgroundColor: '#f2cdbf' }}>
                                    <div className="space-y-0.5">
                                        <p className="text-black font-bold text-[11px]">Please consult your physician with this report.</p>
                                        <p className="text-black font-medium text-[11px]">For Appointments: <span className="font-bold">+91 83019 26155 · 04931 240077</span></p>
                                    </div>
                                    <p className="text-black font-medium text-[11px]">Powered by <span className="font-bold">Caresoft Innovations LLP</span></p>
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
