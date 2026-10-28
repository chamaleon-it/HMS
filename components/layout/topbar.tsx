"use client";

import React, { useState } from "react";
import { Plus, Menu } from "lucide-react";
import DoctorProfile from "./Profile";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentDialog } from "@/components/shared/appointment/AppointmentDialog";
import useAppointmentList from "@/app/dashboard/doctor/appointments/data/useAppointmentList";
import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openPatient, setOpenPatient] = useState(false);


  const { user } = useAuth();
  const pathname = usePathname();





  const items =
    (user?.role === "Doctor" && [
      { key: "dashboard", label: "Dashboard", link: "/dashboard/doctor/" },
      { key: "appointments", label: "Appointments", link: "/dashboard/doctor/appointments/" },
      { key: "patients", label: "Patients", link: "/dashboard/doctor/patients/" },
      { key: "billing", label: "Billing", link: "/dashboard/doctor/billing/" },
    ]) ||
    (user?.role === "Pharmacy" && [
      { key: "appointments", label: "Appointments", link: "/dashboard/pharmacy/appointments/" },
      { key: "dashboard", label: "Dashboard", link: "/dashboard/pharmacy/" },
      { key: "inventory", label: "Inventory", link: "/dashboard/pharmacy/inventory/" },
      { key: "purchase-entry", label: "Purchase Entry", link: "/dashboard/pharmacy/purchase-entry/" },
      { key: "suppliers", label: "Suppliers", link: "/dashboard/pharmacy/suppliers/" },
      { key: "customers", label: "Customers", link: "/dashboard/pharmacy/customers/" },
      { key: "return", label: "Return", link: "/dashboard/pharmacy/return/" },
      { key: "billing", label: "Billing", link: "/dashboard/pharmacy/billing/" },
    ]) ||
    (user?.role === "Lab" && [
      // { key: "appointments", label: "Appointments", link: "/dashboard/lab/appointments/" },
      { key: "dashboard", label: "Dashboard", link: "/dashboard/lab/" },
      { key: "inventory", label: "Catalogue", link: "/dashboard/lab/inventory/" },
      { key: "patients", label: "Customers", link: "/dashboard/lab/patients/" },
      { key: "billing", label: "Billing", link: "/dashboard/lab/billing/" },
      { key: "register", label: "Lab Register", link: "/dashboard/lab/register/" },
    ]) || [];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md w-full print:hidden">
        {/* Background glow (subtle) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28">
          <div className="mx-auto h-full w-full max-w-screen-2xl opacity-40 mask-[radial-gradient(60%_60%_at_50%_0%,#000_0%,transparent_70%)]">
            <div className="h-full w-full bg-[radial-gradient(1000px_200px_at_15%_-20%,var(--color-cosmo-copper)_12%,transparent_60%),radial-gradient(1000px_200px_at_85%_-20%,var(--color-cosmo-copper)_12%,transparent_60%)]" />
          </div>
        </div>

        {/* Top bar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 sm:px-8 bg-white/85">
          {/* Brand & Toggle */}
          <div className="flex items-center gap-3 pr-4" data-testid="brand">
            {/* <button
              onClick={() => setCollapsed?.((prev) => !prev)}
              className="rounded-xl p-2 text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm border border-slate-200 cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button> */}
            <div className="hidden md:block leading-tight">
              <div className="text-base font-semibold text-slate-800">
                Synapse
              </div>
              <div className="text-xs text-slate-500">HMS</div>
            </div>
          </div>

          {/* Horizontal Nav */}
          <nav className="hidden lg:flex flex-1 items-center px-6">
            <div className="relative inline-flex items-center text-[13px] bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              {items.map(item => {
                const isActive = item.key === "dashboard"
                  ? pathname === item.link || pathname === item.link.slice(0, -1)
                  : pathname.startsWith(item.link);

                return (
                  <Link
                    key={item.key}
                    href={item.link}
                    className={
                      "relative flex items-center rounded-full px-4 py-1.5 transition cursor-pointer font-medium shrink-0 " +
                      (isActive ? "text-white" : "text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {isActive && (
                      <motion.span
                        layoutId="topbar-active-indicator"
                        className="absolute inset-0 rounded-full bg-[var(--color-cosmo-copper)]"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Actions */}
          <div
            className="ml-4 flex items-center gap-3 sm:gap-4"
            data-testid="actions"
          >
            {user?.role === "Doctor" && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[var(--color-cosmo-copper)] px-4 py-2 text-sm font-medium text-[var(--color-cosmo-dark)] shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4" /> New Appointment
              </button>
            )}
            {user?.role === "Pharmacy" && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[var(--color-cosmo-copper)] px-4 py-2 text-sm font-medium text-[var(--color-cosmo-dark)] shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => window.dispatchEvent(new CustomEvent('open-new-order'))}
              >
                <Plus className="h-4 w-4" /> New Order
              </button>
            )}
            {user?.role === "Lab" && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[var(--color-cosmo-copper)] px-4 py-2 text-sm font-medium text-[var(--color-cosmo-dark)] shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => window.dispatchEvent(new CustomEvent('open-add-test'))}
              >
                <Plus className="h-4 w-4" /> Book Now
              </button>
            )}
            {(user?.role === "Doctor" || user?.role === "Pharmacy" || user?.role === "Lab") && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[var(--color-cosmo-dark)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-cosmo-brown)] cursor-pointer"
                onClick={() => setOpenPatient(true)}
              >
                <Plus className="h-4 w-4" /> New Patient
              </button>
            )}
            <DoctorProfile />
          </div>
        </div>

        {/* Bottom divider (slimmer) */}
        <div
          className="h-0.75 bg-linear-to-r from-[var(--color-cosmo-copper)]/15 via-[var(--color-cosmo-copper)]/30 to-[var(--color-cosmo-copper)]/15"
          data-testid="header-divider"
        />
      </header>
      {(user?.role === "Doctor" || user?.role === "Lab" || user?.role === "Pharmacy") && (
        <div className="w-full overflow-hidden">
          <AppointmentDialog
            open={openCreate}
            onOpenChange={(v) => !v && setOpenCreate(false)}
          />
          <Dialog open={openPatient} onOpenChange={(v) => !v && setOpenPatient(false)}>
            <DialogContent className="max-w-3xl! max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Patient Register</DialogTitle>
              </DialogHeader>
              <PatientForm onClose={() => setOpenPatient(false)} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
