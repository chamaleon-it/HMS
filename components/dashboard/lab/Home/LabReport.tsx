"use client";

import { fAge, fDate } from "@/lib/fDateAndTime";
import React, { useState } from "react";
import useSWR from "swr";
import LabStatus from "./LabStatus";

// ----- Small UI helpers -----
const Chip: React.FC<{
  label: string;
  tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
    gray: "bg-slate-50 text-slate-600 ring-slate-200/50",
    red: "bg-rose-50 text-rose-700 ring-rose-200/50",
    blue: "bg-sky-50 text-sky-700 ring-sky-200/50",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/50",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${tone === 'gray' ? 'bg-slate-400' : tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'blue' ? 'bg-sky-500' : 'bg-rose-500'}`}></span>
      {label}
    </span>
  );
};

// ----- Main Component -----
export default function LabResultsPage() {
  const statusTone = (s: string): "green" | "gray" | "red" | "blue" | "amber" =>
    s === "Completed"
      ? "green"
      : s === "Pending"
        ? "gray"
        : s === "In Progress"
          ? "amber"
          : "red";

  const { data } = useSWR<{
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
            Track, filter & review lab and imaging results
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <LabStatus currenctStatus={status} setCurrenctStatus={setStatus} />

          <button className="px-4 py-2 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50">
            Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl   bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <table className="w-full whitespace-nowrap  overflow-scroll">
          <thead className="bg-slate-700 hover:bg-slate-700">
            <tr className="bg-slate-700 hover:bg-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium ">
              <th className="w-10 text-left px-3 py-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              </th>
              <th className="w-14 text-left px-3 py-2">No.</th>
              {headerCell("Patient")}
              {headerCell("Test & Facility")}
              <th className="text-left px-3 py-2">Value</th>
              {headerCell("Created At")}
              {headerCell("Reported")}
              {headerCell("Doctor")}
              {headerCell("Status")}
              <th className="w-40 text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {REPORT.filter(
              () => status === "All" || status === "Upcoming"
            ).map((r, idx) => {
              return (
                <tr
                  key={r._id}
                  className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200 last:border-0"
                >
                  <td className="px-3 py-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">
                        {r.patient.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-600">{r.patient.mrn}</span> • {fAge(r.patient.dateOfBirth)} • {r.patient.gender}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <div className="flex flex-col gap-2">
                      {r.name.map((e) => (
                        <div key={e._id} className="flex items-center gap-1 h-5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {e.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex flex-col gap-2">
                      {r.name.map(
                        (e) =>
                          e.min &&
                          e.max && (
                            <span
                              key={e._id}
                              className="text-gray-600 font-mono h-5"
                            >{`${e?.min} - ${e?.max} ${e.unit}`}</span>
                          )
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-sm text-gray-500">
                    {fDate(r.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {fDate(r.date)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[100px]" title={r.doctor.name}>Dr. {r.doctor.name}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <Chip label={r.status} tone={statusTone(r.status)} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2  transition-opacity duration-200">
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                        View
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                        History
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                        Share
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function headerCell(label: string) {
  return (
    <th className="text-left px-3 py-2">
      {label}
    </th>
  );
}
