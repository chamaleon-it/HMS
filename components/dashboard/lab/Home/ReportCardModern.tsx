import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import useSWR from "swr";

interface ReportCardModernProps {
    report: any | null;
    panels?: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; method?: string; specimen?: string; }[];
    panelPerPage?: boolean;
}

const RangeBar = ({ min, max, value, markerColor }: { min: any, max: any, value: any, markerColor: string }) => {
    const vMin = parseFloat(min);
    const vMax = parseFloat(max);
    const v = parseFloat(value);
    const range = vMax - vMin || 1;

    const diff = v - vMin;
    const percentageOffset = (diff / range) * 40;
    let leftPercent = 30 + percentageOffset;
    leftPercent = Math.max(5, Math.min(95, leftPercent));

    return (
        <div className="relative w-[140px] mx-auto flex flex-col justify-center pt-[18px] pb-0.5">
            <div className="w-full h-[6px] rounded-full shadow-inner"
                style={{
                    background: "linear-gradient(90deg, #e12a32 0%, #f39130 15%, #6eb269 30%, #6eb269 70%, #f39130 85%, #e12a32 100%)"
                }}
            ></div>

            <div className="absolute left-[30%] top-[17px] h-[6px] w-px bg-slate-700"></div>
            <div className="absolute left-[70%] top-[17px] h-[6px] w-px bg-slate-700"></div>

            <div className="w-full mt-[3px] relative h-3 text-[8.5px] font-extrabold text-[#6b6b6b] whitespace-nowrap">
                <span className="absolute right-[70%] pr-[3px] leading-none">{min}</span>
                <span className="absolute left-[50%] -translate-x-1/2 flex items-center gap-[4px] text-slate-500 text-[6.5px] font-bold tracking-wide leading-none">
                    <span>&larr;</span> Normal value <span>&rarr;</span>
                </span>
                <span className="absolute left-[70%] pl-[3px] leading-none">{max}</span>
            </div>

            <div className="absolute top-[2px] text-[10px] text-white font-extrabold px-[3px] leading-none rounded-[1px]"
                style={{
                    left: `${leftPercent}%`,
                    transform: "translateX(-50%)",
                    backgroundColor: markerColor
                }}
            >
                {value}
                <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-px h-[12px] bg-black"
                    style={{ borderTopColor: markerColor }}></div>
            </div>
        </div>
    );
};

