"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import List from "./List";
import { CreateAppointmentForm } from "./CreateAppointmentForm";
import Filter, { STATUSES } from "./Filter";
import Drawer from "@/components/ui/drawer";
import useAppointmentList from "./data/useAppointmentList";
import PharmacyHeader from "../components/PharmacyHeader";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

const PrimaryButton = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      "flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>(["Upcoming"]);
  const [openCreate, setOpenCreate] = useState<"walk-in" | boolean | any>(false);
  const [date, setDate] = useState(new Date());
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");

  const { mutate } = useAppointmentList({ query, activeStatuses, date, activeDate });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle auto-open for new appointment from customer list
  React.useEffect(() => {
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const mrn = searchParams.get("mrn");

    if (window.location.hash === "#newAppointment" && id && name) {
      setOpenCreate({
        patient: { _id: id, name, mrn: mrn || "" },
        type: "New",
        status: "Upcoming",
        walkIn: true,
      });
    }
  }, [searchParams]);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // New Appointment: N
      if (e.key.toLowerCase() === "n" && !e.shiftKey) {
        e.preventDefault();
        setOpenCreate(true);
      }
      // Walk-in: Shift + W
      if (e.key.toLowerCase() === "w" && e.shiftKey) {
        e.preventDefault();
        setOpenCreate("walk-in");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const currentStatus = activeStatuses[0] || "Upcoming";

  return (
    <AppShell>
      <div className="p-0 sm:p-5 min-h-[calc(100vh-67px)] overflow-hidden flex flex-col">
        <div className="shrink-0 mb-4 px-4 sm:px-0 print:hidden">
          <PharmacyHeader
            title="Appointments"
            subtitle="Manage patient appointments and schedules"
          >
            <div className="flex gap-3 items-center">
              <PrimaryButton
                onClick={() => router.push("/dashboard/pharmacy/billing#new")}
                className="bg-linear-to-br from-indigo-600 to-pink-500 shadow-indigo-200"
                title="Direct"
              >
                Direct
              </PrimaryButton>

              <PrimaryButton
                onClick={() => setOpenCreate(true)}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                title="New Appointment (N)"
              >
                <Plus className="h-4 w-4 mr-2" /> Schedule
              </PrimaryButton>

              <PrimaryButton
                onClick={() => setOpenCreate("walk-in")}
                className="bg-linear-to-br from-indigo-600 to-pink-500 shadow-indigo-200"
                title="Walk-in (Shift + W)"
              >
                Walk-in
              </PrimaryButton>
            </div>
          </PharmacyHeader>
        </div>

        {/* Filters & Status Row */}
        <div className="shrink-0 mb-3 px-4 sm:px-0 print:hidden space-y-3">
          <Filter
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            query={query}
            setQuery={setQuery}
            date={date}
            setDate={setDate}
          />

          {/* Status Filter Toggle */}
          <div className="flex items-center justify-between">
            <div className="relative inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full w-fit shadow-sm print:hidden">
              {STATUSES.map((s) => {
                const active = currentStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setActiveStatuses([s])}
                    className={
                      "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap " +
                      (active ? "text-white" : "text-gray-500 hover:text-gray-800")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="status-filter-indicator"
                        className="absolute inset-0 rounded-full shadow-md bg-linear-to-r from-indigo-600 to-fuchsia-500"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-auto px-4 sm:px-0">
          <List
            query={query}
            activeStatuses={activeStatuses}
            date={date}
            activeDate={activeDate}
          />
        </div>

        <Drawer
          open={!!openCreate}
          onClose={() => setOpenCreate(false)}
          title={openCreate?._id ? "Edit Appointment" : "Create Appointment"}
        >
          <CreateAppointmentForm
            onClose={() => setOpenCreate(false)}
            mutate={mutate}
            walkIn={openCreate === "walk-in" || openCreate?.walkIn}
            appointment={typeof openCreate === "object" ? openCreate : undefined}
          />
        </Drawer>
      </div>
    </AppShell>
  );
}
