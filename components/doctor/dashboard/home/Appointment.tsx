import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  DoorOpen,
  Megaphone,
  MoreVertical,
  Trash2,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentData, AppointmentType } from "./interface";
import { fTime } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { KeyedMutator } from "swr";

export default function Appointment({
  a,
  idx,
  setMenuOpenId,
  menuOpenId,
  mutate,
}: {
  a: AppointmentType;
  idx: number;
  setMenuOpenId: (value: React.SetStateAction<string | null>) => void;
  menuOpenId: string | null;
  mutate: KeyedMutator<AppointmentData>;
}) {
  const router = useRouter();
  const [ring, setRing] = useState(false);

  const startBaseClasses =
    "rounded-2xl border border-slate-200 bg-white !text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:!text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";
  const startHighlightClasses = ring
    ? " !bg-green-600 !text-white !ring-2 !ring-green-400 shadow-lg animate-pulse"
    : "";

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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      id={`card-${a._id}`}
      key={a._id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.4, idx * 0.02) }}
      className={cn(
        "relative pointer-events-auto rounded-2xl border p-4 pr-5 shadow-sm bg-white",
        a.status === "consulted" && "opacity-70"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600",
            a.status === "consulted" && "grayscale"
          )}
        >
          <User2 className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div
              className={cn(
                "truncate font-medium text-gray-900",
                a.status === "consulted" && "line-through"
              )}
            >
              {a.patient.name} <span>{a.patient.mrn}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="shrink-0 text-sm text-gray-500">
                {fTime(a.date)}
              </div>
              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    setMenuOpenId((p) => (p === a._id ? null : a._id))
                  }
                  className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 p-1.5 cursor-pointer"
                  title="More"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
                {menuOpenId === a._id && (
                  <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border bg-white shadow-lg p-1">
                    <button
                      onClick={() => {
                        setRing(true);
                        setMenuOpenId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      Call again
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-700 cursor-pointer"
                      onClick={async () => {
                        await updateStatus(a._id, "Not show");
                        setMenuOpenId(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              )}
            >
              {a.status}
            </span>

            {a.status === "Consulted" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <CheckCircle2 className="h-4 w-4" /> Consulted
              </span>
            )}
          </div>
        </div>
      </div>

      {a.status !== "Consulted" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              setRing(true);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm cursor-pointer
              ${
                ring
                  ? "bg-white text-black hover:bg-white hover:text-black"
                  : "bg-[black] text-white hover:bg-[black] hover:text-white"
              }
              `}
          >
            <Megaphone className="h-4 w-4 mr-2" /> Call In
          </Button>
          <button
            className={
              startBaseClasses +
              startHighlightClasses +
              " inline-flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer"
            }
            style={
              ring
                ? { backgroundColor: "#16A34A", color: "#FFFFFF" }
                : undefined
            }
            onClick={async () => {
              if (ring) {
                router.push(`/dashboard/doctor/consulting/single?id=${a._id}`);
              }
            }}
          >
            <DoorOpen className="h-4 w-4 mr-2" /> <p> Start Consult</p>
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-red-50 text-red-700 border-red-200 cursor-pointer"
            onClick={() => updateStatus(a._id, "Not show")}
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
      )}
    </motion.div>
  );
}
