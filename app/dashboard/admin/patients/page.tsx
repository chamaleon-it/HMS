"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/components/layout/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import PatientTable, { Data } from "@/app/dashboard/doctor/patients/PatientTable";
import Filter from "@/app/dashboard/doctor/patients/Filter";
import Statistics from "@/app/dashboard/doctor/patients/Statistics";
import AdminHeader from "../components/AdminHeader";
import { DraftProvider } from "@/app/dashboard/pharmacy/DraftContext";
import { DraftManager } from "@/app/dashboard/pharmacy/DraftManager";
import { LabDraftProvider } from "@/app/dashboard/lab/LabDraftContext";
import { LabDraftManager } from "@/components/dashboard/lab/Home/LabDraftManager";
import { useAuth } from "@/auth/context/auth-context";
import { FilterType } from "@/app/dashboard/doctor/patients/page";
import { PaginationBar } from "@/app/dashboard/pharmacy/components/PaginationBar";

interface AdminFilterType extends FilterType {
  page: number;
  limit: number;
}

export default function AdminPatientsPage() {
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState<AdminFilterType>({
    query: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    conditions: [],
    date: undefined,
    status: undefined,
    dateRange: { from: undefined, to: undefined },
    consultedOnly: false,
    page: 1,
    limit: 25,
  });

  const handleSetFilter = (newFilter: any) => {
    setFilter((prev) => {
      const resolved = typeof newFilter === "function" ? newFilter(prev) : newFilter;
      const prevAny = prev as any;
      const resolvedAny = resolved as any;
      
      const filtersChanged = Object.keys(resolved).some(
        (key) => key !== "page" && key !== "limit" && resolvedAny[key] !== prevAny[key]
      );
      
      return {
        ...prev,
        ...resolved,
        page: filtersChanged ? 1 : (resolved.page ?? prev.page),
        limit: resolved.limit ?? prev.limit,
      };
    });
  };

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
    addParam("page", filter.page);
    addParam("limit", filter.limit);

    if (typeof filter.lastVisit === "number") {
      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - filter.lastVisit);
      from.setHours(0, 0, 0, 0);
      now.setHours(23, 59, 59, 999);
      addParam("from", from.toISOString());
      addParam("to", now.toISOString());
    } else if (filter.dateRange.from && filter.dateRange.to) {
      const from = new Date(filter.dateRange.from);
      const to = new Date(filter.dateRange.to);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      addParam("from", from.toISOString());
      addParam("to", to.toISOString());
    }

    if (filter.date) addParam("date", filter.date.toISOString());
    if (filter.conditions?.length)
      addParam("conditions", JSON.stringify(filter.conditions));

    return params.toString();
  }, [filter]);

  const { data: tableData, mutate: tableMutate, isLoading, isValidating } = useSWR<{
    message: string;
    data: Data[];
    total: number;
  }>(`/patients?${queryString}`, { keepPreviousData: true });

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

  const statistics = statisticsData?.data;

  useEffect(() => {
    if (window.location.hash.includes("register")) {
      setOpenCreate(true);
    }
  }, []);

  const refreshData = () => {
    tableMutate();
    statisticsMutate();
  };

  return (
    <LabDraftProvider userId={user?._id ?? ""}>
      <DraftProvider>
        <AppShell>
          <div className="p-6 space-y-6">
            <AdminHeader
              title="Patients"
              subtitle="Search, filter & review patient history and profiles"
            />

            <Statistics statistics={statistics} />

            <Filter filter={filter} setFilter={handleSetFilter as any} />

            <PatientTable
              data={tableData}
              tableMutate={refreshData}
              isAdmin={true}
              page={filter.page}
              limit={filter.limit}
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{tableData?.data?.length || 0}</span> of{" "}
                <span className="font-medium text-gray-700">{tableData?.total || 0}</span> patients
              </p>
              <PaginationBar
                page={filter.page}
                limit={filter.limit}
                total={tableData?.total || 0}
                setFilter={setFilter as any}
                disabled={isLoading || isValidating}
              />
            </div>
          </div>

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
