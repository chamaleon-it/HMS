import { fAge, fDate } from '@/lib/fDateAndTime';
import React from 'react'
import ViewResultModal from './ViewResultModal';
import { Checkbox } from '@/components/ui/checkbox';


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
        name: {
            code: string;
            name: string;
            unit: string;
            min?: number | undefined;
            max?: number | undefined;
            type: string;
            _id: string;
            value?: string | number
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
                <thead className="bg-slate-700 hover:bg-slate-700">
                    <tr className="bg-slate-700 hover:bg-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium ">
                        <th className="w-10 text-left px-3 py-2">
                            <Checkbox />
                        </th>
                        {headerCell("No.")}
                        {headerCell("Patient")}
                        {headerCell("Test")}
                        {headerCell("Value")}
                        {headerCell("Reference")}
                        {headerCell("Created At")}
                        {headerCell("Reported")}
                        {headerCell("Status")}
                        {headerCell("Actions")}

                    </tr>
                </thead>
                <tbody>
                    {REPORT.filter(
                        (r) => status === "All" || r.status === status
                            && (facility === "All" || r.name.some((e) => e.type === facility))
                    ).map((r, idx) => {
                        return (
                            <tr
                                key={r._id}
                                className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200 last:border-0"
                            >
                                <td className="px-3 py-2">
                                    <Checkbox />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                                <td className="px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {r.patient.name}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            <span className="font-medium text-gray-600">{r.patient.mrn}</span> • {fAge(r.patient.dateOfBirth)} yrs • {r.patient.gender}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                    <div className="flex flex-col gap-2">
                                        {r.name.map((e) => (facility === "All" || e.type === facility) && (
                                            <div key={e._id} className="flex items-center gap-1 h-5 font-medium text-sm">
                                                {e.name}
                                            </div>
                                        ))}
                                    </div>
                                </td>

                                <td className="px-3 py-2 text-xs">
                                    <div className="flex flex-col gap-2">
                                        {r.name.map(
                                            (e) => (facility === "All" || e.type === facility) && (
                                                <span
                                                    key={e._id}
                                                    className="text-gray-600 font-mono h-5"
                                                >
                                                    {e.value ? <>
                                                        {e.type === "Imaging" ? <a
                                                            href={e?.value?.toString()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-2 py-0.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                                        >
                                                            View Result
                                                        </a> : `${e.value} ${e.unit}`}
                                                    </> : "-"}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </td>

                                <td className="px-3 py-2 text-xs">
                                    <div className="flex flex-col gap-2">
                                        {r.name.map(
                                            (e) => (facility === "All" || e.type === facility) && (
                                                <span
                                                    key={e._id}
                                                    className="text-gray-600 font-mono h-5"
                                                >{`${e?.min ?? ""} - ${e?.max ?? ""} ${e?.min ? e.unit : ""}`}</span>
                                            )
                                        )}
                                    </div>
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


const statusTone = (s: string): "green" | "gray" | "red" | "blue" | "amber" =>
    s === "Completed"
        ? "green"
        : s === "Pending"
            ? "gray"
            : s === "In Progress"
                ? "amber"
                : "red";



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
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${tone === 'gray' ? 'bg-slate-400' : tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'blue' ? 'bg-sky-500' : 'bg-rose-500'}`}></span>
            {label}
        </span>
    );
};