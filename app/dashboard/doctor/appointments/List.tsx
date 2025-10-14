import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { fDateandTime } from "@/lib/fDateAndTime";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
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
  const router = useRouter();
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (activeStatuses) params.append("status", JSON.stringify(activeStatuses));

  const { data, mutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient:{
        _id:string,
        name:string,
        phoneNumber:string,
        gender:string,
        age:number,
        blood:string,
        allergies:string,
        address:string,
        notes:string,
        createdAt:Date
      },
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
      status: "Upcoming" | "Consulted" | "Observation" | "Completed" | "Not show";
      isPaid: boolean;
      createdAt: Date;
    }[];
  }>(`/appointments/list?${params.toString()}`);

  const {mutate:statisticsMutate} = useSWR<{
    message: string;
    data: {
      today: number;
      upcoming: number;
      consulted: number;
      observation: number;
      completed: number;
      notShow: number;
    };
  }>("/appointments/statistics");

  const updateStatus = async (id: string, status: string) => {
    try {
      await toast.promise(
        api.patch(`/appointments/update_status/${id}`, { status }),
        {
          loading: "Please wait we are updating status",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        }
      );
      mutate();
      statisticsMutate()
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden mt-4">
      <div className="grid grid-cols-12 bg-zinc-50 text-xs font-medium text-zinc-600 px-4 py-2">
        <div className="col-span-2">Time</div>
        <div className="col-span-2">Patient</div>
        <div className="col-span-2">Doctor</div>
        <div className="col-span-1">Method</div>
        <div className="col-span-1 text-right">Status</div>
        <div className="col-span-4 text-right">Action</div>
      </div>
      <ul className="divide-y">
        {data?.data.map((row) => (
          <li
            key={row._id}
            className={cx("px-4 py-3 grid grid-cols-12 items-center")}
          >
            <div className="col-span-2 font-medium">
              {fDateandTime(row.date)}
            </div>

            <div className="col-span-2 flex items-center gap-3 min-w-0">
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
            <div className="col-span-2 flex items-center gap-3 min-w-0">
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
                <Chip label={row.status} tone={
                  row.status === "Not show" && "red" || 
                  row.status === "Upcoming" && "gray" ||
                  row.status === "Consulted" && "blue" ||
                  row.status === "Observation" && "amber" ||
                  row.status === "Completed" && "green" ||
                  "gray"
                }/>
              </span>
            </div>

            <div className="col-span-4 flex items-center justify-end gap-2">
              <Button
                size="icon"
                variant="default"
                className="w-fit px-2 bg-sky-100 hover:bg-sky-100/70 text-sky-800"
                onClick={() => {
                  updateStatus(row._id, "Consulted");
                  router.push(`/dashboard/doctor/consulting/${row._id}`);
                }}
              >
                Consulted
              </Button>
              <Button
                size="icon"
                variant="default"
                className="w-fit px-2 bg-green-100 hover:bg-green-100/70 text-green-800"
                onClick={() => {
                  updateStatus(row._id, "Completed");
                }}
              >
                Completed
              </Button>
              <Button
                size="icon"
                variant="default"
                className="w-fit px-2 bg-amber-100 hover:bg-amber-100/70 text-amber-800"
                onClick={() => {
                  updateStatus(row._id, "Observation");
                }}
              >
                Observation
              </Button>

              <Button
                size="icon"
                variant="default"
                className="w-fit px-2 bg-red-100 hover:bg-red-100/70 text-red-800"
                onClick={() => {
                  updateStatus(row._id, "Not show");
                }}
              >
                Not Show
              </Button>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Chip: React.FC<{ label: string; tone?: "green"|"gray"|"red"|"blue"|"amber" }>=({label,tone="gray"})=>{
  const tones: Record<string,string>={
    green:"bg-emerald-50 text-emerald-700 ring-emerald-200",
    gray:"bg-slate-100 text-slate-700 ring-slate-200",
    red:"bg-rose-50 text-rose-700 ring-rose-200",
    blue:"bg-sky-50 text-sky-700 ring-sky-200",
    amber:"bg-amber-50 text-amber-700 ring-amber-200",
  };
  return(
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 whitespace-nowrap ${tones[tone]}`}>{label}</span>
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
