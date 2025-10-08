import { Button } from "@/components/ui/button";
import { fDateandTime } from "@/lib/fDateAndTime";
import {MoreVertical } from "lucide-react";
import React from "react";
import useSWR from "swr";

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

export default function List({query,activeStatuses}:{query:string,activeStatuses:string[]}) {


  const params = new URLSearchParams();

if (query) params.append("query", query);
if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));
  
  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patientName: string;
      phoneNumber: string;
      email: string;
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
      status: "Upcoming" | "Consulted" | "Observation" | "Completed";
      isPaid: boolean;
      createdAt: Date;
    }[];
  }>(`/appointments/list?${params.toString()}`);
  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden mt-4">
      <div className="grid grid-cols-12 bg-zinc-50 text-xs font-medium text-zinc-600 px-4 py-2">
        <div className="col-span-2">Time</div>
        <div className="col-span-3">Patient</div>
        <div className="col-span-3">Doctor</div>
        <div className="col-span-2">Method</div>
        <div className="col-span-2 text-right">Status</div>
      </div>
      <ul className="divide-y">
        {data?.data.map((row) => (
          <li
            key={row._id}
            className={cx("px-4 py-3 grid grid-cols-12 items-center")}
          >
            <div className="col-span-2 font-medium">{fDateandTime(row.date)}</div>
            <div className="col-span-3 flex items-center gap-3 min-w-0">
              <Initials text={row.patientName} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {row.patientName}
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  {row.phoneNumber}
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
            <div className="col-span-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-sm">
                {row.method}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <span className="inline-flex items-center gap-2 text-sm">
                {row.status}
              </span>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
