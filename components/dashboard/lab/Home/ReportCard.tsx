import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fDateandTime, fAgeString } from "@/lib/fDateAndTime";
import configuration from "@/config/configuration";
import useSWR from "swr";

interface ReportCardProps {
    report: any | null;
    panels?: { name: string; price: number; estimatedTime?: number; mainHeading?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; tests?: any[]; method?: string; specimen?: string }[];
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
            height: 296mm !important;
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
                const FIRST_PAGE_LIMIT = 20;
                const SUBSEQUENT_PAGE_LIMIT = 24;

                const allRows: any[] = [];
                const testMap = new Map<string, any>();
                (report.test || []).forEach((t: any) => {
                    testMap.set(t.name?._id?.toString() || "", t);
                });

                const processedTestIds = new Set<string>();

                let sortedPanels = [...(report.panels || [])];
                sortedPanels.sort((a: string, b: string) => {
                    const aConfig = panels?.find((pItem: any) => pItem.name === a);
                    const bConfig = panels?.find((pItem: any) => pItem.name === b);
                    const aHeading = (aConfig?.mainHeading || a).toUpperCase();
                    const bHeading = (bConfig?.mainHeading || b).toUpperCase();

                    const isAHematology = aHeading.includes("HAEMATOLOGY") || aHeading.includes("HEMATOLOGY") || aHeading.includes("HEAMATOLOGY") || aHeading.includes("CBC");
                    const isBHematology = bHeading.includes("HAEMATOLOGY") || bHeading.includes("HEMATOLOGY") || bHeading.includes("HEAMATOLOGY") || bHeading.includes("CBC");

                    if (isAHematology && !isBHematology) return -1;
                    if (!isAHematology && isBHematology) return 1;
                    return 0;
                });

                sortedPanels.forEach((panelIdStr: string) => {
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

                    orderedIds.sort((a, b) => {
                        const tA = testMap.get(a)?.name?.name?.toUpperCase() || "";
                        const tB = testMap.get(b)?.name?.name?.toUpperCase() || "";
                        const aPriority = tA.includes("SUGAR") || tA.includes("URIC") || tA.includes("URINE");
                        const bPriority = tB.includes("SUGAR") || tB.includes("URIC") || tB.includes("URINE");
                        if (aPriority && !bPriority) return -1;
                        if (!aPriority && bPriority) return 1;
                        return 0;
                    });

                    const testSubheadings = panelConfig?.testSubheadings || {};
                    let currentSubheadingState: string | null = null;
                    let pendingSubheading: string | null = null;

                    let panelRow: any = {
                        type: "PANEL",
                        name: panelId,
                        activePanel: panelId,
                        mainHeading: panelConfig?.mainHeading || panelId
                    };
                    let panelPushed = false;

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
                                    allRows.push({ type: "SUBHEADING", name: pendingSubheading, activePanel: panelId });
                                    pendingSubheading = null;
                                }
                                allRows.push({ type: "TEST", ...t, activePanel: panelId });
                            }

