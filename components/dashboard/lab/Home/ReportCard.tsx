import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import configuration from "@/config/configuration";
import useSWR from "swr";

interface ReportCardProps {
    report: any | null;
    panels?: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; method?: string; specimen?: string; department?: string; }[];
    panelPerPage?: boolean;
}

export default function ReportCard({ report, panels, panelPerPage = false }: ReportCardProps) {
    const [mounted, setMounted] = useState(false);

    const { data: labResponse } = useSWR<{ data: { _id: string; name: string; inCharge: boolean }[]; message: string }>("/technician");
    const inChargeTechnician = labResponse?.data?.find((p) => p.inCharge);

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
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel+Decorative:wght@400;700;900&family=Italianno&display=swap');
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
              font-family: 'Roboto', sans-serif !important;
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
            height: 297mm !important;
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
        }
      `}} />

            {(() => {
                const FIRST_PAGE_LIMIT = 16;
                const SUBSEQUENT_PAGE_LIMIT = 17;

                const allRows: any[] = [];
                const testMap = new Map<string, any>();
                (report.test || []).forEach((t: any) => {
                    testMap.set(t.name?._id?.toString() || "", t);
                });

                const normalizeHeading = (h: string) => {
                    let text = h.toUpperCase().trim();
                    if (text.includes("COMPLETE BLOOD COUNT")) return "COMPLETE BLOOD COUNT";
                    if (text.includes("HEMATOLOGY") || text.includes("HAEMATOLOGY") || text.includes("HAEMATOLOGY")) {
                        return "HAEMATOLOGY";
                    }
                    if (text.includes("BIOCHEMISTRY")) return "BIOCHEMISTRY";
                    return text;
                };

                const processedTestIds = new Set<string>();

                const deptPriority: Record<string, number> = {
                    "HAEMATOLOGY": 1,
                    "BIOCHEMISTRY": 2,
                    "SEROLOGY": 3,
                    "IMMUNOLOGY": 4,
                    "CLINICAL PATHOLOGY": 5
                };
                const getDeptPriority = (dept: string) => deptPriority[dept] || 99;

                const getHeadingInternalPriority = (heading: string, isSingleTestsGroup: boolean) => {
                    const h = heading.toUpperCase();
                    if (isSingleTestsGroup) return 0; // Single tests first within the department

                    // For Biochemistry panels
                    if (h.includes("GTT")) return 1;
                    if (h.includes("LIPID")) return 2;
                    if (h.includes("RFT") || h.includes("RENAL") || h.includes("KFT") || h.includes("KIDNEY")) return 3;
                    if (h.includes("LFT") || h.includes("LIVER")) return 4;

                    return 10;
                };

                const getTestInternalPriority = (testName: string, categoryName: string = "") => {
                    const t = testName.toUpperCase();
                    const cat = categoryName.toUpperCase();

                    if (t.includes("SUGAR") || t.includes("FBS") || t.includes("PPBS") || t.includes("RBS") || cat.includes("SUGAR")) return 1;
                    if (t.includes("LIPID") || t.includes("CHOLESTEROL") || t.includes("TRIGLYCERIDE") || t.includes("HDL") || t.includes("LDL") || t.includes("VLDL") || cat.includes("LIPID")) return 2;
                    if (t.includes("KFT") || t.includes("RFT") || t.includes("UREA") || t.includes("CREATININE") || t.includes("URIC ACID") || cat.includes("KFT") || cat.includes("RFT") || cat.includes("KIDNEY")) return 3;
                    if (t.includes("LFT") || t.includes("BILIRUBIN") || t.includes("SGPT") || t.includes("SGOT") || t.includes("ALKALINE") || t.includes("PROTEIN") || t.includes("ALBUMIN") || cat.includes("LFT") || cat.includes("LIVER")) return 4;
                    if (t.includes("HBA1C") || t.includes("GLUCOSE") || cat.includes("HBA1C")) return 5;
                    if (t.includes("HIV") || t.includes("HCV") || t.includes("HBSAG") || t.includes("VDRL") || t.includes("SEROLOGY") || t.includes("WIDAL") || cat.includes("SEROLOGY") || cat.includes("OLOGY")) return 6;
                    if (t.includes("URINE") || cat.includes("URINE")) return 8;
                    return 7;
                };

                const panelRowsGrouped: Record<string, any[]> = {};
                const headingToDepartment: Record<string, string> = {};

                let sortedPanels = [...(report.panels || [])];

                sortedPanels.forEach((panelIdStr: string) => {
                    const panelId = panelIdStr.toString();
                    const panelTests = (report.test || []).filter((t: any) => t.name?.panels?.some((p: any) => p.name === panelId));
                    if (panelTests.length === 0) return;

                    const panelConfig = panels?.find(p => p.name === panelId);
                    const heading = normalizeHeading(panelConfig?.mainHeading || panelId);
                    const department = (panelConfig?.department || "BIOCHEMISTRY").toUpperCase();
                    headingToDepartment[heading] = department;

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

                    if (!panelRowsGrouped[heading]) {
                        panelRowsGrouped[heading] = [{
                            type: "PANEL",
                            name: heading,
                            activePanel: panelId,
                            mainHeading: heading
                        }];
                    }

                    let currentSubheadingState: string | null = null;
                    let pendingSubheading: string | null = null;

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
                                if (pendingSubheading) {
                                    panelRowsGrouped[heading].push({ type: "SUBHEADING", name: pendingSubheading, activePanel: panelId, mainHeading: heading });
                                    pendingSubheading = null;
                                }
                                panelRowsGrouped[heading].push({ type: "TEST", ...t, activePanel: panelId, mainHeading: heading });
                            }

                            processedTestIds.add(id);
                            testMap.delete(id);
                        }
                    });
                });

                // Handle remaining tests (loose tests)
                const looseTests: Record<string, any[]> = {};
                Array.from(testMap.values()).forEach((t: any) => {
                    const valStr = t.value !== undefined && t.value !== null ? String(t.value).trim() : "";
                    if (valStr !== "") {
                        let dept = (t.name?.department || "").toString().toUpperCase();
                        if (!dept) {
                            // Fallback if department is missing
                            const cat = (t.name?.category || "").toString().toUpperCase();
                            if (cat.includes("HEAMAT") || cat.includes("HEMAT") || cat.includes("HAEMAT") || cat.includes("CBC")) dept = "HAEMATOLOGY";
                            else if (cat.includes("SEROLOGY")) dept = "SEROLOGY";
                            else if (cat.includes("IMMUNOLOGY")) dept = "IMMUNOLOGY";
                            else if (cat.includes("CLINICAL")) dept = "CLINICAL PATHOLOGY";
                            else dept = "BIOCHEMISTRY";
                        }

                        let heading = dept; // Group loose tests by department name
                        if (!looseTests[heading]) looseTests[heading] = [];
                        looseTests[heading].push({ type: "TEST", ...t, activePanel: heading, mainHeading: heading });
                        headingToDepartment[heading] = dept;
                    }
                });

                // Insert loose tests into their respective headings just after the PANEL row
                Object.keys(looseTests).forEach(heading => {
                    if (!panelRowsGrouped[heading]) {
                        panelRowsGrouped[heading] = [{
                            type: "PANEL",
                            name: heading,
                            activePanel: heading,
                            mainHeading: heading
                        }];
                    }

                    // Sort loose tests so Sugar/Lipid/etc have some priority, but keep them isolated at the top
                    looseTests[heading].sort((a, b) => {
                        const tA = a.name?.name || a.name || "";
                        const catA = (a.name?.category || "").toString();
                        const tB = b.name?.name || b.name || "";
                        const catB = (b.name?.category || "").toString();
                        return getTestInternalPriority(tA, catA) - getTestInternalPriority(tB, catB);
                    });

                    // Insert loose tests right after the PANEL row (index 1)
                    panelRowsGrouped[heading].splice(1, 0, ...looseTests[heading]);
                });

                // Compile finalRows based on priority
                const finalRows: any[] = [];
                const sortedHeadings = Object.keys(panelRowsGrouped).sort((a, b) => {
                    const deptA = headingToDepartment[a] || "UNKNOWN";
                    const deptB = headingToDepartment[b] || "UNKNOWN";

                    if (deptA !== deptB) {
                        return getDeptPriority(deptA) - getDeptPriority(deptB);
                    }

                    // Same department
                    const isSingleA = a === deptA; // If the heading is exactly the department name, it's the loose tests group
                    const isSingleB = b === deptB;

                    if (isSingleA && !isSingleB) return -1;
                    if (!isSingleA && isSingleB) return 1;

                    return getHeadingInternalPriority(a, isSingleA) - getHeadingInternalPriority(b, isSingleB);
                });

                sortedHeadings.forEach(h => {
                    // Only add if there's actually a test (length > 1 because first is PANEL)
                    const rows = panelRowsGrouped[h];
                    const hasTest = rows.some(r => r.type === "TEST");
                    if (hasTest) {
                        finalRows.push(...rows);
                    }
                });

                // Chunk Into Pages with Continuous Flow, isolating Haematology based on CBC presence
                const pages: any[][] = [];
                let currentPageRows: any[] = [];
                let currentPageWeight = 0;
                let isFirstPageVar = true;

                // Weight constants for accurate page height calculation
                const MAX_PAGE_WEIGHT = 21.0;
                const getRowWeight = (r: any) => {
                    if (r.type === "PANEL") return 3.2; // Panels have a gray box + table header
                    if (r.type === "SUBHEADING") return 2.0; // Subheadings have top padding and potential Method/Specimen rows

                    let weight = 1.0; // Normal test row
                    const isCBC = (r.activePanel || r.mainHeading || "").toUpperCase().includes("COMPLETE BLOOD COUNT");

                    // CBC tests are squished to 65% width, causing long names to wrap onto multiple lines
                    if (isCBC) {
                        weight = 1.2;
                        if (r.name?.name && r.name.name.length > 18) {
                            weight += 0.5; // Heavy wrapping
                        }
                    }

                    // Multi-line reference ranges (like Male/Female splits) drastically increase row height
                    if (r.name?.range && r.name.range.length > 1) {
                        weight += (r.name.range.length - 1) * 0.8;
                    }

                    return weight;
                };

                const reportHasCBC = finalRows.some(r => {
                    const h = (r.mainHeading || r.activePanel || "").toUpperCase();
                    return h.includes("COMPLETE BLOOD COUNT") || h.includes("CBC");
                });

                for (let i = 0; i < finalRows.length; i++) {
                    const row = finalRows[i];
                    const prevRow = i > 0 ? finalRows[i - 1] : null;

                    const getIsHaem = (r: any) => {
                        if (!r) return false;
                        const pHeading = (r.mainHeading || r.activePanel || "").toUpperCase();
                        return pHeading.includes("HEMATOLOGY") || pHeading.includes("HAEMATOLOGY") || pHeading.includes("HAEMATOLOGY") || pHeading.includes("CBC") || pHeading.includes("COMPLETE BLOOD COUNT");
                    };

                    const isPrevHaematology = getIsHaem(prevRow);
                    const isCurrHaematology = getIsHaem(row);

                    const rowWeight = getRowWeight(row);
                    const forceBreak = reportHasCBC && isPrevHaematology && !isCurrHaematology;

                    if ((currentPageWeight + rowWeight > MAX_PAGE_WEIGHT && currentPageRows.length > 0) || (forceBreak && currentPageRows.length > 0)) {
                        // pull back trailing headings to avoid orphaned headers at bottom of page
                        let orphaned = [];
                        let orphanedWeight = 0;

                        if (currentPageRows.length > 0 && row && currentPageRows[currentPageRows.length - 1].activePanel === row.activePanel) {
                            let testsOfCurrentPanel = 0;
                            for (let j = currentPageRows.length - 1; j >= 0; j--) {
                                const r = currentPageRows[j];
                                if (r.activePanel !== row.activePanel) break;
                                if (r.type === "TEST") {
                                    testsOfCurrentPanel++;
                                }
                            }

                            if (testsOfCurrentPanel > 0 && testsOfCurrentPanel <= 2) {
                                while (currentPageRows.length > 0 && currentPageRows[currentPageRows.length - 1].activePanel === row.activePanel) {
                                    const popped = currentPageRows.pop();
                                    orphaned.unshift(popped);
                                    orphanedWeight += getRowWeight(popped);
                                }
                            }
                        }

                        while (currentPageRows.length > 0 &&
                            (currentPageRows[currentPageRows.length - 1].type === "PANEL" ||
                                currentPageRows[currentPageRows.length - 1].type === "SUBHEADING")) {
                            const popped = currentPageRows.pop();
                            orphaned.unshift(popped);
                            orphanedWeight += getRowWeight(popped);
                        }

                        // If we pulled everything (edge case), just put one back to avoid infinite loops
                        if (currentPageRows.length === 0 && orphaned.length > 0) {
                            const shifted = orphaned.shift();
                            currentPageRows.push(shifted);
                            orphanedWeight -= getRowWeight(shifted);
                        }

                        pages.push(currentPageRows);
                        currentPageRows = [...orphaned];
                        currentPageWeight = orphanedWeight;
                        isFirstPageVar = false;
                    }

                    currentPageRows.push(row);
                    currentPageWeight += rowWeight;
                }

                if (currentPageRows.length > 0) {
                    pages.push(currentPageRows);
                }

                if (pages.length === 0) pages.push([]);

                return pages.map((pageRows, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const isLastPage = pageIdx === pages.length - 1;

                    const isCBCName = (pName: any) => {
                        if (!pName || typeof pName !== 'string') return false;
                        const upper = pName.toUpperCase();
                        return upper.includes("CBC") || upper.includes("COMPLETE BLOOD COUNT");
                    };

                    const pageHasCBC = pageRows.some(row => isCBCName(row.activePanel) || isCBCName(row.name) || isCBCName(row.mainHeading));
                    const showHistograms = pageHasCBC && pages.findIndex(pr => pr.some(row => isCBCName(row.activePanel) || isCBCName(row.name) || isCBCName(row.mainHeading))) === pageIdx;


                    return (
                        <div key={pageIdx} className={`a4-page shadow-none bg-white ${isLastPage ? 'print-page-last' : 'print-page-break'} flex flex-col relative`}>
                            <div className="flex-1 flex flex-col z-10 relative">
                                {/* Header Section */}
                                <div className="pt-6 pb-3 px-10 relative z-10 bg-white">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center bg-white shrink-0 overflow-hidden">
                                                <img src={configuration().logo} alt="Logo" className="w-full h-full object-cover mix-blend-multiply p-1" />
                                            </div>
                                            <div className="flex flex-col gap-0.5 ml-0">
                                                <h1 className="text-[20px] text-black uppercase leading-none tracking-widest font-fraunces font-semibold" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{configuration().hospitalName}</h1>
                                                <p className="text-[15px] text-slate-800 mt-1">{configuration().hospitalAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end mt-2">
                                            <div className="bg-[#3E58A1] text-white px-4 py-1.5 text-center">
                                                <h2 className="text-[14px] font-normal uppercase tracking-wide">LABORATORY TEST REPORT</h2>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex h-[5px] shrink-0">
                                    <div className="bg-[#48CFCB] w-[70%] h-full"></div>
                                    <div className="bg-[#3E58A1] w-[30%] h-full"></div>
                                </div>

                                {/* Patient Info Banner */}
                                <div className="w-full px-12 py-4 flex justify-between">
                                    <div className="flex flex-col space-y-1.5 text-[15px] text-black">
                                        <div className="flex items-start"><span className="w-32 font-medium">Name</span><span className="w-4 font-bold">:</span><span className="font-bold text-[16px] uppercase">{patient?.name || "Mohammed Rashid"}</span></div>
                                        <div className="flex items-start"><span className="w-32 font-medium">Age/ Gender</span><span className="w-4 font-bold">:</span><span className="font-medium">{patient?.dateOfBirth ? `${fAgeString(patient.dateOfBirth)}` : "23"} / {patient?.gender || "Male"}</span></div>
                                        <div className="flex items-start"><span className="w-32 font-medium">Ref. By.</span><span className="w-4 font-bold">:</span><span className="font-medium uppercase">{doctor?.name || "Self"}</span></div>
                                    </div>
                                    <div className="flex flex-col space-y-1.5 text-[15px] text-black w-[40%]">
                                        <div className="flex items-start"><span className="w-28 font-medium">Reported</span><span className="w-4 font-bold">:</span><span className="font-medium">{report.createdAt && fDateandTime(report.createdAt).toLowerCase()}</span></div>
                                        <div className="flex items-start"><span className="w-28 font-medium">Received</span><span className="w-4 font-bold">:</span><span className="font-medium">{report.sampleCollectedAt && fDateandTime(report.sampleCollectedAt).toLowerCase()}</span></div>
                                        <div className="flex items-start"><span className="w-28 font-medium">Printed</span><span className="w-4 font-bold">:</span><span className="font-medium">{fDateandTime(new Date()).toLowerCase()}</span></div>
                                    </div>
                                </div>

                                {/* Results Table Section */}
                                <div className="mt-1 px-10 flex-1 relative">
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
                                        <img src={configuration().logo} alt="Watermark" className="w-[15cm] object-contain grayscale" />
                                    </div>
                                    <div className="flex w-full gap-3 relative z-10">
                                        <div className={`${showHistograms ? 'w-[65%]' : 'w-full'} flex flex-col gap-6`}>
                                            {(() => {
                                                const panelGroupsOnPage: { heading: string, rows: any[] }[] = [];
                                                let currentGroup: any[] = [];
                                                let currentHeading = "";

                                                pageRows.forEach((row) => {
                                                    if (row.type === "PANEL") {
                                                        const newHeading = normalizeHeading(row.mainHeading || row.name || "");
                                                        if (currentHeading !== "" && newHeading && normalizeHeading(currentHeading) === newHeading) {
                                                            // Same heading, skip creating a new table
                                                        } else {
                                                            if (currentGroup.length > 0 || currentHeading !== "") {
                                                                panelGroupsOnPage.push({ heading: normalizeHeading(currentHeading), rows: currentGroup });
                                                            }
                                                            currentHeading = newHeading;
                                                            currentGroup = [];
                                                        }
                                                    } else {
                                                        if (currentHeading === "" && currentGroup.length === 0) {
                                                            const pConfig = panels?.find((p: any) => p.name === row.activePanel);
                                                            currentHeading = normalizeHeading(pConfig?.mainHeading || row.activePanel || "");
                                                        }
                                                        currentGroup.push(row);
                                                    }
                                                });
                                                if (currentGroup.length > 0 || currentHeading !== "") {
                                                    panelGroupsOnPage.push({ heading: normalizeHeading(currentHeading), rows: currentGroup });
                                                }

                                                return panelGroupsOnPage.map((pg, pgIdx) => {
                                                    const dept = headingToDepartment[pg.heading] || "";
                                                    const isFirstOfDept = pgIdx === 0 || headingToDepartment[panelGroupsOnPage[pgIdx - 1].heading] !== dept;

                                                    const showDeptHeader = isFirstOfDept && dept !== "";
                                                    const showPanelHeader = pg.heading !== dept;

                                                    return (
                                                        <div key={pgIdx} className="w-full">
                                                            {showDeptHeader && (
                                                                <div className="w-full bg-gray-300 text-black py-2 px-4 mb-1 text-center">
                                                                    <h2 className="text-[15px] font-bold uppercase tracking-wider">{dept}</h2>
                                                                </div>
                                                            )}
                                                            {showPanelHeader && pg.heading && (
                                                                <div className="w-full bg-gray-300/60 text-black py-1.5 px-4 mb-0 text-center border-b border-white">
                                                                    <h2 className="text-[13px] font-bold uppercase tracking-wider">{pg.heading}</h2>
                                                                </div>
                                                            )}
                                                            <table className="w-full border-collapse">
                                                                <thead>
                                                                    <tr className="bg-gray-300/60 text-black border-y border-white">
                                                                        <th className="py-2.5 px-2 pl-8 text-[12px] font-bold text-left w-[45%] border-r-[3px] border-white">PARAMETER</th>
                                                                        <th className="py-2.5 px-2 text-[12px] font-bold text-left w-[25%] border-r-[3px] border-white">RESULT</th>
                                                                        <th className="py-2.5 px-2 pl-8 text-[12px] font-bold text-left w-[30%]">REFERENCE RANGE</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {pg.rows.map((row, rowIdx) => {
                                                                        if (row.type === "PANEL") return null;

                                                                        if (row.type === "SUBHEADING") {
                                                                            const panel = panels?.find((p: any) => p.name === row.activePanel)
                                                                            const panelMethod = panel?.method
                                                                            const panelSpecimen = panel?.specimen
                                                                            const subheadings = panel?.subheadings ?? []
                                                                            const isFirstSub = subheadings.length === 0 || subheadings[0] === row.name;

                                                                            return (
                                                                                <React.Fragment key={`sub-${rowIdx}`}>
                                                                                    <tr>
                                                                                        <td colSpan={3} className="py-2 px-3 pl-8 pt-4 text-black">
                                                                                            <h3 className="text-[15px] font-bold uppercase underline underline-offset-4 decoration-2">{row.name}</h3>
                                                                                        </td>
                                                                                    </tr>
                                                                                    {isFirstSub && panelMethod && (
                                                                                        <tr>
                                                                                            <td colSpan={3} className="px-7 pt-1 text-[12px] text-slate-600">Method: {panelMethod}</td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {isFirstSub && panelSpecimen && (
                                                                                        <tr>
                                                                                            <td colSpan={3} className="px-7 pb-2 text-[12px] text-slate-600">Specimen: {panelSpecimen}</td>
                                                                                        </tr>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            );
                                                                        }

                                                                        if (row.type !== "TEST") return null;

                                                                        const v = parseFloat(row.value);
                                                                        let min, max, upto;
                                                                        if (row.name?.range?.[0]) {
                                                                            min = row.name.range[0].min;
                                                                            max = row.name.range[0].max;
                                                                            upto = row.name.range[0].upto;
                                                                        }

                                                                        let isAbnormal = false;
                                                                        if (min !== undefined && min !== null && min !== "" && v < min) isAbnormal = true;
                                                                        else if (max !== undefined && max !== null && max !== "" && v > max) isAbnormal = true;
                                                                        else if (upto !== undefined && upto !== null && upto !== "" && v > upto) isAbnormal = true;

                                                                        return (
                                                                            <tr key={"test-" + rowIdx}>
                                                                                <td className="py-1.5 px-1 pl-12 text-[14px] text-slate-800 align-top">
                                                                                    <div>{row.name?.name || "TEST"}</div>
                                                                                </td>
                                                                                <td className="py-1.5 px-2 text-[14px] text-slate-800 align-top text-left">
                                                                                    <div className="flex justify-start gap-1">
                                                                                        <span className={isAbnormal ? "font-bold text-black" : "font-bold"}>{row.value || " "}</span>
                                                                                        {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? <span className="text-black font-bold" dangerouslySetInnerHTML={{ __html: row.name.unit }} /> : ""}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-1.5 px-2 pl-8 text-[14px] text-slate-800 align-top font-normal">
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
                                                                                                rangeDisplay = `>${r.min}`;
                                                                                            } else if (hasMax) {
                                                                                                rangeDisplay = `<${r.max}`;
                                                                                            }

                                                                                            return (
                                                                                                <div key={idx}>
                                                                                                    {r.name && r.name.toLowerCase() !== "normal" ? <span className="pr-1">{r.name}:</span> : ""}
                                                                                                    {rangeDisplay} <span className="text-[12px]" dangerouslySetInnerHTML={{ __html: row.name?.unit || "" }} />
                                                                                                </div>
                                                                                            );
                                                                                        })
                                                                                    ) : ""}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>

                                        {showHistograms && (
                                            <div className="w-[35%] pl-3 border-l border-slate-200">
                                                <div className="bg-gray-300 py-2 px-3 mb-4">
                                                    <h3 className="text-[14px] font-bold text-center text-slate-800">Histograms</h3>
                                                </div>

                                                <div className="flex flex-col gap-6">
                                                    {['WBC', 'RBC', 'PLT'].map((graphKey) => {
                                                        const fullGraphKey = `${graphKey} Histogram. BMP`;

                                                        return (
                                                            <div key={graphKey} className="flex flex-col">
                                                                <div className="bg-[#e4eff0] px-2 py-1 mb-2 inline-block self-start">
                                                                    <span className="text-[13px] font-bold text-slate-800">{graphKey}</span>
                                                                </div>
                                                                {report?.graphs && fullGraphKey && report.graphs[fullGraphKey] ? (
                                                                    <img
                                                                        src={`data:image/png;base64,${report.graphs[fullGraphKey]}`}
                                                                        alt={`${graphKey} Histogram`}
                                                                        className="w-[200px] h-[100px] object-contain mix-blend-multiply ml-4"
                                                                        style={{ filter: "url(#edge-detect-hms) invert(1) brightness(0.7) contrast(300%) grayscale(100%)" }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-[200px] h-[100px] border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 ml-4">
                                                                        {graphKey} Graph Area
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="w-full mt-auto pt-8">
                                    {(
                                        <>
                                            {isLastPage && report.note && (
                                                <div className="w-full px-10 pb-4 text-left">
                                                    <div className="border-t border-slate-300 pt-2">
                                                        <p className="text-xs font-bold text-black uppercase tracking-wide">Note:</p>
                                                        <p className="text-[11px] font-medium text-slate-800 mt-1 whitespace-pre-wrap leading-normal font-sans">
                                                            {report.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="px-10 pb-32 w-full flex justify-between items-start">
                                                <div className="text-left w-1/3">
                                                    <p className="font-bold text-slate-800 text-[12px]">LAB IN-CHARGE</p>
                                                    <p className="text-[11px] text-slate-800 font-bold uppercase mt-0">{inChargeTechnician?.name || "LABORATORY"}</p>
                                                </div>
                                                <div className="text-center w-1/3 mt-2">
                                                    <p className="font-bold text-slate-500 text-[11px] tracking-widest uppercase">
                                                        {isLastPage ? "--- End Of the Result ---" : "--- Continue ---"}
                                                    </p>
                                                </div>
                                                <div className="text-right w-1/3">
                                                    <p className="font-bold text-slate-800 text-[12px]">LAB TECHNICIAN</p>
                                                    {/* <p className="text-[12px] text-slate-600 font-medium mt-1 uppercase">{report.technician || ""}</p> */}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Banner */}
                            <div className="absolute bottom-0 left-0 w-full z-20">
                                <div className="px-10 py-3 flex justify-between items-end text-black">
                                    <div className="text-[12px] font-medium">
                                        OP Time<br />
                                        <span className="font-medium"> Monday-Saturday<br />3:00 PM to 8:00 PM</span>
                                    </div>
                                    <div className="text-[12px] text-right font-medium">
                                        Working Hours<br />
                                        <span className="font-medium">6:30 AM to 8:00 PM <br />Sunday 6:30 AM to 12:00 PM</span>
                                    </div>
                                </div>
                                <div className="w-full flex h-[5px]">
                                    <div className="bg-[#48CFCB] w-[70%] h-full"></div>
                                    <div className="bg-[#3E58A1] w-[30%] h-full"></div>
                                </div>
                                <div className="flex w-full justify-between items-center p-4">
                                    <div className="text-black">

                                        <div className="flex gap-6 items-center text-[13px] font-medium">
                                            <div className="flex items-center gap-1">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" /><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z" /></svg>
                                                {configuration().hospitalPhone}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z" /></svg>
                                                {configuration().hospitalEmail}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px]">
                                        Powered by Caresoft Innovations LLP
                                    </div>
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
