import { fTime } from "@/lib/fDateAndTime";
import { MapPin, Phone, Video } from "lucide-react";
import React, { useState } from "react";
import useAppointmentList from "./data/useAppointmentList";
import Drawer from "@/components/ui/drawer";
import { CreateAppointmentForm } from "./CreateAppointmentForm";

export default function List({
  query,
  activeStatuses,
  date,
}: {
  query: string;
  activeStatuses: string[];
  date: Date;
}) {
  const { data, mutate } = useAppointmentList({ activeStatuses, date });

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

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden mt-4">
      <div className="grid grid-cols-11 bg-zinc-50 text-xs font-medium text-zinc-600 px-4 py-2">
        <div className="col-span-2">Time</div>
        <div className="col-span-3">Patient</div>
        <div className="col-span-3">Doctor</div>
        <div className="col-span-1">Method</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Actions</div>
      </div>
      <ul className="divide-y">
        {data?.data
          .filter((a) => {
            if (!query) return true;

            const q = query.toLowerCase();
            const name = a?.patient?.name?.toLowerCase() || "";
            const mrn = a?.patient?.mrn?.toLowerCase() || "";

            return name.includes(q) || mrn.includes(q);
          })
          .map((row, idx) => (
            <li
              key={row._id}
              className={`px-4 py-3 grid grid-cols-11 items-center ${idx % 2 === 0
                ? "bg-white hover:bg-white/60"
                : "bg-slate-100 hover:bg-slate-100/60"
                }`}
            >
              <div className="col-span-2 font-medium">{fTime(row.date)}</div>

              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <Initials text={row.patient.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {row.patient.name}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      ({row.patient.mrn})
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {row.patient.phoneNumber}
                  </div>
                </div>
              </div>
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <Initials text={row.doctor.name} />
                <div className="">
                  <div className="truncate text-sm font-medium">
                    {row.doctor.name}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {row.doctor.email}
                  </div>
                </div>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm">
                  {row.method === "In clinic" && <MapPin className="h-4 w-4" />}
                  {row.method === "Video" && <Video className="h-4 w-4" />}
                  {row.method === "Phone" && <Phone className="h-4 w-4" />}
                  {row.method}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-start gap-2">
                <Chip label={row.status} tone={row.status || "gray"} />
              </div>
              <div className="col-span-1 flex items-center justify-start gap-2">
                <button
                  className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setEdit(row)}
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
      </ul>

      {edit?._id && <Drawer
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        title="Edit Appointment"
      >
        <CreateAppointmentForm
          onClose={() => setEdit(null)}
          mutate={mutate}
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
    Upcoming: "bg-slate-100 text-slate-700 ring-slate-700",
    Test: "bg-sky-100  text-sky-700 ring-sky-700",
    Observation: "bg-amber-100  text-amber-700 ring-amber-700",
    Admit: "bg-rose-100  text-rose-700 ring-rose-700",
    Consulted: "bg-emerald-100  text-emerald-700 ring-emerald-700",
    "Not show": "bg-red-100 text-red-700 ring-red-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
};

function Initials({ text }: { text: string }) {
  const initials = text
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-700 grid place-items-center text-xs font-semibold"
      aria-hidden
    >
      {initials}
    </div>
  );
}
