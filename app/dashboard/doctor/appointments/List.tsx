import { Button } from '@/components/ui/button';
import { Badge, MoreVertical } from 'lucide-react';
import React from 'react'


const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(" ");

export default function List({data,dense,methodIcon,statusTone}:{dense:boolean,data:{
    id: string;
    time: string;
    date: Date;
    patient: {
        name: string;
        phone: string;
        email: string;
    };
    doctor: {
        id: string;
        name: string;
        dept: string;
        avatar: string;
    };
    method: "In-clinic" | "Video" | "Phone";
    status: "Booked" | "Checked-in" | "Completed" | "No-show" | "Cancelled";
    notes: string;
}[],
methodIcon: Record<"In-clinic" | "Video" | "Phone", React.ReactNode>,
statusTone: Record<"Booked" | "Checked-in" | "Completed" | "No-show" | "Cancelled", string>
}) {
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
            {data.map((row) => (
              <li key={row.id} className={cx("px-4 py-3 grid grid-cols-12 items-center", dense && "py-2")}>
                <div className="col-span-2 font-medium">{row.time}</div>
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <Initials text={row.patient.name} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.patient.name}</div>
                    <div className="text-xs text-zinc-500 truncate">{row.patient.phone}</div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <Initials text={row.doctor.name} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.doctor.name}</div>
                    <div className="text-xs text-zinc-500 truncate">{row.doctor.dept}</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm">
                    {methodIcon[row.method]}
                    {row.method}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Badge className={cx("border", statusTone[row.status])}>{row.status}</Badge>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
  )
}

function Initials({ text }: { text: string }) {
  const initials = text.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-700 grid place-items-center text-xs font-semibold" aria-hidden>
      {initials}
    </div>
  );
}

