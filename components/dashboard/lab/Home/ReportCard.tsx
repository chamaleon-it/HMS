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
        @font-face {
          font-family: 'RobotoLocal';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/roboto/Roboto-Regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'RobotoLocal';
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url('/fonts/roboto/Roboto-Medium.woff2') format('woff2');
        }
        @font-face {
          font-family: 'RobotoLocal';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url('/fonts/roboto/Roboto-Bold.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Cinzel Decorative';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/cinzel-decorative/CinzelDecorative-Regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Cinzel Decorative';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url('/fonts/cinzel-decorative/CinzelDecorative-Bold.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Cinzel Decorative';
          font-style: normal;
          font-weight: 900;
          font-display: swap;
          src: url('/fonts/cinzel-decorative/CinzelDecorative-Black.woff2') format('woff2');
        }
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
            font-family: 'Times New Roman', Times, serif;
          }
          * {
              font-family: 'Times New Roman', Times, serif !important;
              text-rendering: geometricPrecision !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
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
                    "MICROBIOLOGY": 5,
                    "HORMONES": 6,
                    "CLINICAL PATHOLOGY": 7
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
                            else if (cat.includes("MICROBIOLOGY")) dept = "MICROBIOLOGY";
                            else if (cat.includes("HORMONES")) dept = "HORMONES";
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
                const MAX_PAGE_WEIGHT = 17.0;
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
                                <div className="pt-8 pb-4 px-10 relative z-10 bg-white">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-5 items-center">
                                            <div className="w-[110px] h-[110px] flex items-center justify-center bg-white shrink-0">
                                                <img src={configuration().logo} alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex flex-col gap-1 ml-0">
                                                <h1 className="text-[32px] uppercase leading-none tracking-widest font-bold">
                                                    <span className="text-[#164687]">VITAL</span> <span className="text-[#19988b]">MEDICALS</span>
                                                </h1>
                                                <div className="text-[14px] text-slate-800 mt-2 font-medium leading-[1.4]">
                                                    Chembrasseri, Ambalakalli, Pandikkad<br />
                                                    Malappuram, Kerala - 679327
                                                </div>
                                                <div className="flex gap-6 mt-2 text-[14px] font-bold text-slate-800">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-[#19988b]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" /><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z" /></svg>
                                                        +91 9961 218 320
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-[#164687]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" /><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z" /></svg>
                                                        +91 9400 989 016
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end mt-2 w-[260px]">
                                            <div className="bg-[#19988b] text-white w-full py-2.5 pl-6 pr-4 text-center" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                                                <h2 className="text-[18px] font-bold uppercase tracking-wider">LAB REPORT</h2>
                                            </div>
                                            {report.id && (
                                                <p className="text-[14px] text-slate-800 mt-2 pr-4 font-medium">Report No: {report.id.toString().slice(-6).padStart(6, '0')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Info Banner */}
                                <div className="w-full px-10 pb-6 pt-2">
                                    <div className="w-full border-[1.5px] border-[#19988b]/40 rounded-[20px] p-5 flex justify-between">
                                        <div className="flex flex-col space-y-2.5 text-[14px] text-slate-800">
                                            <div className="flex items-start"><span className="w-32 font-medium text-slate-700">Patient Name</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{patient?.name || "Mohammed Rashid"}</span></div>
                                            <div className="flex items-start"><span className="w-32 font-medium text-slate-700">Age/Sex</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{patient?.dateOfBirth ? `${fAgeString(patient.dateOfBirth)}` : "23"} / {patient?.gender || "Male"}</span></div>
                                            <div className="flex items-start"><span className="w-32 font-medium text-slate-700">Ref. By.</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{doctor?.name || "Self"}</span></div>
                                        </div>
                                        <div className="flex flex-col space-y-2.5 text-[14px] text-slate-800 w-[45%]">
                                            <div className="flex items-start"><span className="w-40 font-medium text-slate-700">Sample Collected On</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).toLowerCase() : "-"}</span></div>
                                            <div className="flex items-start"><span className="w-40 font-medium text-slate-700">Result Reported On</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{report.createdAt ? fDateandTime(report.createdAt).toLowerCase() : "-"}</span></div>
                                            <div className="flex items-start"><span className="w-40 font-medium text-slate-700">Result Printed On</span><span className="w-4 font-medium">:</span><span className="font-medium text-black">{fDateandTime(new Date()).toLowerCase()}</span></div>
                                        </div>
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
                                                                <div className="w-full bg-[#19988b] text-white py-2 px-4 mb-3 text-center">
                                                                    <h2 className="text-[16px] font-bold uppercase tracking-wider">{dept}</h2>
                                                                </div>
                                                            )}
                                                            {showPanelHeader && pg.heading && (
                                                                <div className="w-full bg-[#19988b]/90 text-white py-1.5 px-4 mb-2 text-center">
                                                                    <h2 className="text-[14px] font-bold uppercase tracking-wider">{pg.heading}</h2>
                                                                </div>
                                                            )}
                                                            <table className="w-full border-collapse">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="pb-4 w-[45%]">
                                                                            <div className="bg-[#164687] text-white py-2.5 px-4 pl-8 text-[13px] font-bold text-left uppercase tracking-wide">PARAMETER</div>
                                                                        </th>
                                                                        <th className="pb-4 w-[25%] px-1.5">
                                                                            <div className="bg-[#19988b] text-white py-2.5 px-4 text-[13px] font-bold text-center uppercase tracking-wide">RESULT</div>
                                                                        </th>
                                                                        <th className="pb-4 w-[30%]">
                                                                            <div className="bg-[#164687] text-white py-2.5 px-4 pl-8 text-[13px] font-bold text-left uppercase tracking-wide">REFERENCE RANGE</div>
                                                                        </th>
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
                                                                                        <td colSpan={3} className="py-3 px-3 pl-8 text-black">
                                                                                            <h3 className="text-[15px] font-bold uppercase tracking-wide">{row.name}</h3>
                                                                                        </td>
                                                                                    </tr>
                                                                                    {isFirstSub && panelMethod && (
                                                                                        <tr>
                                                                                            <td colSpan={3} className="px-8 pt-1 pb-1 text-[12px] text-slate-600 font-medium">Method: {panelMethod}</td>
                                                                                        </tr>
                                                                                    )}
                                                                                    {isFirstSub && panelSpecimen && (
                                                                                        <tr>
                                                                                            <td colSpan={3} className="px-8 pb-2 text-[12px] text-slate-600 font-medium">Specimen: {panelSpecimen}</td>
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
                                                                                <td className="py-2.5 px-1 pl-12 text-[14px] text-slate-800 align-top font-medium">
                                                                                    <div>{row.name?.name || "TEST"}</div>
                                                                                </td>
                                                                                <td className="py-2.5 px-2 text-[14px] text-slate-800 align-top text-center">
                                                                                    <div className="flex justify-center gap-1.5">
                                                                                        <span className={isAbnormal ? "font-bold text-black" : "font-bold text-black"}>{row.value || " "}</span>
                                                                                        {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? <span className="text-black font-bold" dangerouslySetInnerHTML={{ __html: row.name.unit }} /> : ""}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2.5 px-2 pl-12 text-[14px] text-slate-800 align-top font-medium">
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
                                            <div className="px-10 pb-[60px] w-full flex justify-between items-start">
                                                <div className="text-left w-1/3">
                                                    <p className="font-bold text-slate-800 text-[13px]">LAB IN-CHARGE</p>
                                                    <p className="text-[11px] text-slate-800 font-bold uppercase mt-1">{inChargeTechnician?.name || "LABORATORY"}</p>
                                                </div>
                                                <div className="text-center w-1/3 mt-2">
                                                    <p className="font-bold text-slate-500 text-[11px] tracking-widest uppercase">
                                                        {isLastPage ? "--- End Of the Result ---" : "--- Continue ---"}
                                                    </p>
                                                </div>
                                                <div className="text-right w-1/3">
                                                    <p className="font-bold text-slate-800 text-[13px]">LAB TECHNICIAN</p>
                                                    {/* <p className="text-[12px] text-slate-600 font-medium mt-1 uppercase">{report.technician || ""}</p> */}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Banner */}
                            <div className="absolute bottom-0 left-0 w-full z-20">
                                <div className="w-full bg-[#164687] text-white py-3.5 flex justify-center items-center">
                                    <p className="text-[14px] font-medium tracking-wide">
                                        <span className="font-bold">Working Hours :</span> 6:30 AM to 8:00 PM
                                    </p>
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
