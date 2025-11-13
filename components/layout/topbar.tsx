"use client";

import React, { useState } from "react";
import { Bell, Plus } from "lucide-react";
import DoctorProfile from "./Profile";
import { CreateAppointmentForm } from "@/app/dashboard/doctor/appointments/CreateAppointmentForm";
import Drawer from "../ui/drawer";
import useAppointmentList from "@/app/dashboard/doctor/appointments/data/useAppointmentList";
import { useAuth } from "@/auth/context/auth-context";
import SearchBar from "./SearchBar";

export default function Header() {
  const [openCreate, setOpenCreate] = useState(false);

  const { mutate } = useAppointmentList({});

  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md w-full">
        {/* Background glow (subtle) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28">
          <div className="mx-auto h-full w-full max-w-screen-2xl opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_0%,#000_0%,transparent_70%)]">
            <div className="h-full w-full bg-[radial-gradient(1000px_200px_at_15%_-20%,#818cf8_12%,transparent_60%),radial-gradient(1000px_200px_at_85%_-20%,#e879f9_12%,transparent_60%)]" />
          </div>
        </div>

        {/* Top bar */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200/70 px-4 sm:px-8 bg-white/85">
          {/* Brand */}
          <div className="flex items-center gap-3 pr-2" data-testid="brand">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-md">
              D
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-base font-semibold text-slate-800">
                DocHub
              </div>
              <div className="text-xs text-slate-500">Clinic OS</div>
            </div>
          </div>

          {/* Search */}
          <SearchBar />

          {/* Actions */}
          <div
            className="ml-4 flex items-center gap-3 sm:gap-4"
            data-testid="actions"
          >
            {user?.role === "Doctor" && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4" /> New Appointment
              </button>
            )}
            <button
              className="relative rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>

            <DoctorProfile />
          </div>
        </div>

        {/* Bottom divider (slimmer) */}
        <div
          className="h-[3px] bg-gradient-to-r from-indigo-600/15 via-fuchsia-600/15 to-indigo-600/15"
          data-testid="header-divider"
        />
      </header>
      {user?.role === "Doctor" && (
        <div className="w-full overflow-hidden">
          <Drawer
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            title="Create Appointment"
          >
            <CreateAppointmentForm
              onClose={() => setOpenCreate(false)}
              mutate={mutate}
            />
          </Drawer>
        </div>
      )}
    </>
  );
}
