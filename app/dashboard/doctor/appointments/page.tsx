"use client";

import React, { useState } from "react";

import { CalendarDays, Plus, LayoutList, CalendarSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorHeader from "../components/DoctorHeader";
import AppShell from "@/components/layout/app-shell";
import List from "./List";
import { AppointmentDialog } from "@/components/shared/appointment/AppointmentDialog";
import Statistics from "./Statistics";
import Filter from "./Filter";
import useAppointmentList from "./data/useAppointmentList";

export default function AppointmentPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [activeDate, setActiveDate] = useState<"Today" | "7 days" | "30 days" | "Custom">("Today");

  const { mutate } = useAppointmentList({ query, activeStatuses, date, activeDate });



  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-slate-50 p-4 sm:p-5 space-y-3">
        <DoctorHeader
          title="Appointments"
          subtitle="Manage patient appointments and schedules"
        >
          {/* <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </PrimaryButton>
          </div> */}
        </DoctorHeader>

        <Statistics />
        {/* Filters Row */}
        <Filter
          activeStatuses={activeStatuses}
          query={query}
          setActiveStatuses={setActiveStatuses}
          setQuery={setQuery}
          date={date}
          setDate={setDate}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
        />

        {/* List View */}
        <div className="mt-2">
          <List query={query} activeStatuses={activeStatuses} date={date} activeDate={activeDate} />
        </div>

        <AppointmentDialog
          open={openCreate}
          onOpenChange={(v) => !v && setOpenCreate(false)}
        />
      </div>
    </AppShell>
  );
}

const theme = {
  from: "var(--color-synapse-light)",
  to: "var(--color-synapse-purple)",
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] bg-(--color-synapse-light) ${className} cursor-pointer flex items-center justify-center`}
  >
    {children}
  </button>
);
