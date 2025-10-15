import { fDateandTime } from "@/lib/fDateAndTime";
import React from "react";
import useSWR from "swr";

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

export default function List({
  query,
  activeStatuses,
}: {
  query: string;
  activeStatuses: string[];
}) {
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));

  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        gender: string;
        age: number;
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
        | "Completed"
        | "Not show";
      isPaid: boolean;
      createdAt: Date;
    }[];
  }>(`/appointments/list?${params.toString()}`);

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden mt-4">
      <div className="grid grid-cols-11 bg-zinc-50 text-xs font-medium text-zinc-600 px-4 py-2">
        <div className="col-span-2">Time</div>
        <div className="col-span-3">Patient</div>
        <div className="col-span-3">Doctor</div>
        <div className="col-span-1">Method</div>
        <div className="col-span-1 text-right">Status</div>
      </div>
      <ul className="divide-y">
        {data?.data.map((row) => (
          <li
            key={row._id}
            className={cx("px-4 py-3 grid grid-cols-11 items-center")}
          >
            <div className="col-span-2 font-medium">
              {fDateandTime(row.date)}
            </div>

            <div className="col-span-3 flex items-center gap-3 min-w-0">
              <Initials text={row.patient.name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {row.patient.name}
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
                {row.method}
              </span>
            </div>
            <div className="col-span-1 flex items-center justify-end gap-2">
              <span className="inline-flex items-center gap-2 text-sm">
                <Chip
                  label={row.status}
                  tone={
                    (row.status === "Not show" && "red") ||
                    (row.status === "Upcoming" && "gray") ||
                    (row.status === "Consulted" && "blue") ||
                    (row.status === "Observation" && "amber") ||
                    (row.status === "Completed" && "green") ||
                    "gray"
                  }
                />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Chip: React.FC<{
  label: string;
  tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 whitespace-nowrap ${tones[tone]}`}
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
