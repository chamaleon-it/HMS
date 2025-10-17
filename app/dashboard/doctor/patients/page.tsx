"use client";

import AppShell from "@/components/layout/app-shell";
import React, { useState } from "react";
import { RegisterPatient } from "./RegisterPatient";
import PatientTable from "./PatientTable";
import Filter from "./Filter";
import Statistics from "./Statistics";
import Drawer from "@/components/ui/drawer";

export interface FilterType {
  query: undefined | string;
  gender: undefined | string;
  doctor: undefined | string;
  age: [number, number];
  lastVisit: undefined | number;
  condition: string[];
}

export default function PatientsEnhanced() {
  const [openCreate, setOpenCreate] = useState(false);

  const [filter, setFilter] = useState<FilterType>({
    query: undefined,
    gender: undefined,
    doctor: undefined,
    age: [0, 100],
    lastVisit: undefined,
    condition: [],
  });

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
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 cursor-pointer"
              onClick={() => setOpenCreate(true)}
            >
              New Patient
            </button>
          </div>
        </div>

        <Statistics />
        <Filter filter={filter} setFilter={setFilter} />

        <PatientTable filter={filter}/>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{100}</span> of{" "}
            <span className="font-medium text-gray-700">{100}</span> patients
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
              disabled={1 === 1}
            >
              Prev
            </button>
            <div className="px-3 h-10 grid place-items-center rounded-xl bg-gray-100 text-sm">
              {1} / {1}
            </div>
            <button
              className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50"
              disabled={1 === 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Drawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Patient Register"
      >
        <RegisterPatient onClose={() => setOpenCreate(false)} />
      </Drawer>
    </AppShell>
  );
}
