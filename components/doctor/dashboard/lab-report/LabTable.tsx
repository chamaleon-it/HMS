import { fAge, fDate, fAgeString } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import React from 'react'
import ViewResultModal from './ViewResultModal';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

function getReportSummary(r: any) {
    const panelMap = new Map<string, { name: string; price: number }>();
    const standaloneTests: any[] = [];
    let totalPrice = 0;

    if (Array.isArray(r.panels)) {
        r.panels.forEach((p: any) => {
            if (typeof p === 'string' && p.trim()) {
                panelMap.set(p.trim(), { name: p.trim(), price: 0 });
            } else if (p && p.name) {
                panelMap.set(p._id || p.name, { name: p.name, price: p.price || 0 });
            }
        });
    }

    if (Array.isArray(r.test)) {
        r.test.forEach((tItem: any) => {
            const testDoc = tItem.name;
            if (!testDoc) return;

            const testPanels = testDoc.panels || [];
            if (testPanels.length > 0) {
                testPanels.forEach((pObj: any) => {
                    const pName = typeof pObj === 'object' && pObj.name ? pObj.name : String(pObj);
                    if (pName && !panelMap.has(pName)) {
                        panelMap.set(pName, { name: pName, price: pObj.price || 0 });
                    }
                });
            } else {
                standaloneTests.push(testDoc);
                totalPrice += testDoc.price || 0;
            }
        });
    }

    panelMap.forEach((p) => {
        totalPrice += p.price || 0;
    });

    return {
        panelsCount: panelMap.size,
        panelNames: Array.from(panelMap.values()).map((p) => p.name),
        standaloneTestsCount: standaloneTests.length,
        standaloneTestNames: standaloneTests.map((t) => t.name),
        totalPrice,
    };
}


interface PropsTypes {
    status: string;
    REPORT: {
        _id: string;
        patient: {
            _id: string;
            name: string;
            phoneNumber: string;
            email: string;
            gender: string;
            dateOfBirth: Date;
            conditions: string[];
            blood: string;
            allergies: string;
            address: string;
            notes: string;
            createdBy: string;
            status: string;
            mrn: string;
            createdAt: Date;
            updatedAt: Date;
        };
        doctor: {
            _id: string;
            name: string;
            specialization: string | null;
        };
        lab: {
            _id: string;
            name: string;
            specialization: string | null;
        };
        date: Date;
        priority: string;
        test: {
            name: {
                code: string;
                name: string;
                type: string;
                unit?: string;
                range: {
                    name: string;
                    min: number | null | undefined;
                    max: number | null | undefined;
                    fromAge: number | null | undefined;
                    toAge: number | null | undefined;
                    gender: "Both" | "Male" | "Female";
                    dateType: "Year" | "Month" | "Day";

                }[],
                note: string
                _id: string;
                panels: {
                    _id: string;
                    name: string;
                    status: string;
                    user: string;
                }[]
            }
            value?: string | number
            _id: string;
        }[];
        sampleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]
    facility: "Lab" | "Imaging" | "All";
}

export default function LabTable({ REPORT, status, facility }: PropsTypes) {
    return (
        <div className="rounded-2xl   bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">


            <table className="w-full whitespace-nowrap  overflow-scroll">
                <thead className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
                    <tr className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium ">
                        <th className="w-10 text-left px-3 py-2">
                            <Checkbox />
                        </th>
                        {headerCell("No.")}
                        {headerCell("Patient")}
                        {headerCell("Panels")}
                        {headerCell("Tests")}
                        {headerCell("Price")}
                        {headerCell("Created At")}
                        {headerCell("Reported")}
                        {headerCell("Status")}
                        {headerCell("Actions")}

                    </tr>
                </thead>
                <tbody>
                    {REPORT.filter(
                        (r) => status === "All" || r.status === status
                            && (facility === "All" || r.test.some((e) => e.name.type === facility))
                    ).map((r, idx) => {
                        const summary = getReportSummary(r);

                        return (
                            <tr
                                key={r._id}
                                className={`group border-b border-gray-100 ${idx % 2 === 0
                                    ? "bg-white hover:bg-white/60"
                                    : "bg-slate-100 hover:bg-slate-100/60"
                                    }`}
                            >
                                <td className="px-3 py-2">
                                    <Checkbox />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">{String(idx + 1).padStart(2, '0')}</td>
                                <td className="px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {r?.patient?.name}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            <span className="font-medium text-gray-600">{r?.patient?.mrn}</span> • {fAgeString(r?.patient?.dateOfBirth)} • {r?.patient?.gender}
                                        </span>
                                    </div>
                                </td>

                                {/* Panels Column */}
                                <td className="px-3 py-2 text-xs">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">
                                            {summary.panelsCount} {summary.panelsCount === 1 ? "Panel" : "Panels"}
                                        </span>
                                        {summary.panelNames.length > 0 ? (
                                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]" title={summary.panelNames.join(", ")}>
                                                {summary.panelNames.join(", ")}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-slate-400">None</span>
                                        )}
                                    </div>
                                </td>

                                {/* Standalone Tests Column (Excludes tests included in panels) */}
                                <td className="px-3 py-2 text-xs">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">
                                            {summary.standaloneTestsCount} {summary.standaloneTestsCount === 1 ? "Test" : "Tests"}
                                        </span>
                                        {summary.standaloneTestNames.length > 0 ? (
                                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]" title={summary.standaloneTestNames.join(", ")}>
                                                {summary.standaloneTestNames.join(", ")}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-slate-400">None</span>
                                        )}
                                    </div>
                                </td>

                                {/* Price Column */}
                                <td className="px-3 py-2 text-xs font-mono font-bold text-emerald-700">
                                    {formatINR(summary.totalPrice)}
                                </td>

                                <td className="px-3 py-2 text-sm text-gray-500">
                                    {fDate(r.createdAt)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                    {fDate(r.date)}
                                </td>


                                <td className="px-3 py-2">
                                    <Chip label={r.status} tone={statusTone(r.status)} />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <div className="flex items-center justify-end gap-2  transition-opacity duration-200">
                                        <ViewResultModal r={r} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}


function headerCell(label: string) {
    return (
        <th className="text-left px-3 py-2">
            {label}
        </th>
    );
}


const statusTone = (s: string): "green" | "gray" | "red" | "blue" | "amber" => {
    switch (s) {
        case "Completed":
            return "green";
        case "Upcoming":
        case "Draft":
        case "Pending":
            return "blue";
        case "Sample Collected":
        case "Waiting For Result":
        case "In Progress":
            return "amber";
        case "Flagged":
        case "Deleted":
            return "red";
        default:
            return "gray";
    }
};



// ----- Small UI helpers -----
const Chip: React.FC<{
    label: string;
    tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
    const tones: Record<string, string> = {
        green: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
        gray: "bg-slate-50 text-slate-600 ring-slate-200/50",
        red: "bg-rose-50 text-rose-700 ring-rose-200/50",
        blue: "bg-sky-50 text-sky-700 ring-sky-200/50",
        amber: "bg-amber-50 text-amber-700 ring-amber-200/50",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
        >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${tone === 'gray' ? 'bg-slate-400' : tone === 'green' ? 'bg-(--color-synapse-dark)' : tone === 'amber' ? 'bg-amber-500' : tone === 'blue' ? 'bg-sky-500' : 'bg-rose-500'}`}></span>
            {label}
        </span>
    );
};