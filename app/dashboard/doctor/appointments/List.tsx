import { fDateandTime, fTime } from "@/lib/fDateAndTime";
import { MapPin, Phone, Video, Search } from "lucide-react";
import React, { useState } from "react";
import useAppointmentList from "./data/useAppointmentList";
import Drawer from "@/components/ui/drawer";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function List({
  query,
  activeStatuses,
  date,
  activeDate
}: {
  query: string;
  activeStatuses: string[];
  date: Date;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
}) {
  const { data, mutate } = useAppointmentList({ activeStatuses, date, activeDate });

  const [edit, setEdit] = useState<null | {
    _id: string;
    patient: {
      _id: string;
      mrn: string;
      name: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: Date;
      blood: string;
      allergies: string;
      address: string;
      notes: string;
      createdAt: Date;
    };
    doctor: {
      _id: string;
      name: string;
      email: string;
      phoneNumber: string | null;
      address: string | null;
      profilePic: string | null;
    };
    createdBy: string;
    method: "In clinic" | "Video" | "Phone";
    date: Date;
    notes: string | null;
    internalNotes: string | null;
    type: "New" | "Follow up";
    status:
    | "Upcoming"
    | "Consulted"
    | "Observation"
    // | "Completed"
    | "Not show";
    isPaid: boolean;
    createdAt: Date;
    visitCount: number;
  }>(null);

  const filteredData = data?.data.filter((a) => {
    if (!query) return true;

    const q = query.toLowerCase();
    const name = a?.patient?.name?.toLowerCase() || "";
    const mrn = a?.patient?.mrn?.toLowerCase() || "";

    return name.includes(q) || mrn.includes(q);
  }) || [];

  return (
    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 mt-6">
      <Table className="text-sm">
        <TableHeader className="bg-slate-700 hover:bg-slate-700">
          <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
            <TableHead className="py-2.5 text-left pl-4 text-white font-bold text-[11px] uppercase tracking-wider">Time</TableHead>
            <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Patient</TableHead>
            <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Doctor</TableHead>
            <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Method</TableHead>
            <TableHead className="py-2.5 text-left text-white font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
            <TableHead className="py-2.5 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-20 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                    <Search className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No appointments found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row, idx) => (
              <TableRow
                key={row._id}
                className={idx % 2 === 0
                  ? "bg-white hover:bg-white/60"
                  : "bg-slate-100 hover:bg-slate-100/60"
                }
              >
                <TableCell className="py-3 pl-4 font-medium text-slate-900">
                  {fDateandTime(row.date)}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Initials text={row?.patient?.name} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {row?.patient?.name}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({row?.patient?.mrn})
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {row?.patient?.phoneNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Initials text={row?.doctor?.name} />
                    <div className="">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {row?.doctor?.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {row?.doctor?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                    {row?.method === "In clinic" && <MapPin className="h-3.5 w-3.5 text-slate-400" />}
                    {row?.method === "Video" && <Video className="h-3.5 w-3.5 text-slate-400" />}
                    {row?.method === "Phone" && <Phone className="h-3.5 w-3.5 text-slate-400" />}
                    {row?.method}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <Chip label={row?.status} tone={row?.status || "gray"} />
                </TableCell>
                <TableCell className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setEdit(row)}
                    >
                      Edit
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {edit?._id && <Drawer
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        title="Edit Appointment"
      >
        <CreateAppointmentForm
          onClose={() => setEdit(null)}
          appointment={edit}
        />
      </Drawer>}
    </div>
  );
}

const Chip: React.FC<{
  label: string;
  tone?:
  | "green"
  | "gray"
  | "red"
  | "blue"
  | "amber"
  | "Upcoming"
  | "Test"
  | "Observation"
  | "Admit"
  | "Consulted"
  | "Not show";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    Upcoming: "bg-slate-100 text-slate-700 ring-slate-200",
    Test: "bg-sky-100  text-sky-700 ring-sky-200",
    Observation: "bg-amber-100  text-amber-700 ring-amber-200",
    Admit: "bg-rose-100  text-rose-700 ring-rose-200",
    Consulted: "bg-emerald-100  text-emerald-700 ring-emerald-200",
    "Not show": "bg-red-100 text-red-700 ring-red-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${tones[tone] || "bg-gray-100 text-gray-700 ring-gray-200"}`}
    >
      {label}
    </span>
  );
};

function Initials({ text }: { text: string }) {
  const initials = text
    ?.split(" ")
    ?.map((s) => s[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase();
  return (
    <div
      className="h-7 w-7 rounded-full bg-linear-to-br from-zinc-200 to-zinc-100 text-zinc-700 grid place-items-center text-[10px] font-bold"
      aria-hidden
    >
      {initials}
    </div>
  );
}
