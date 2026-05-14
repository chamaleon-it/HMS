"use client";

import React, { useState } from "react";
import { Bell, Plus, Menu } from "lucide-react";
import DoctorProfile from "./Profile";
import { CreateAppointmentForm } from "@/app/dashboard/doctor/appointments/CreateAppointmentForm";
import Drawer from "../ui/drawer";
import useAppointmentList from "@/app/dashboard/doctor/appointments/data/useAppointmentList";
import { useAuth } from "@/auth/context/auth-context";
import SearchBar from "./SearchBar";
import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const [openCreate, setOpenCreate] = useState(false);


  const { user } = useAuth();
  const pathname = usePathname();





  const items =
    (user?.role === "Doctor" && [
      { key: "dashboard", label: "Dashboard", link: "/dashboard/doctor/" },
      { key: "appointments", label: "Appointments", link: "/dashboard/doctor/appointments/" },
      { key: "patients", label: "Patients", link: "/dashboard/doctor/patients/" },
      { key: "lab-results", label: "Investigations", link: "/dashboard/doctor/lab-report/" },
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
      { key: "purchase", label: "Purchase", link: "/dashboard/pharmacy/purchase/" },
      { key: "billing", label: "Billing", link: "/dashboard/pharmacy/billing/" },
    ]) ||
    (user?.role === "Pharmacy Wholesaler" && [
      { key: "dashboard", label: "Dashboard", link: "/dashboard/pharmacy-wholesaler" },
      { key: "billing", label: "Billing", link: "/dashboard/pharmacy-wholesaler/billing/" },
    ]) ||
    (user?.role === "Lab" && [
      { key: "appointments", label: "Appointments", link: "/dashboard/lab/appointments/" },
      { key: "dashboard", label: "Dashboard", link: "/dashboard/lab/" },
      { key: "tests", label: "Test", childrens: [{ key: "lab", label: "Lab", link: "/dashboard/lab/test/lab/" }, { key: "imaging", label: "Imaging", link: "/dashboard/lab/test/imaging/" }] },
      { key: "inventory", label: "Catalogue", link: "/dashboard/lab/inventory/" },
      { key: "patients", label: "Customers", link: "/dashboard/lab/patients/" },
      { key: "billing", label: "Billing", link: "/dashboard/lab/billing/" },
      { key: "payments", label: "Payments", link: "/dashboard/lab/payments/" },
    ]) || [];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md w-full print:hidden">
        {/* Background glow (subtle) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28">
          <div className="mx-auto h-full w-full max-w-screen-2xl opacity-40 mask-[radial-gradient(60%_60%_at_50%_0%,#000_0%,transparent_70%)]">
            <div className="h-full w-full bg-[radial-gradient(1000px_200px_at_15%_-20%,#818cf8_12%,transparent_60%),radial-gradient(1000px_200px_at_85%_-20%,#e879f9_12%,transparent_60%)]" />
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
                const isActive = item.childrens
                  ? item.childrens.some(child => pathname.startsWith(child.link))
                  : item.key === "dashboard"
                    ? pathname === item.link || pathname === item.link?.slice(0, -1)
                    : pathname.startsWith(item.link || "xxx");

                return item.childrens ? (
                  <div key={item.key} className="relative group cursor-pointer shrink-0">
                    <span
                      className={
                        "relative flex items-center rounded-full px-4 py-1.5 transition cursor-pointer font-medium " +
                        (isActive ? "text-white" : "text-slate-600 hover:bg-slate-50")
                      }
                    >
                      {isActive && (
                        <motion.span
                          layoutId="topbar-active-indicator"
                          className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {item.label}
                      </span>
                    </span>
                    <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                      <div className="flex flex-col bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl w-36 py-2 overflow-hidden">
                        {item.childrens.map(child => (
                          <Link
                            key={child.key}
                            href={child.link}
                            className={`px-4 py-2 transition-colors ${pathname.startsWith(child.link) ? "text-indigo-600 font-bold bg-indigo-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                              }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.key}
                    href={item.link || "#"}
                    className={
                      "relative flex items-center rounded-full px-4 py-1.5 transition cursor-pointer font-medium shrink-0 " +
                      (isActive ? "text-white" : "text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {isActive && (
                      <motion.span
                        layoutId="topbar-active-indicator"
                        className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500"
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

          {/* Search */}
          <SearchBar />

          {/* Actions */}
          <div
            className="ml-4 flex items-center gap-3 sm:gap-4"
            data-testid="actions"
          >
            {user?.role === "Doctor" && (
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => setOpenCreate(true)}
              >
                <Plus className="h-4 w-4" /> New Appointment
              </button>
            )}
            {/* <button
              className="relative rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button> */}

            <DoctorProfile />
          </div>
        </div>

        {/* Bottom divider (slimmer) */}
        <div
          className="h-0.75 bg-linear-to-r from-indigo-600/15 via-fuchsia-600/15 to-indigo-600/15"
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
            />
          </Drawer>
        </div>
      )}
    </>
  );
}
