import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import HospitalName from "@/components/print/HospitalName";


interface ReportCardProps {
    report: any | null;
    panels?: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; method?: string; specimen?: string; department?: string }[];
    panelPerPage?: boolean;
}

export default function ReportCard({ report, panels, panelPerPage = false }: ReportCardProps) {





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
          .col-investigation { width: 45%; }
          .col-result { width: 25%; }
          .col-ref { width: 30%; }
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
                const getRowLimit = (pageGroup: string, isFirstPageInGroup: boolean) => {
                    if (pageGroup === "HEAMATOLOGY") return isFirstPageInGroup ? 29 : 20;
                    return 25; // Adjusted down from 38 to ensure footer is visible without overflowing
                };

                // 1. Prepare All Rows (Panel Headers + Tests)
                const allRows: any[] = [];
                const testMap = new Map<string, any>();
                (report.test || []).forEach((t: any) => {
                    testMap.set(t.name?._id?.toString() || "", t);
                });

                const processedTestIds = new Set<string>();

                const getDepartmentWeight = (dept: string) => {
                    if (!dept) return 99;
                    const d = dept.toUpperCase();
                    if (d.includes("HEMATOLOGY") || d.includes("HEAMATOLOGY")) return 1;
                    if (d.includes("BIOCHEMISTRY")) return 2;
                    if (d.includes("SEROLOGY")) return 3;
                    if (d.includes("IMMUNOLOGY")) return 4;
                    if (d.includes("CLINICAL PATHOLOGY")) return 5;
                    return 99;
                };

                const deptGroups = new Map<string, { panels: any[][], singles: any[] }>();

                const getGroup = (dept: string) => {
                    const d = dept || "";
                    if (!deptGroups.has(d)) {
                        deptGroups.set(d, { panels: [], singles: [] });
                    }
                    return deptGroups.get(d)!;
                };

                [...(report.panels || [])].forEach((panelIdStr: string) => {
                    const panelId = panelIdStr.toString();
                    const panelTests = (report.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));
                    if (panelTests.length === 0) return;

                    const panelConfig = panels?.find(p => p.name === panelId);
                    const panelDept = panelConfig?.department || panelTests[0]?.name?.department || "";

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

                    const isBiochemistry = panelConfig?.mainHeading?.toUpperCase() === "BIOCHEMISTRY" || panelConfig?.name?.toUpperCase() === "BIOCHEMISTRY";
                    let panelRow: any = {
                        type: "PANEL",
                        name: panelId,
                        activePanel: isBiochemistry ? "" : panelId,
                        mainHeading: panelConfig?.mainHeading || panelConfig?.name,
                        department: panelDept
                    };
                    let panelPushed = isBiochemistry;
                    const currentPanelRows: any[] = [];

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
                                    currentPanelRows.push(panelRow);
                                    panelPushed = true;
                                }
                                if (pendingSubheading) {
                                    currentPanelRows.push({ 
                                        type: "SUBHEADING", 
                                        name: pendingSubheading, 
                                        activePanel: isBiochemistry ? "" : panelId, 
                                        department: panelDept,
                                        mainHeading: panelConfig?.mainHeading || panelConfig?.name 
                                    });
                                    pendingSubheading = null;
                                }
                                currentPanelRows.push({ 
                                    type: "TEST", 
                                    ...t, 
                                    activePanel: isBiochemistry ? "" : panelId, 
                                    hasSubheading: !!expectedSubheading, 
                                    department: panelDept,
                                    mainHeading: panelConfig?.mainHeading || panelConfig?.name 
                                });
                            }

                            processedTestIds.add(id);
                            testMap.delete(id);
                        }
                    });
                    
                    if (currentPanelRows.length > 0) {
                        getGroup(panelDept).panels.push(currentPanelRows);
                    }
                });

                Array.from(testMap.values()).forEach((t: any) => {
                    const valStr = t.value !== undefined && t.value !== null ? String(t.value).trim() : "";
                    if (valStr !== "") {
                        const dept = t.name?.department || "";
                        const testGroup = dept ? `DEPT_${String(dept).trim().toUpperCase()}` : "";
                        getGroup(dept).singles.push({ type: "TEST", ...t, activePanel: testGroup, department: dept });
                    }
                });

                const getPanelWeight = (panelName: string) => {
                    const p = panelName?.toUpperCase() || "";
                    if (p.includes("LIPID PROFILE")) return 1;
                    if (p.includes("RENAL FUNCTION") || p.includes("RFT")) return 2;
                    if (p.includes("LIVER FUNCTION") || p.includes("LFT")) return 3;
                    return 99;
                };

                const getSingleTestWeight = (testName: string) => {
                    const t = testName?.toUpperCase() || "";
                    if (t.includes("SUGAR") || t.includes("FBS") || t.includes("RBS") || t.includes("PPBS") || t.includes("FASTING") || t.includes("RANDOM")) return 1;
                    return 99;
                };

                const sortedDepts = Array.from(deptGroups.keys()).sort((a, b) => {
                    const weightA = getDepartmentWeight(a);
                    const weightB = getDepartmentWeight(b);
                    if (weightA !== weightB) return weightA - weightB;
                    return a.localeCompare(b);
                });

                sortedDepts.forEach(dept => {
                    const group = deptGroups.get(dept)!;
                    
                    // Sort single tests
                    group.singles.sort((a, b) => {
                        const wA = getSingleTestWeight(a.name?.name);
                        const wB = getSingleTestWeight(b.name?.name);
                        if (wA !== wB) return wA - wB;
                        return (a.name?.name || "").localeCompare(b.name?.name || "");
                    });

                    // Sort panels
                    group.panels.sort((aRows, bRows) => {
                        const aName = aRows[0]?.activePanel || "";
                        const bName = bRows[0]?.activePanel || "";
                        const wA = getPanelWeight(aName);
                        const wB = getPanelWeight(bName);
                        if (wA !== wB) return wA - wB;
                        return aName.localeCompare(bName);
                    });
                    
                    // Single tests before panels
                    group.singles.forEach(row => allRows.push(row));
                    
                    group.panels.forEach(panelRows => {
                        panelRows.forEach(row => allRows.push(row));
                    });
                });

                const getPageGroup = (row: any) => {
                    const activePanelStr = typeof row.activePanel === 'string' ? row.activePanel.toUpperCase() : "";
                    const nameStr = typeof row.name === 'string' ? row.name.toUpperCase() : "";
                    const deptStr = typeof row.department === 'string' ? row.department.toUpperCase() : "";
                    const mainHeadingStr = typeof row.mainHeading === 'string' ? row.mainHeading.toUpperCase() : "";
                    
                    if (deptStr.includes("HEMATOLOGY") || deptStr.includes("HEAMATOLOGY") || activePanelStr.includes("COMPLETE BLOOD COUNT") || nameStr.includes("COMPLETE BLOOD COUNT") || mainHeadingStr.includes("COMPLETE BLOOD COUNT")) {
                        return "HEAMATOLOGY";
                    }
                    if (deptStr.includes("CLINICAL PATHOLOGY") || activePanelStr.includes("CLINICAL PATHOLOGY") || nameStr.includes("CLINICAL PATHOLOGY") || mainHeadingStr.includes("CLINICAL PATHOLOGY")) {
                        return "CLINICAL PATHOLOGY";
                    }
                    return "GENERAL";
                };

                const hematologyRows = allRows.filter(row => getPageGroup(row) === "HEAMATOLOGY");
                const cpRows = allRows.filter(row => getPageGroup(row) === "CLINICAL PATHOLOGY");
                const generalRows = allRows.filter(row => getPageGroup(row) === "GENERAL");
                const sortedAllRows = [...hematologyRows, ...generalRows, ...cpRows];

                // 2. Chunk Into Pages
                const pages: any[][] = [];
                if (panelPerPage) {
                    // Group all rows by panel ID to handle non-adjacent rows (like merged Biochemistry tests)
                    const panelGroups: Record<string, any[]> = {};
                    const panelOrder: string[] = [];

                    sortedAllRows.forEach((row) => {
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
                            const pageGroup = getPageGroup(rows[0] || {});
                            const limit = getRowLimit(pageGroup, isFirstPageOfPanel);
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
                    let currentChunk: any[] = [];
                    let currentPageGroup: string | null = null;
                    let lastPanel: string | null = null;
                    let lastDept: string | null = null;

                    for (let i = 0; i < sortedAllRows.length; i++) {
                        const row = sortedAllRows[i];
                        const pageGroup = getPageGroup(row);
                        const rowPanel = row.activePanel;
                        const rowDept = row.department;

                        const limit = getRowLimit(pageGroup, pages.filter(p => getPageGroup(p[0]) === pageGroup).length === 0);

                        let forceBreak = false;
                        if (currentChunk.length > 0) {
                            if ((currentPageGroup !== null && pageGroup !== currentPageGroup) || currentChunk.length >= limit) {
                                forceBreak = true;
                            } else {
                                const isNewPanel = rowPanel && rowPanel !== lastPanel;
                                const isNewDept = rowDept && rowDept !== lastDept;
                                // If a new panel or department is starting and there's 4 or fewer rows of space left, break early.
                                if ((isNewPanel || isNewDept) && (limit - currentChunk.length) <= 4) {
                                    forceBreak = true;
                                }
                            }
                        }

                        if (forceBreak) {
                            pages.push(currentChunk);
                            currentChunk = [];
                        }

                        currentChunk.push(row);
                        currentPageGroup = pageGroup;
                        lastPanel = rowPanel;
                        lastDept = rowDept;
                    }
                    if (currentChunk.length > 0) {
                        pages.push(currentChunk);
                    }
                }

                if (pages.length === 0) pages.push([]); // Guarantee at least one page

                // 3. Render Pages
                let globalSubheadingCount = 0;
                return pages.map((pageRows, pageIdx) => {
                    const isFirstPage = panelPerPage ? (pageRows[0]?.isPanelStart || false) : pageIdx === 0;
                    const isLastPage = panelPerPage ? (pageRows[pageRows.length - 1]?.isPanelEnd || false) : pageIdx === pages.length - 1;
                    const pageHasCBC = pageRows.some(row => {
                        const pName = row.activePanel || row.name;
                        const mHeading = row.mainHeading;
                        return (pName && typeof pName === 'string' && (pName.toUpperCase().includes("COMPLETE BLOOD COUNT") || pName.toUpperCase().includes("CBC"))) ||
                               (mHeading && typeof mHeading === 'string' && (mHeading.toUpperCase().includes("COMPLETE BLOOD COUNT") || mHeading.toUpperCase().includes("CBC")));
                    });

                    return (
                        <div key={pageIdx} className={`a4-page shadow-none bg-white font-roboto ${isLastPage ? 'print-page-last' : 'print-page-break'}`}>
                            {/* 🏥 ATOMIC WATERMARK (DIRECT INLINE) */}
                            <div className="watermark-print">
                                <img src="/print/logo.png" alt="watermark" className="w-[12cm] grayscale object-contain" style={{ opacity: 0.50 }} />
                            </div>

                            {/* 🏥 DIGITAL HEADER */}
                            {true && (
                                <div className="relative w-full bg-white text-black flex flex-col pt-0 break-inside-avoid">
                                    {/* Content Wrapper */}
                                    <div className="w-full relative flex justify-between items-start pt-5 pb-1.25 px-10">
                                        <div className="relative z-10 w-[60%]">
                                            <HospitalName />
                                        </div>
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
                            )}


                            {/* BODY */}
                            <div className="report-body">
                                {true && (
                                    <div className="mb-3 pt-3 pb-3 border-y border-slate-300">
                                        <div className="grid grid-cols-2 gap-x-8 text-[13px] font-semibold text-black tracking-tight px-2">
                                            <div className="space-y-1">
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Name</span><span className="font-bold text-black uppercase">: {patient?.name || "—"}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Age/Sex</span><span className="font-bold text-black">: {`${patient?.dateOfBirth ? (() => {
                                                    const age = fAge(patient.dateOfBirth);
                                                    return `${age.years}Y${age.months > 0 ? ` ${age.months}M` : ""}`;
                                                })() : "—"} / ${patient?.gender || "—"}`}</span></div>
                                                <div className="flex gap-2"><span className="w-20 text-black font-medium">Ref. By.</span><span className="font-bold text-black">: {doctor?.name ? `Dr. ${doctor.name}` : "Self"}</span></div>
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

                                {/* DEPARTMENT HEADING (Moved above the table headings) */}
                                {(() => {
                                    const firstRow = pageRows[0];
                                    const departmentText = firstRow?.department || "";
                                    
                                    return departmentText ? (
                                        <div className="w-full text-center pb-2 pt-1 flex flex-col items-center justify-center gap-1">
                                            <p className="font-bold text-black text-[18px] uppercase underline underline-offset-4">
                                                {departmentText.toLowerCase().includes("department") ? departmentText : `${departmentText}`}
                                            </p>
                                        </div>
                                    ) : <div className="h-12"></div>;
                                })()}
                                <div className="flex w-full bg-[#f4c3b9] border-y border-[#f4c3b9] text-[11px] font-bold text-black items-stretch relative z-8">
                                    <div className={`${pageHasCBC ? 'w-[70%]' : 'w-full'} pr-2`}>
                                        <table className="results-table w-full h-full border-none m-0">
                                            <colgroup>
                                                <col className="col-investigation" />
                                                <col className="col-result" />
                                                <col className="col-ref" />
                                            </colgroup>
                                            <thead className="bg-transparent border-none">
                                                <tr>
                                                    <th className="px-2 py-[5.5px] text-left">Parameter</th>
                                                    <th className="px-2 py-[5.5px] text-left">Result</th>
                                                    <th className="px-2 py-[5.5px] text-left">Ref. Range</th>
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
                                                <col className="col-ref" />
                                            </colgroup>
                                            <tbody>


                                                {(() => {
                                                    return pageRows.map((row, rowIdx) => {
                                                        const currentDept = row.department;
                                                        const prevDept = rowIdx > 0 ? pageRows[rowIdx - 1].department : currentDept;
                                                        const showDept = rowIdx > 0 && currentDept && currentDept !== prevDept;
                                                        
                                                        const deptRow = showDept ? (
                                                            <tr key={`dept-${rowIdx}`}>
                                                                <td colSpan={3} className="px-0 pt-3 pb-2 text-center">
                                                                    <p className="font-bold text-black text-[17px] uppercase mt-1 underline underline-offset-4 mb-1">
                                                                        {currentDept.toLowerCase().includes("department") ? currentDept : `${currentDept}`}
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        ) : null;

                                                        if (row.type === "PANEL") {
                                                            const nextRow = pageRows[rowIdx + 1];
                                                            const isNextRowSubheading = nextRow && nextRow.type === "SUBHEADING";
                                                            const isNextSame = isNextRowSubheading && (
                                                                nextRow.name?.toUpperCase() === row.mainHeading?.toUpperCase()
                                                            );
                                                            
                                                            const isSameAsDept = row.mainHeading?.toUpperCase() === row.department?.toUpperCase();

                                                            if (isNextSame || isSameAsDept) {
                                                                return <React.Fragment key={`panel-${rowIdx}`}>{deptRow}</React.Fragment>;
                                                            }

                                                            return (
                                                                <React.Fragment key={`panel-${rowIdx}`}>
                                                                    {deptRow}
                                                                    {row.mainHeading ? (
                                                                        <tr>
                                                                            <td colSpan={3} className={`pl-1 pt-1 relative ${rowIdx === 0 ? "pt-0" : ""}`}>
                                                                                <p className="font-semibold text-black text-[13px] uppercase underline underline-offset-2">{row.mainHeading}</p>
                                                                            </td>
                                                                        </tr>
                                                                    ) : null}
                                                                </React.Fragment>
                                                            );
                                                        }
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
                                                                <React.Fragment key={`subheading-wrap-${rowIdx}`}>
                                                                    {deptRow}
                                                                    <tr key={`subheading-${rowIdx}`}>
                                                                    <td colSpan={3} className={`pl-1 pt-1 relative ${rowIdx === 0 ? "pt-0" : ""}`}>
                                                                        <p className="font-semibold text-black text-[13px] underline underline-offset-2">{row.name}</p>
                                                                        {(subheadings.length === 0 || subheadings[0] === row.name) && !!panelMethod && <p className="text-[9px] text-black pl-0">Method: {panelMethod}</p>}
                                                                        {(subheadings.length === 0 || subheadings[0] === row.name) && !!panelSpecimen && <p className="text-[9px] text-black pl-0">Specimen: {panelSpecimen}</p>}

                                                                        {graphKey && pageHasCBC && (
                                                                            <div className="absolute top-0 pointer-events-none" style={{ left: '100%', marginLeft: '25px', width: '240px' }}>
                                                                                <div className="flex flex-col pt-2">
                                                                                    <div className="text-[12px] font-extrabold text-black pl-1 mb-1">{graphKey} HISTOGRAM</div>
                                                                                    {report?.graphs && fullGraphKey && report.graphs[fullGraphKey] ? (
                                                                                        <img
                                                                                            src={`data:image/png;base64,${report.graphs[fullGraphKey]}`}
                                                                                            alt={`${graphKey} Histogram`}
                                                                                            className="w-full h-[130px] object-contain object-left mix-blend-multiply"
                                                                                            style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-[130px] border border-dashed border-slate-200 rounded flex items-center justify-center text-black text-[10px]">
                                                                                            {graphKey} Graph Area
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                </React.Fragment>
                                                            );
                                                        }

                                                        const value = parseFloat(row.value);
                                                        let isAbnormal = false;
                                                        const min = row.name?.range?.[0]?.min;
                                                        const max = row.name?.range?.[0]?.max;
                                                        const upto = row.name?.range?.[0]?.upto;
                                                        if (!isNaN(value)) {
                                                            if (min !== undefined && min !== null && value < min) isAbnormal = true;
                                                            else if (max !== undefined && max !== null && value > max) isAbnormal = true;
                                                            else if (upto !== undefined && upto !== null && value > upto) isAbnormal = true;
                                                        }
                                                        return (
                                                            <React.Fragment key={`test-wrap-${rowIdx}`}>
                                                                {deptRow}
                                                                <tr key={`test-${rowIdx}`}>
                                                                    <td className={`pl-2 pt-[3px] ${rowIdx === 0 ? "pt-0" : ""}`}>
                                                                        <p className={`text-[12px]  text-black font-semibold pl-0`}>
                                                                            {row.name?.name || "Unknown test"}
                                                                        </p>
                                                                        {!!row?.name?.method && <p className="text-[9px] text-black pl-0">Method: {row.name?.method}</p>}
                                                                        {!!row?.name?.specimen && <p className="text-[9px] text-black pl-0">Specimen: {row.name?.specimen}</p>}
                                                                    </td>
                                                                    <td className={`px-2 pt-[3px] text-left text-[12px] leading-tight whitespace-nowrap ${rowIdx === 0 ? "pt-0" : ""}`}>
                                                                        <span className={isAbnormal ? "font-bold" : "text-black font-bold"}>
                                                                            {row.value || " "}
                                                                        </span>
                                                                        {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? (
                                                                            <span className="text-[11px] text-black font-semibold ml-1" dangerouslySetInnerHTML={{ __html: row.name.unit }} />
                                                                        ) : null}
                                                                    </td>
                                                                    <td className={`px-2 pt-[3px] text-[12px] font-semibold text-black ${rowIdx === 0 ? "pt-0" : ""}`}>
                                                                        {row.name?.range && row.name.range.length > 0 ? (
                                                                            row.name.range.map((r: any, idx: number) => {
                                                                                const hasMin = r.min !== undefined && r.min !== null && r.min !== "";
                                                                                const hasMax = r.max !== undefined && r.max !== null && r.max !== "";
                                                                                const hasUpto = r.upto !== undefined && r.upto !== null && r.upto !== "";
                                                                                if (!hasMin && !hasMax && !hasUpto) return null;
                                                                                
                                                                                let rangeDisplay = "";
                                                                                if (hasUpto) {
                                                                                    rangeDisplay = `Upto ${r.upto}`;
                                                                                } else if (hasMin && hasMax) {
                                                                                    rangeDisplay = `${r.min} - ${r.max}`;
                                                                                } else if (hasMin) {
                                                                                    rangeDisplay = `> ${r.min}`;
                                                                                } else if (hasMax) {
                                                                                    rangeDisplay = `< ${r.max}`;
                                                                                }

                                                                                return (
                                                                                    <div key={idx} className="whitespace-nowrap pb-[2px]">
                                                                                        {r.name && (row.name.range.length > 1 || r.name.toLowerCase() !== "normal") ? (
                                                                                            <span className="font-medium opacity-80 pr-1">{r.name}:</span>
                                                                                        ) : null}
                                                                                        {rangeDisplay}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        ) : "\u00A0"}
                                                                    </td>
                                                                </tr>

                                                            </React.Fragment>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>


                                </div>
                            </div>

                            {/* SIGNATURE & FOOTER (Pinned to Bottom) */}
                            <div className="bottom-grouping">
                                {isLastPage ? (
                                    <>
                                        <div className="text-center w-full mb-1 mt-1">
                                            <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">*** End of Report ***</p>
                                        </div>

                                        <div className="flex justify-between signature-section pb-2 px-10 mt-2.5">
                                            <div className="text-center w-64">

                                                <p className="font-bold text-black uppercase leading-none text-[12px]">LAB IN-CHARGE</p>
                                                <p className="text-[10px] font-bold text-black mt-1 uppercase">{report.technician || "LABORATORY"}</p>
                                            </div>
                                            <div className="text-center w-64">

                                                <p className="font-bold text-black uppercase leading-none  text-[12px]">LAB TECHNICIAN</p>

                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center w-full mb-3 mt-2">
                                        <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">*** Continue ***</p>
                                    </div>
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
