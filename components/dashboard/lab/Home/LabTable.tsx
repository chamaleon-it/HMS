import { useAuth } from '@/auth/context/auth-context';
import { fAge, fDateandTime } from '@/lib/fDateAndTime';
import React from 'react'
import ViewResultModal from './ViewResultModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';


interface PropsTypes {
    status: "Pending" | "In Progress" | "Completed"
    mutate: () => void
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
            value?: string | number;
            panel: string;
        }[];
        sampleType: string;
        panels: string[]
        sampleCollectedAt: Date | null
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]
}

export default function LabTable({ REPORT, status, mutate }: PropsTypes) {
    const { user } = useAuth()
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
                        {headerCell("Created At")}
                        {status !== "Pending" && headerCell("Sample Collected")}
                        {headerCell("Doctor")}
                        {headerCell("Status")}
                        {status === "In Progress" && headerCell("Estimated Time")}
                        {headerCell("Actions", "right")}

                    </tr>
                </thead>
                <tbody>
                    {REPORT.filter(
                        (r) => r.status === status
                    ).map((r, idx) => {
                        return (
                            <tr
                                key={r._id}
                                className={`group border-b border-gray-100 transition-colors duration-200 last:border-0 ${idx % 2 === 0
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
                                            {r.patient.name}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            <span className="font-medium text-gray-600">{r.patient.mrn}</span> • {fAge(r.patient.dateOfBirth)} yrs • {r.patient.gender}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                    <div className="flex flex-col gap-2">
                                        {
                                            r?.panels?.map((p) => (
                                                <div key={p} className="flex items-center gap-1 h-5 font-medium text-sm">
                                                    {p}
                                                </div>
                                            ))
                                        }
                                        {r?.name?.map((e) => !r?.panels?.includes(e.panel) && (
                                            <div key={e._id} className="flex items-center gap-1 h-5 font-medium text-sm">
                                                {e.name}
                                            </div>
                                        ))}
                                    </div>
                                </td>


                                <td className="px-3 py-2 text-sm text-gray-500">
                                    {fDateandTime(r.createdAt)}
                                </td>

                                {status !== "Pending" && <td className="px-3 py-2 text-sm text-gray-500">
                                    {r.sampleCollectedAt ? fDateandTime(r.sampleCollectedAt) : "-"}
                                </td>}

                                <td className="px-3 py-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        {r.doctor._id !== user?._id ? <span className="truncate max-w-[100px]" title={r.doctor.name}>Dr. {r.doctor.name}</span> : <span>Direct</span>}
                                    </div>
                                </td>




                                <td className="px-3 py-2">
                                    <Chip label={r.status} tone={statusTone(r.status)} />
                                </td>
                                {status === "In Progress" && <td></td>}
                                <td className="px-3 py-2 text-right">
                                    <div className="flex items-center justify-end gap-2  transition-opacity duration-200">
                                        {r.status === "Pending" && <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-white text-gray-600 hover:bg-gray-100"
                                            onClick={async () => {
                                                try {
                                                    await toast.promise(api.post(`lab/report/sample_collected/${r._id}`), {
                                                        loading: "Processing...",
                                                        success: "Sample Collected",
                                                        error: "Failed to collect sample"
                                                    })
                                                    mutate()
                                                } catch (error) {
                                                    toast.error(`Failed to collect sample : ${error}`)
                                                }
                                            }}
                                        >

                                            Sample Collected
                                        </Button>}

                                        <ViewResultModal r={r} />
                                        <Button variant={"outline"} size="sm" className="bg-white text-gray-600 hover:bg-gray-100"
                                            onClick={async () => {
                                                try {
                                                    await toast.promise(api.delete(`lab/report/${r._id}`), {
                                                        loading: "Processing...",
                                                        success: "Deleted",
                                                        error: "Failed to delete"
                                                    })
                                                    mutate()
                                                } catch (error) {
                                                    toast.error(`Failed to delete : ${error}`)
                                                }
                                            }}

                                        >Delete</Button>
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


function headerCell(label: string, align: "left" | "center" | "right" = "left") {
    return (
        <th className={`text-${align} px-3 py-2`}>
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