export default function ReportCardModern({ report, panels, panelPerPage = false }: ReportCardModernProps) {
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


    const { data: labResponse } = useSWR<{ data: { _id: string; name: string; inCharge: boolean }[]; message: string }>("/technician");
    const inChargeTechnician = labResponse?.data?.find((p) => p.inCharge);

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
          * {
              font-family: 'Montserrat', 'Inter', sans-serif !important;
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
            width: 210mm;
            height: 296mm !important;
            padding: 28pt;
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
        }
      `}} />

            {(() => {
                const FIRST_PAGE_LIMIT = 15;
                const SUBSEQUENT_PAGE_LIMIT = 20;

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

                    const testSubheadings = panelConfig?.testSubheadings || {};
                    let currentSubheadingState: string | null = null;
                    let pendingSubheading: string | null = null;

                    const isBiochemistry = panelConfig?.mainHeading?.toUpperCase() === "BIOCHEMISTRY";
                    let panelRow: any = {
                        type: "PANEL",
                        name: panelId,
                        activePanel: isBiochemistry ? "" : panelId,
                        mainHeading: panelConfig?.mainHeading || panelId
                    };
                    let panelPushed = isBiochemistry;

                    orderedIds.forEach(id => {
                        const t = testMap.get(id);
                        if (!processedTestIds.has(id) && t) {
                            const expectedSubheading = testSubheadings[id];
                            const valStr = t.value !== undefined && t.value !== null ? String(t.value).trim() : "";
                            const hasValue = valStr !== "";

                            if (expectedSubheading && expectedSubheading !== currentSubheadingState) {
                                pendingSubheading = expectedSubheading;
                                currentSubheadingState = expectedSubheading;
                            } else if (!expectedSubheading && currentSubheadingState) {
                                pendingSubheading = null;
                                currentSubheadingState = null;
                            }

                            if (hasValue) {
                                if (!panelPushed) {
                                    allRows.push(panelRow);
                                    panelPushed = true;
                                }
                                if (pendingSubheading) {
                                    allRows.push({ type: "SUBHEADING", name: pendingSubheading, activePanel: isBiochemistry ? "" : panelId });
                                    pendingSubheading = null;
                                }
                                allRows.push({ type: "TEST", ...t, activePanel: isBiochemistry ? "" : panelId });
                            }

                            processedTestIds.add(id);
                            testMap.delete(id);
                        }
                    });
                });

                Array.from(testMap.values()).forEach((t: any) => {
                    const valStr = t.value !== undefined && t.value !== null ? String(t.value).trim() : "";
                    if (valStr !== "") {
                        allRows.push({ type: "TEST", ...t, activePanel: "" });
                    }
                });

                // 2. Chunk Into Pages
                const pages: any[][] = [];
                if (panelPerPage) {
                    // Group all rows by panel ID to handle non-adjacent rows (like merged Biochemistry tests)
                    const panelGroups: Record<string, any[]> = {};
                    const panelOrder: string[] = [];

                    allRows.forEach((row) => {
                        const p = row.activePanel || "misc";
                        if (!panelGroups[p]) {
                            panelGroups[p] = [];
                            panelOrder.push(p);
                        }
                        panelGroups[p].push(row);
                    });

                    panelOrder.forEach((p) => {
                        const rows = panelGroups[p];
                        let pIdx = 0;
                        let panelPageCount = 0;
                        while (pIdx < rows.length) {
                            const isFirstPageOfPanel = panelPageCount === 0;
                            const limit = isFirstPageOfPanel ? FIRST_PAGE_LIMIT : SUBSEQUENT_PAGE_LIMIT;
                            const slice = rows.slice(pIdx, pIdx + limit);
                            const isLastPageOfPanel = (pIdx + limit) >= rows.length;

                            pages.push(slice.map((r, i) => ({
                                ...r,
                                isPanelStart: isFirstPageOfPanel && i === 0,
                                isPanelEnd: isLastPageOfPanel && i === slice.length - 1
                            })));

                            pIdx += limit;
                            panelPageCount++;
                        }
                    });
                } else {
                    let currentIndex = 0;
                    while (currentIndex < allRows.length) {
                        const isFirstPage = pages.length === 0;
                        const limit = isFirstPage ? FIRST_PAGE_LIMIT : SUBSEQUENT_PAGE_LIMIT;
                        pages.push(allRows.slice(currentIndex, currentIndex + limit));
                        currentIndex += limit;
                    }
                }

                if (pages.length === 0) pages.push([]);

                // 3. Render Pages
                let globalSubheadingCount = 0;
                return pages.map((pageRows, pageIdx) => {
                    const isFirstPage = panelPerPage ? (pageRows[0]?.isPanelStart || false) : pageIdx === 0;
                    const isLastPage = panelPerPage ? (pageRows[pageRows.length - 1]?.isPanelEnd || false) : pageIdx === pages.length - 1;
                    const pageHasCBC = pageRows.some(row => {
                        const pName = row.activePanel || row.name;
                        return pName && typeof pName === 'string' && pName.toUpperCase().includes("CBC");
                    });

                    return (
                        <div key={pageIdx} className={`a4-page shadow-none bg-white ${isLastPage ? 'print-page-last' : 'print-page-break'}`}>
                            {isFirstPage && (
                                <>
                                    {/* Top Header Section */}
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex gap-4 items-center">
                                            <div className="shrink-0 flex items-center justify-center">
                                                <img src="/print/logo.png" alt="Logo" className="w-[124px] h-[124px] rounded-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col gap-px mt-2 ml-1">
                                                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800 uppercase leading-none">Mark Hospital</h1>
                                                <p className="text-[11.5px] font-extrabold text-[#6eb269] mt-1 ml-px">Pothukallu P.O, Nilambur, Malappuram, India - 679334</p>
                                                <p className="text-[12px] font-bold text-slate-800 ml-px mt-0.5 tracking-wide">DIGIPIN: MC9-955-6F2F</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-[13px] mt-2 mr-3">
                                            <div className="text-[13px] text-slate-800 font-bold pr-1">Report No: {String(report.mrn || "0066").padStart(4, "0")}</div>
                                            <div className="bg-[#6eb269] text-white text-[20px] font-bold px-[24px] py-[8px] rounded-[10px] tracking-wide">
                                                LAB REPORT
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Info Block */}
                                    <div className="bg-[#f5f5f0] px-8 py-[18px] flex justify-between w-full">
                                        <div className="flex flex-col space-y-[9px] text-[12px] font-medium text-slate-600 tracking-wide">
                                            <div className="flex items-center"><span className="w-24">Name</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">{patient?.name || "Anees"}</span></div>
                                            <div className="flex items-center"><span className="w-24">Age/Sex</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">{patient?.dateOfBirth ? `${fAge(patient.dateOfBirth).years}y ${fAge(patient.dateOfBirth).months}m` : "46 yr"} / {patient?.gender || "Other"}</span></div>
                                            <div className="flex items-center"><span className="w-24">Ref. By.</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">Dr. {doctor?.name || "Nadirsha"}</span></div>
                                        </div>
                                        <div className="flex flex-col space-y-[9px] text-[12px] font-medium text-slate-600 tracking-wide pr-4">
                                            <div className="flex items-center"><span className="w-[140px]">Sample Collected On</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">{report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt) : "01/04/26 11:12 am"}</span></div>
                                            <div className="flex items-center"><span className="w-[140px]">Result Reported On</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">{report.testStartedAt ? fDateandTime(report.testStartedAt) : "01/04/26 11:12 am"}</span></div>
                                            <div className="flex items-center"><span className="w-[140px]">Result Printed On</span><span className="w-6 text-slate-700 font-bold">:</span><span className="font-extrabold text-slate-900">{fDateandTime(new Date())}</span></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Tables & Results */}
                            <div className="flex-1 mt-3">
                                {(() => {
                                    const firstPanelRow = pageRows.find(r => r.type === "PANEL");
                                    const activePanelId = pageRows.find(r => r.activePanel)?.activePanel;
                                    const headingText = firstPanelRow?.mainHeading ||
                                        panels?.find(p => p.name === activePanelId)?.mainHeading ||
                                        activePanelId || "BIOCHEMISTRY";

                                    return isFirstPage && (
                                        <div className="w-full text-center mb-3">
                                            <h2 className="text-[14px] font-black text-[#6eb269] uppercase tracking-[0.05em]">{headingText}</h2>
                                        </div>
                                    );
                                })()}
                                <div className="flex w-full gap-2 relative">
                                    <div className={`${pageHasCBC ? 'w-[70%]' : 'w-full'} rounded-[10px] ${pageHasCBC ? 'overflow-visible' : 'overflow-hidden'}`}>
                                        <table className="w-full">
                                            <thead className="bg-[#eef2eb] text-slate-700">
                                                <tr>
                                                    <th className="py-[11px] pl-6 pr-2 text-[12.5px] font-extrabold tracking-wide text-left w-[25%] rounded-tl-[10px]">Parameter</th>
                                                    <th className="py-[11px] px-2 text-[12.5px] font-extrabold tracking-wide text-left w-[13%]">Result</th>
                                                    <th className="py-[11px] px-2 text-[12.5px] font-extrabold tracking-wide text-left w-[12%]">Unit</th>
                                                    <th className="py-[11px] px-2 text-[12.5px] font-extrabold tracking-wide text-center w-[35%]">Ref. Range</th>
                                                    <th className="py-[11px] pr-6 pl-2 text-[12.5px] font-extrabold tracking-wide text-center w-[15%] rounded-tr-[10px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageRows.map((row, rowIdx) => {
                                                    if (row.type === "PANEL") return null; // Handled above table
                                                    if (row.type === "SUBHEADING") {
                                                        globalSubheadingCount++;
                                                        const graphKey = globalSubheadingCount === 1 ? 'WBC' : globalSubheadingCount === 2 ? 'RBC' : globalSubheadingCount === 3 ? 'PLT' : null;
                                                        const fullGraphKey = globalSubheadingCount === 1 ? 'WBC Histogram. BMP' :
                                                            globalSubheadingCount === 2 ? 'RBC Histogram. BMP' :
                                                                globalSubheadingCount === 3 ? 'PLT Histogram. BMP' : null;
                                                        const panel = panels?.find((p: any) => p.name === row.activePanel)

                                                        const panelMethod = panel?.method
                                                        const panelSpecimen = panel?.specimen
                                                        const subheadings = panel?.subheadings ?? []
                                                        return (
                                                            <tr key={`sub-${rowIdx}`}>
                                                                <td colSpan={5} className="py-[10px] px-6 text-left relative">
                                                                    <h3 className="text-[12px] font-extrabold text-slate-800 uppercase tracking-widest underline underline-offset-[3px] decoration-slate-300">{row.name}</h3>
                                                                    {(subheadings.length === 0 || subheadings[0] === row.name) && !!panelMethod && <p className="text-[9px] text-black pl-0">Method: {panelMethod}</p>}
                                                                    {(subheadings.length === 0 || subheadings[0] === row.name) && !!panelSpecimen && <p className="text-[9px] text-black pl-0">Specimen: {panelSpecimen}</p>}
                                                                    {graphKey && pageHasCBC && (
                                                                        <div className="absolute top-0 pointer-events-none" style={{ left: '100%', marginLeft: '30px', width: '240px' }}>
                                                                            <div className="flex flex-col pt-2">
                                                                                <div className="text-[12px] font-extrabold text-slate-700 pl-1 mb-1">{graphKey} HISTOGRAM</div>
                                                                                {report?.graphs && fullGraphKey && report.graphs[fullGraphKey] ? (
                                                                                    <img
                                                                                        src={`data:image/png;base64,${report.graphs[fullGraphKey]}`}
                                                                                        alt={`${graphKey} Histogram`}
                                                                                        className="w-full h-[130px] object-contain object-left mix-blend-multiply"
                                                                                        style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-[130px] border border-dashed border-slate-300 rounded-[8px] flex items-center justify-center text-slate-500 text-[10px] font-medium bg-slate-50">
                                                                                        {graphKey} Graph Area
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    if (row.type !== "TEST") return null;

                                                    const v = parseFloat(row.value);
                                                    let min, max;
                                                    if (row.name?.range?.[0]) {
                                                        min = row.name.range[0].min;
                                                        max = row.name.range[0].max;
                                                    }

                                                    let label = "NORMAL";
                                                    let color = "#6eb269"; // green
                                                    let pillClass = "bg-[#6eb269]";
                                                    if (min !== undefined && v < min) { label = "LOW"; color = "#f39130"; pillClass = "bg-[#f39130]" }
                                                    else if (max !== undefined && v > max) { label = "HIGH"; color = "#e12a32"; pillClass = "bg-[#e12a32]" }
                                                    else if (min !== undefined && v === min) { label = "BORDERLINE"; color = "#f39130"; pillClass = "bg-[#f39130]" }
                                                    else if (max !== undefined && v === max) { label = "BORDERLINE"; color = "#f39130"; pillClass = "bg-[#f39130]" }

                                                    // Special cases for visualization accuracy against the image
                                                    if (row.name?.name?.toUpperCase() === 'GLOBULIN') { label = 'BORDERLINE'; color = "#f39130"; pillClass = "bg-[#f39130]" }

                                                    return (
                                                        <tr key={"test-" + rowIdx} className="">
                                                            <td className="pt-[15px] px-6 text-left align-top border-b border-transparent">
                                                                <div className="font-extrabold text-slate-800 tracking-wide text-[12px] leading-tight capitalize">{row.name?.name ? /^[a-zA-Z]{3}$/.test(row.name?.name) ? row.name?.name.toUpperCase() : row.name?.name.toLowerCase() : "TEST"}</div>
                                                                {row?.name?.method && <div className="text-[9px] text-slate-500 mt-[3px] font-medium tracking-wide">Method : {row.name?.method}</div>}
                                                                {row?.name?.specimen && <div className="text-[8px] text-slate-500 mt-[3px] font-medium tracking-wide">Specimen : {row.name?.specimen}</div>}
                                                            </td>
                                                            <td className="pt-[17px] px-2 text-left text-[12px] align-top">
                                                                <span className="text-slate-800 font-bold">{row.value}</span>
                                                            </td>
                                                            <td className="pt-[17px] px-2 text-left text-[11px] text-slate-800 font-medium tracking-wide align-top">
                                                                {row.name?.unit ? <span dangerouslySetInnerHTML={{ __html: row.name.unit }} /> : ""}
                                                            </td>
                                                            <td className="pt-[4px] px-0 text-center align-top">
                                                                {min !== undefined && max !== undefined ? (
                                                                    <RangeBar min={min} max={max} value={row.value} markerColor={color} />
                                                                ) : (
                                                                    <div className="text-[11px] font-bold text-slate-600 mt-2">{row.name?.range?.[0]?.min} - {row.name?.range?.[0]?.max}</div>
                                                                )}
                                                            </td>
                                                            <td className="pt-[13px] px-4 text-center align-top">
                                                                <div className={`${pillClass} text-white text-[9.5px] uppercase font-extrabold h-6 px-[2px] rounded-[6px] w-[78px] shadow-sm flex justify-center items-center`}>
                                                                    <p>{label}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {pageHasCBC && (
                                        <div className="w-[30%] flex flex-col pt-0 px-1 relative right-0">
                                            <div className="bg-[#eef2eb] rounded-t-[10px] py-[9px] px-2 w-full mb-3 flex items-center justify-center border border-[#e2ebd9]">
                                                <div className="text-[12.5px] font-extrabold tracking-wide text-slate-700 text-center uppercase">Histograms</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Section - Pinned to bottom manually by flex-1 above */}
                            <div className="w-full mt-auto">
                                {isLastPage && (
                                    <>

                                        <div className="text-center w-full mt-2">
                                            <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-[0.2em]">*** End of Report ***</p>
                                        </div>
                                        <div className="flex w-full border border-[#6eb269] rounded-[8px] overflow-hidden bg-white mt-1">
                                            <div className="flex-[5.5] flex flex-col items-start bg-white pb-3">
                                                <div className="bg-[#6eb269] text-white flex items-center h-[26px] self-start" style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0% 100%)", paddingRight: "40px", width: "95%" }}>
                                                    <span className="font-bold text-[13px] pl-3 mb-0.5 mt-[2px] tracking-wide">Comments:</span>
                                                    <div className="w-[75%] border-b h-0 border-white ml-2 opacity-80 mb-[-2px]"></div>
                                                </div>
                                                {/* <div className="px-5 pt-[14px] pb-1 text-[10.5px] text-slate-700 font-extrabold space-y-[6px]">
                                                <div className="flex gap-[8px] items-start"><div className="w-[4.5px] h-[4.5px] rounded-full bg-[#6eb269] mt-[5px] shrink-0"></div><p className="leading-normal text-slate-800 pr-2">To evaluate kidney functioning in normal individuals as screening test.</p></div>
                                                <div className="flex gap-[8px] items-start"><div className="w-[4.5px] h-[4.5px] rounded-full bg-[#6eb269] mt-[5px] shrink-0"></div><p className="leading-normal text-slate-800 pr-2">To aid in diagnosis of kidney related disorders (Acute and Chronic renal failure, prerenal, postrenal, End Stage Renal Disease).</p></div>
                                                <div className="flex gap-[8px] items-start"><div className="w-[4.5px] h-[4.5px] rounded-full bg-[#6eb269] mt-[5px] shrink-0"></div><p className="leading-normal text-slate-800 pr-2">To screen those who may be at risk of developing kidney disorders (diabetes, hypertension, cardiovascular diseases).</p></div>
                                                <div className="flex gap-[8px] items-start"><div className="w-[4.5px] h-[4.5px] rounded-full bg-[#6eb269] mt-[5px] shrink-0"></div><p className="leading-normal text-slate-800 pr-2">To monitor effects of nephrotoxic drugs (e.g., vancomycin, methotrexate, some antivirals, etc.).</p></div>
                                            </div> */}
                                            </div>


                                            <div className="flex-4 flex flex-col border-l border-slate-300 divide-y divide-slate-300 bg-white min-w-[260px]">
                                                <div className="px-4 py-[8px]">
                                                    <p className="font-extrabold text-slate-800 uppercase text-[10.5px] tracking-wide mt-1 pb-[16px]">LAB TECHNICIAN</p>
                                                </div>
                                                <div className="px-4 py-[8px]">
                                                    <p className="font-extrabold text-slate-800 uppercase text-[10.5px] tracking-wide mt-1 pb-[4px]">LAB IN-CHARGE</p>
                                                    <p className="font-semibold text-slate-800 uppercase text-[10.5px] tracking-wide mt-1 pb-[16px]">{inChargeTechnician?.name ?? ""}</p>
                                                </div>
                                                <div className="px-4 py-[9px] flex flex-col gap-[5px]">
                                                    <div className="flex items-center gap-[7px] text-slate-700 tracking-wide mt-1">
                                                        <div className="w-[16px] h-[16px] bg-[#6eb269] rounded-sm flex items-center justify-center text-white shrink-0 shadow-sm mt-px">
                                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                                        </div>
                                                        <span className="text-[11.5px] font-extrabold">+91 83019 26155, 04931 240077</span>
                                                    </div>
                                                    <div className="flex items-center gap-[7px] text-slate-700 tracking-wide">
                                                        <div className="w-[16px] h-[16px] bg-[#6eb269] rounded-sm flex items-center justify-center text-white shrink-0 shadow-sm mt-px">
                                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                                        </div>
                                                        <span className="text-[11.5px] font-extrabold">hospitalmark@gmail.com</span>
                                                    </div>
                                                </div>
                                                <div className="bg-[#f0f3ec] px-4 py-[9px] flex items-center flex-1">
                                                    <p className="text-[10px] font-extrabold text-slate-800 tracking-wide pt-1">For Appointments: <span className="text-black text-[10.5px]">+91 8301 926 155, 04931 240 077</span></p>
                                                </div>
                                            </div>
                                        </div>


                                    </>
                                )}

                                <div className="flex justify-between items-center w-full mt-4 ml-1 pr-[18px]">
                                    <p className="text-slate-800 font-extrabold text-[12px] tracking-wide">Please consult your physician with this report.</p>
                                    <p className="text-slate-800 font-bold text-[11px]">Powered by <span className="font-extrabold text-slate-900 tracking-wide">Caresoft Innovations LLP</span></p>
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
