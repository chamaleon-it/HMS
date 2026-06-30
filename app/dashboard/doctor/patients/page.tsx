"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/components/layout/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import PatientTable from "./PatientTable";
import Filter from "./Filter";
import Statistics from "./Statistics";
import DoctorHeader from "../components/DoctorHeader";
import { Data } from "./PatientTable";
import { Plus } from "lucide-react";
import { DraftProvider } from "@/app/dashboard/pharmacy/DraftContext";
import { DraftManager } from "@/app/dashboard/pharmacy/DraftManager";
import { LabDraftProvider } from "@/app/dashboard/lab/LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";

export interface FilterType {
  query?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gender?: string;
  doctor?: string;
  date?: Date;
  age: [number, number];
  lastVisit?: number | string;
  conditions: string[];
  status?: string;
  dateRange: {
    from?: string;
    to?: string;
  };
  consultedOnly?: boolean;
}

export default function PatientsEnhanced() {
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    address: undefined,
    city: undefined,
    district: undefined,
    state: undefined,
    pincode: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    conditions: [],
    date: undefined,
    status: undefined,
    dateRange: { from: undefined, to: undefined },
    consultedOnly: false,
  });

  // ✅ Build query params efficiently using useMemo (avoids recomputation)
  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    const addParam = (key: string, value?: string | number) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    };

    addParam("query", filter.query);
    addParam("address", filter.address);
    addParam("city", filter.city);
    addParam("district", filter.district);
    addParam("state", filter.state);
    addParam("pincode", filter.pincode);
    addParam("gender", filter.gender);
    addParam("doctor", filter.doctor);
    addParam("minAge", filter.age?.[0]);
    addParam("maxAge", filter.age?.[1]);
    addParam("status", filter.status);
    addParam("consultedOnly", filter.consultedOnly ? "true" : "false");

    // Handle date filters
    if (typeof filter.lastVisit === "number") {
      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - filter.lastVisit);

      // set time boundaries
      from.setHours(0, 0, 0, 0); // 00:00:00.000
      now.setHours(23, 59, 59, 999); // 23:59:59.999

      addParam("from", from.toISOString());
      addParam("to", now.toISOString());
    } else if (filter.dateRange.from && filter.dateRange.to) {
      const from = new Date(filter.dateRange.from);
      const to = new Date(filter.dateRange.to);

      // set time boundaries
      from.setHours(0, 0, 0, 0); // start of day
      to.setHours(23, 59, 59, 999); // end of day

      addParam("from", from.toISOString());
      addParam("to", to.toISOString());
    }

    if (filter.date) addParam("date", filter.date.toISOString());
    if (filter.conditions?.length)
      addParam("conditions", JSON.stringify(filter.conditions));

    return params.toString();
  }, [filter]);

  const { data: tableData, mutate: tableMutate } = useSWR<{
    message: string;
    data: Data[];
  }>(`/patients?${queryString}`);

  const { data: statisticsData, mutate: statisticsMutate } = useSWR<{
    data: {
      total: number;
      active: number;
      inactive: number;
      critical: number;
      discharged: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
      male: number;
      female: number;
    };
    message: string;
  }>("/patients/statistics");

  // ✅ Extract stats once
  const statistics = statisticsData?.data;

  // ✅ Open create modal if URL includes hash
  useEffect(() => {
    if (window.location.hash.includes("register")) {
      setOpenCreate(true);
    }
  }, []);

  // ✅ Refetch when filter changes


  const refreshData = () => {
    tableMutate();
    statisticsMutate();
  };

  return (
    <LabDraftProvider userId={user?._id ?? ""}>
      <DraftProvider>
        <AppShell>
          <div className="min-h-[calc(100vh-67px)] w-full bg-linear-to-b from-white to-slate-50 p-6 space-y-5">
            <DoctorHeader
              title="Patients"
              subtitle="Search, filter & review patient history"
            >
              {/* <PrimaryButton onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 inline h-4 w-4" /> New Patient
          </PrimaryButton> */}
            </DoctorHeader>

            {/* Statistics */}
            <Statistics statistics={statistics} />

            {/* Filters */}
            <Filter filter={filter} setFilter={setFilter} />

            {/* Table */}
            <PatientTable data={tableData} tableMutate={refreshData} />

            {/* Pagination (future ready) */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">100</span> of{" "}
                <span className="font-medium text-gray-700">100</span> patients
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
                  disabled
                >
                  Prev
                </button>
                <div className="px-3 h-10 grid place-items-center rounded-xl bg-gray-100 text-sm">
                  1 / 1
                </div>
                <button
                  className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Dialog for new patient */}
          <Dialog
            open={openCreate}
            onOpenChange={(v) => !v && setOpenCreate(false)}
          >
            <DialogContent className="max-w-3xl! max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Patient Register</DialogTitle>
              </DialogHeader>
              <PatientForm
                onClose={() => setOpenCreate(false)}
                mutate={refreshData}
              />
            </DialogContent>
          </Dialog>
          <DraftManager />
          <LabDraftManager />
        </AppShell>
      </DraftProvider>
    </LabDraftProvider>
  );
}

const theme = {
  from: "var(--color-cosmo-copper)",
  to: "var(--color-cosmo-brown)",
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className} cursor-pointer flex items-center justify-center`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