                            processedTestIds.add(id);
                            testMap.delete(id);
                        }
                    });
                });

                let remainingTests: any[] = [];
                Array.from(testMap.values()).forEach((t: any) => {
                    const valStr = t.value !== undefined && t.value !== null ? String(t.value).trim() : "";
                    if (valStr !== "") {
                        remainingTests.push(t);
                    }
                });

                if (remainingTests.length > 0) {
                    remainingTests.sort((a, b) => {
                        const tA = a.name?.name?.toUpperCase() || "";
                        const tB = b.name?.name?.toUpperCase() || "";
                        const aPriority = tA.includes("SUGAR") || tA.includes("URIC") || tA.includes("URINE");
                        const bPriority = tB.includes("SUGAR") || tB.includes("URIC") || tB.includes("URINE");
                        if (aPriority && !bPriority) return -1;
                        if (!aPriority && bPriority) return 1;
                        return 0;
                    });

                    const panelId = "BIOCHEMISTRY";
                    allRows.push({
                        type: "PANEL",
                        name: panelId,
                        activePanel: panelId,
                        mainHeading: "BIOCHEMISTRY"
                    });
                    remainingTests.forEach(t => {
                        allRows.push({ type: "TEST", ...t, activePanel: panelId });
                    });
                }

                // Group by activePanel first to maintain grouping
                const panelGroups: Record<string, any[]> = {};
                const panelOrder: string[] = [];

                allRows.forEach((row) => {
                    const p = row.activePanel || "BIOCHEMISTRY";
                    if (!panelGroups[p]) {
                        panelGroups[p] = [];
                        panelOrder.push(p);
                    }
                    panelGroups[p].push(row);
                });

                // Sort panelOrder: 1) Hematology, 2) Biochemistry, 3) Category panels (with subheadings), 4) Others
                const getHaemCheck = (name: string) => {
                    const cfg = panels?.find((pItem: any) => pItem.name === name);
                    const heading = (cfg?.mainHeading || name || "").toUpperCase();
                    return heading.includes("HEMATOLOGY") || heading.includes("HAEMATOLOGY") || heading.includes("HEAMATOLOGY") || heading.includes("CBC");
                };
                const getBiochemCheck = (name: string) => {
                    const heading = (name || "").toUpperCase();
                    return heading === "BIOCHEMISTRY";
                };
                const getCategoryCheck = (name: string) => {
                    const cfg = panels?.find((pItem: any) => pItem.name === name);
                    return cfg?.subheadings && cfg.subheadings.length > 0;
                };

                panelOrder.sort((a, b) => {
                    const getPriority = (p: string) => {
                        if (getHaemCheck(p)) return 0;
                        if (getBiochemCheck(p)) return 1;
                        if (getCategoryCheck(p)) return 2;
                        return 3;
                    };
                    return getPriority(a) - getPriority(b);
                });

                // Flatten panel groups to remove duplicate PANEL rows (e.g. 2 Biochemistry)
                const finalRows: any[] = [];
                const seenPanels = new Set<string>();

                panelOrder.forEach((p) => {
                    panelGroups[p].forEach(row => {
                        if (row.type === "PANEL") {
                            const heading = row.mainHeading || row.name;
                            if (seenPanels.has(heading)) return;
                            seenPanels.add(heading);
                        }
                        finalRows.push(row);
                    });
                });

                // Chunk Into Pages with Continuous Flow, isolating Haematology
                const pages: any[][] = [];
                let currentPageRows: any[] = [];
                let isFirstPageVar = true;
                let currentLimit = FIRST_PAGE_LIMIT;

                for (let i = 0; i < finalRows.length; i++) {
                    const row = finalRows[i];
                    const prevRow = i > 0 ? finalRows[i - 1] : null;

                    const getIsHaem = (r: any) => {
                        if (!r) return false;
                        const pConfig = panels?.find((pItem: any) => pItem.name === r.activePanel);
                        const pHeading = (pConfig?.mainHeading || r.activePanel || r.mainHeading || r.name?.name || r.name || "")?.toUpperCase();
                        return pHeading.includes("HEMATOLOGY") || pHeading.includes("HAEMATOLOGY") || pHeading.includes("HEAMATOLOGY") || pHeading.includes("CBC");
                    };

                    const isPrevHaematology = getIsHaem(prevRow);
                    const isCurrHaematology = getIsHaem(row);

                    // Force page break when leaving Haematology
                    if (isPrevHaematology && !isCurrHaematology && currentPageRows.length > 0) {
                        pages.push(currentPageRows);
                        currentPageRows = [];
                        isFirstPageVar = false;
                        currentLimit = SUBSEQUENT_PAGE_LIMIT;
                    }

                    if (currentPageRows.length >= currentLimit) {
                        pages.push(currentPageRows);
                        currentPageRows = [];
                        isFirstPageVar = false;
                        currentLimit = SUBSEQUENT_PAGE_LIMIT;
                    }

                    currentPageRows.push(row);
                }

                if (currentPageRows.length > 0) {
                    pages.push(currentPageRows);
                }

                if (pages.length === 0) pages.push([]);

                // Overlay Watermark Background
                const watermark = (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
                        <img src={configuration().logo} alt="Watermark" className="w-[15cm] object-contain grayscale" />
                    </div>
                );

                return pages.map((pageRows, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const isLastPage = pageIdx === pages.length - 1;
                    const pageHasCBC = pageRows.some(row => {
                        const pName = row.activePanel || row.name;
                        return pName && typeof pName === 'string' && pName.toUpperCase().includes("CBC");
                    });
                    const showHistograms = pageHasCBC && pages.findIndex(pr => pr.some(row => {
                        const pName = row.activePanel || row.name;
                        return pName && typeof pName === 'string' && pName.toUpperCase().includes("CBC");
                    })) === pageIdx;

                    return (
                        <div key={pageIdx} className={`a4-page shadow-none bg-white ${isLastPage ? 'print-page-last' : 'print-page-break'} flex flex-col relative`}>
                            {watermark}
                            <div className="flex-1 flex flex-col z-10 relative">
                                {/* Header Section */}
                                <div className="pt-6 px-10 pb-4 relative z-0">
                                    <img src="/report-corner-icon.png" alt="Corner Icon" className="absolute top-0 right-0 w-1/2 object-contain object-right-top opacity-30 pointer-events-none mix-blend-multiply z-0" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-[110px] h-[110px] rounded-full border border-teal-100 flex items-center justify-center bg-white shrink-0 overflow-hidden">
                                                <img src={configuration().logo} alt="Logo" className="w-full h-full object-cover mix-blend-multiply p-1" />
                                            </div>
                                            <div className="flex flex-col gap-1 ml-2">
                                                <h1 className="text-[28px] font-bold text-slate-800 uppercase leading-none tracking-wide">{configuration().hospitalName}</h1>
                                                <p className="text-[14px] text-slate-600 mt-1">{configuration().hospitalAddress}</p>
                                                <div className="flex items-center gap-6 mt-1 text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#89b9c4]"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" /><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z" /></svg>
                                                        <span className="text-[14px] font-medium text-slate-600">+91 {configuration().hospitalPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#89b9c4]">
                                                            <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z" />
                                                        </svg>
                                                        <span className="text-[14px] font-medium text-slate-600">arrahmamedicarelab@gmail.com</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 mt-2">
                                            <h2 className="text-[32px] font-bold text-slate-800 leading-none">LAB REPORT</h2>
                                            <p className="text-[16px] text-slate-600 font-medium">Report No : {String(report.mrn || "0056").padStart(4, "0")}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Info Banner */}
                                <div className="bg-[#d9e9e8] w-full px-10 py-5 flex justify-between">
                                    <div className="flex flex-col space-y-2 text-[15px] text-slate-800">
                                        <div className="flex items-center"><span className="w-28 text-slate-700">Patient Name</span><span className="w-4">:</span><span className="font-semibold">{patient?.name || "Rashid"}</span></div>
                                        <div className="flex items-center"><span className="w-28 text-slate-700">Age/Sex</span><span className="w-4">:</span><span className="font-semibold">{patient?.dateOfBirth ? `${fAgeString(patient.dateOfBirth)}` : "26Y 3M"} / {patient?.gender || "Male"}</span></div>
                                        <div className="flex items-center"><span className="w-28 text-slate-700">Ref. By.</span><span className="w-4">:</span><span className="font-semibold">Dr. {doctor?.name || "Self"}</span></div>
                                    </div>
                                    <div className="flex flex-col space-y-2 text-[15px] text-slate-800 w-[45%]">
                                        {/* <div className="flex items-center border-b border-slate-400/30 pb-0.5"><span className="w-40 text-slate-700">Sample Collected On</span><span className="w-4">:</span><span className="font-semibold">{report.sampleCollectedAt ? fDateandTime(report.sampleCollectedAt).toLowerCase() : "02/06/26 10:23 am"}</span></div> */}
                                        <div className="flex items-center border-b border-slate-400/30 pb-0.5"><span className="w-40 text-slate-700">Result Reported On</span><span className="w-4">:</span><span className="font-semibold">{report.testStartedAt ? fDateandTime(report.testStartedAt).toLowerCase() : "02/06/26 10:23 am"}</span></div>
                                        <div className="flex items-center border-b border-slate-400/30 pb-0.5"><span className="w-40 text-slate-700">Result Printed On</span><span className="w-4">:</span><span className="font-semibold">{fDateandTime(new Date()).toLowerCase()}</span></div>
                                    </div>
                                </div>

                                {/* Results Table Section */}
                                <div className="mt-4 px-10">

                                    <div className="flex w-full gap-4 relative">
                                        <div className={`${showHistograms ? 'w-[65%]' : 'w-full'} flex flex-col gap-6`}>
                                            {(() => {
                                                const panelGroupsOnPage: { heading: string, rows: any[] }[] = [];
                                                let currentGroup: any[] = [];
                                                let currentHeading = "";

                                                pageRows.forEach((row) => {
                                                    if (row.type === "PANEL") {
                                                        if (currentGroup.length > 0 || currentHeading !== "") {
                                                            panelGroupsOnPage.push({ heading: currentHeading, rows: currentGroup });
                                                        }
                                                        currentHeading = row.mainHeading || row.name;
                                                        currentGroup = [];
                                                    } else {
                                                        if (currentHeading === "" && currentGroup.length === 0) {
                                                            const pConfig = panels?.find((p: any) => p.name === row.activePanel);
                                                            currentHeading = pConfig?.mainHeading || row.activePanel || "";
                                                        }
                                                        currentGroup.push(row);
                                                    }
                                                });
                                                if (currentGroup.length > 0 || currentHeading !== "") {
                                                    panelGroupsOnPage.push({ heading: currentHeading, rows: currentGroup });
                                                }

                                                return panelGroupsOnPage.map((pg, pgIdx) => (
                                                    <div key={pgIdx} className="w-full">
                                                        {pg.heading && (
                                                            <div className="w-full bg-[#7caabb] text-white py-1.5 px-4 mb-0">
                                                                <h2 className="text-[16px] font-bold uppercase tracking-widest">{pg.heading}</h2>
                                                            </div>
                                                        )}
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="bg-[#e4eff0] text-slate-800 border-b border-white border-[3px]">
                                                                    <th className="py-2 px-3 text-[14px] font-bold text-left w-[40%]">Parameter</th>
                                                                    <th className="py-2 px-3 text-[14px] font-bold text-left w-[20%]">Result</th>
                                                                    <th className="py-2 px-3 text-[14px] font-bold text-left w-[40%]">Ref. Range</th>
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
                                                                                    <td colSpan={3} className="py-1.5 px-3 bg-[#e4eff0] mt-2 border-t-4 border-white text-slate-800">
                                                                                        <h3 className="text-[14px] font-bold uppercase underline underline-offset-2">{row.name}</h3>
                                                                                    </td>
                                                                                </tr>
                                                                                {isFirstSub && panelMethod && (
                                                                                    <tr>
                                                                                        <td colSpan={3} className="px-3 pt-1 text-[12px] text-slate-600">Method: {panelMethod}</td>
                                                                                    </tr>
                                                                                )}
                                                                                {isFirstSub && panelSpecimen && (
                                                                                    <tr>
                                                                                        <td colSpan={3} className="px-3 pb-2 text-[12px] text-slate-600">Specimen: {panelSpecimen}</td>
                                                                                    </tr>
                                                                                )}
                                                                            </React.Fragment>
                                                                        );
                                                                    }

                                                                    if (row.type !== "TEST") return null;

                                                                    const v = parseFloat(row.value);
                                                                    let min, max;
                                                                    if (row.name?.range?.[0]) {
                                                                        min = row.name.range[0].min;
                                                                        max = row.name.range[0].max;
                                                                    }

                                                                    let isAbnormal = false;
                                                                    if (min !== undefined && v < min) isAbnormal = true;
                                                                    else if (max !== undefined && v > max) isAbnormal = true;

                                                                    return (
                                                                        <tr key={"test-" + rowIdx}>
                                                                            <td className="py-1.5 px-3 text-[13px] text-slate-800 align-top">
                                                                                <div>{row.name?.name || "TEST"}</div>
                                                                            </td>
                                                                            <td className="py-1.5 px-3 text-[13px] text-slate-800 align-top flex gap-1 items-center">
                                                                                <span className={isAbnormal ? "font-bold text-black" : "font-semibold"}>{row.value || " "}</span>
                                                                                {row.name?.unit && String(row.name.unit).trim() !== "-" && String(row.name.unit).trim() !== "—" ? <span className="text-slate-600 text-[12px] font-medium" dangerouslySetInnerHTML={{ __html: row.name.unit }} /> : ""}
                                                                            </td>
                                                                            <td className="py-1.5 px-3 text-[13px] text-slate-600 align-top font-medium">
                                                                                {row.name?.range && row.name.range.length > 0 ? (
                                                                                    row.name.range.map((r: any, idx: number) => {
                                                                                        const hasMin = r.min !== undefined && r.min !== null && r.min !== "";
                                                                                        const hasMax = r.max !== undefined && r.max !== null && r.max !== "";
                                                                                        if (!hasMin && !hasMax) return null;
                                                                                        return (
                                                                                            <div key={idx}>
                                                                                                {r.name && r.name.toLowerCase() !== "normal" ? <span className="pr-1">{r.name}:</span> : ""}
                                                                                                ({hasMin ? r.min : "0"} - {hasMax ? r.max : "N/A"}) <span className="text-[12px]" dangerouslySetInnerHTML={{ __html: row.name?.unit || "" }} />
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
                                                ));
                                            })()}
                                        </div>

                                        {showHistograms && (
                                            <div className="w-[35%] pl-4 border-l border-slate-200">
                                                <div className="bg-[#e4eff0] py-2 px-3 mb-4">
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
                                    {isLastPage && (
                                        <>
                                            {report.note && (
                                                <div className="w-full px-10 pb-4 text-left">
                                                    <div className="border-t border-slate-300 pt-2">
                                                        <p className="text-xs font-bold text-black uppercase tracking-wide">Note:</p>
                                                        <p className="text-[11px] font-medium text-slate-800 mt-1 whitespace-pre-wrap leading-normal font-sans">
                                                            {report.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="px-10 pb-6 w-full flex justify-between items-end mt-4">
                                                <div className="text-center w-48">
                                                    <p className="font-bold text-slate-800 text-[14px]">LAB IN-CHARGE</p>
                                                    <p className="text-[12px] text-slate-600 font-medium uppercase mt-1">{inChargeTechnician?.name || "LABORATORY"}</p>
                                                </div>
                                                <div className="text-center w-48">
                                                    <p className="font-bold text-slate-800 text-[14px]">LAB TECHNICIAN</p>
                                                    {/* <p className="text-[12px] text-slate-600 font-medium mt-1 uppercase">{report.technician || ""}</p> */}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Bottom Banner */}
                                    <div className="bg-[#b3d4d9] w-full px-10 py-4 flex justify-between items-center text-slate-800 footer">
                                        <div className="text-[13px]">
                                            <span className="font-medium">OP Working Hours :</span><br />
                                            <span className="font-bold text-[14px]">3.00 pm to 8 pm</span>
                                        </div>
                                        <div className="text-[13px] text-right">
                                            <span className="font-medium">Lab Working Hours :</span><br />
                                            <span className="font-bold text-[14px]">6.30 am To 8.00 pm <br /> Sunday 6.30 am To 12.00 pm</span>
                                        </div>
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
