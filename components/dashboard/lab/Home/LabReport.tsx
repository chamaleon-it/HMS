"use client";

import React, { useState } from "react";
import useSWR from "swr";
import LabStatus from "./LabStatus";
import NewTest from "./NewTest";
import LabTable from "./LabTable";

export default function LabResultsPage() {

  const { data, mutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        email: string;
        gender: string;
        dateOfBirth: Date;
        conditions: string[];
        blood: string;
        allergies: string;
        address: string;
        notes: string;
        createdBy: string;
        status: string;
        mrn: string;
        createdAt: Date;
        updatedAt: Date;
      };
      doctor: {
        _id: string;
        name: string;
        specialization: null | string;
      };
      lab: {
        _id: string;
        name: string;
        specialization: null | string;
      };
      date: Date;
      priority: string;
      name: {
        code: string;
        name: string;
        unit: string;
        min?: number;
        max?: number;
        type: string;
        _id: string;
        value: string | number
      }[];
      sampleType: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }>("/lab/report");

  const REPORT = data?.data ?? [];

  const [status, setStatus] = useState<
    "All" | "Upcoming" | "Waiting For Result" | "Completed"
  >("All");

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-white to-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Lab and imaging results
          </p>
        </div>
        <div className="flex gap-3 items-center">


          <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />
          <NewTest mutate={mutate} />

        </div>
      </div>

      <LabTable REPORT={REPORT} status={status} />
    </div>
  );
}
