import React, { Dispatch, SetStateAction, useState } from "react";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, DoorOpen, Megaphone } from "lucide-react";
import Link from "next/link";

export default function Appointment({
  i,
  typeStyle,
  isConsulted,
  consultedStyles,
  apt
}: {
  i: number;

  isConsulted: boolean;
  consultedStyles: {
    readonly container: "opacity-60 grayscale";
    readonly chip: "bg-gray-200 text-gray-700";
    readonly dot: "bg-gray-400";
    readonly badge: "inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200";
  };
  typeStyle:
    | {
        readonly chip: "bg-blue-100 text-blue-800";
        readonly block: "bg-blue-100 text-blue-800";
        readonly ring: "ring-blue-200";
        readonly dot: "bg-blue-500";
        readonly label: "Consultation";
      }
    | {
        readonly chip: "bg-amber-100 text-amber-800";
        readonly block: "bg-amber-100 text-amber-800";
        readonly ring: "ring-amber-200";
        readonly dot: "bg-amber-500";
        readonly label: "Lab Test";
      }
    | {
        readonly chip: "bg-emerald-100 text-emerald-800";
        readonly block: "bg-emerald-100 text-emerald-800";
        readonly ring: "ring-emerald-200";
        readonly dot: "bg-emerald-500";
        readonly label: "Follow-up";
      };
  apt: {
    time: string;
    name: string;
    type: string;
    status: string;
  };
  setAppointments: Dispatch<SetStateAction<{
    time: string;
    name: string;
    type: string;
    status: string;
}[]>>
}) 

{
    const [ring, setRing] = useState(false)


    const startBaseClasses =
    "rounded-2xl border border-slate-200 bg-white !text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:!text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";
  const startHighlightClasses = ring
    ? " !bg-green-600 !text-white !ring-2 !ring-green-400 shadow-lg animate-pulse"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: i * 0.08 }}
      className={`flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 ${
        typeStyle.ring
      } ${isConsulted ? consultedStyles.container : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isConsulted ? consultedStyles.dot : typeStyle.dot
          }`}
        ></span>
        <div>
          <p className="font-medium">{apt.name}</p>
          <p
            className={`text-xs inline-flex items-center px-2 py-0.5 rounded ${
              isConsulted ? consultedStyles.chip : typeStyle.chip
            }`}
          >
            {apt.type}
          </p>
        </div>
        {!isConsulted && <div className="flex gap-5">
          <Button size="sm" className="rounded-2xl" onClick={()=>!isConsulted && setRing(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            Call In
          </Button>

          <Link href={ring ? "/consulting" : "/"}>
            <Button
              variant="outline"
              size="sm"
               className={startBaseClasses + startHighlightClasses}
        style={ring ? { backgroundColor: "#16A34A", color: "#FFFFFF" } : undefined}
            >
              <DoorOpen className="h-4 w-4 mr-2" /> Start Consult
            </Button>
          </Link>
        </div>}
      </div>
      <div className="flex items-center gap-2">
        {isConsulted && (
          <span className={consultedStyles.badge}>
            <CheckCircle2 className="w-3 h-3" /> Consulted
          </span>
        )}
        <span className="text-sm text-gray-600">{apt.time}</span>
      </div>
    </motion.div>
  );
}
