"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/components/layout/app-shell";
import Drawer from "@/components/ui/drawer";
import { RegisterPatient } from "./RegisterPatient";
import PatientTable from "./PatientTable";
import Filter from "./Filter";
import Statistics from "./Statistics";
import { Data } from "./PatientTable";

export interface FilterType {
  query?: string;
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
}

export default function PatientsEnhanced() {
  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    conditions: [],
    date: undefined,
    status: undefined,
    dateRange: { from: undefined, to: undefined },
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
    addParam("gender", filter.gender);
    addParam("doctor", filter.doctor);
    addParam("minAge", filter.age?.[0]);
    addParam("maxAge", filter.age?.[1]);
    addParam("status", filter.status);

    // Handle date filters
    if (typeof filter.lastVisit === "number") {
      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - filter.lastVisit);
      addParam("from", from.toISOString());
      addParam("to", now.toISOString());
    } else if (filter.dateRange.from && filter.dateRange.to) {
      addParam("from", new Date(filter.dateRange.from).toISOString());
      addParam("to", new Date(filter.dateRange.to).toISOString());
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
  useEffect(() => {
    tableMutate();
    statisticsMutate();
  }, [queryString, tableMutate, statisticsMutate]);

  const refreshData = () => {
    tableMutate();
    statisticsMutate();
  };

  return (
    <AppShell>
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="text-sm text-gray-500">
              Search, filter & review patient history
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 cursor-pointer"
            onClick={() => setOpenCreate(true)}
          >
            New Patient
          </button>
        </div>

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

      {/* Drawer for new patient */}
      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Patient Register"
      >
        <RegisterPatient
          onClose={() => setOpenCreate(false)}
          mutate={refreshData}
        />
      </Drawer>
    </AppShell>
  );
}
