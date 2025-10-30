import { fTime } from "@/lib/fDateAndTime";
import { MapPin, Phone, Video } from "lucide-react";
import React from "react";
import useAppointmentList from "./data/useAppointmentList";

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

export default function List({
  query,
  activeStatuses,
  date,
}: {
  query: string;
  activeStatuses: string[];
  date: Date;
}) {
  const { data } = useAppointmentList({ activeStatuses, date });

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden mt-4">
      <div className="grid grid-cols-11 bg-zinc-50 text-xs font-medium text-zinc-600 px-4 py-2">
        <div className="col-span-2">Time</div>
        <div className="col-span-3">Patient</div>
        <div className="col-span-3">Doctor</div>
        <div className="col-span-1">Method</div>
        <div className="col-span-1">Status</div>
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
          .map((row) => (
            <li
              key={row._id}
              className={cx("px-4 py-3 grid grid-cols-11 items-center")}
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
            </li>
          ))}
      </ul>
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
    // green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    // gray: "bg-slate-100 text-slate-700 ring-slate-200",
    // red: "bg-rose-50 text-rose-700 ring-rose-200",
    // blue: "bg-sky-50 text-sky-700 ring-sky-200",
    // amber: "bg-amber-50 text-amber-700 ring-amber-200",

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
