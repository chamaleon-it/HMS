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
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}
    >
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
            Investigations
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
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600">
              <th className="w-10 text-left px-4 py-3">
                <input type="checkbox" className="h-4 w-4" />
              </th>
              <th className="w-14 text-left px-4 py-3">No.</th>
              {headerCell("Patient")}
              {headerCell("Test")}
              {headerCell("Sample")}
              {headerCell("Facility")}
              {headerCell("Center")}
              {headerCell("Created At")}
              {headerCell("Reported")}
              {headerCell("Doctor")}
              <th className="text-left px-4 py-3">Value</th>
              {headerCell("Status")}
              <th className="w-40 text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {REPORT.filter(
              () => status === "All" || status === "Upcoming"
            ).map((r, idx) => {
              return (
                <tr
                  key={r._id}
                  className="border-t border-gray-100 hover:bg-gray-50/60"
                >
                  <td className="px-2 py-3">
                    <input type="checkbox" className="h-4 w-4" />
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-500">{idx+1}</td>
                  <td className="px-2 py-3">
                    <div className="font-medium text-gray-900">
                      {r.patient.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.patient.mrn} • {fAge(r.patient.dateOfBirth)}/
                      {r.patient.gender}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r.name.map((e) => (
                      <p key={e._id}>{e.name}</p>
                    ))}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r.sampleType}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r.name.map((e) => (
                      <p key={e._id}>
                        {e.type === "Lab" ? "🧪 Lab" : "🩻 Imaging"}
                      </p>
                    ))}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {r.lab.name}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {fDate(r.createdAt)}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {fDate(r.date)}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    Dr: {r.doctor.name}
                  </td>
                  <td className="px-2 py-3 text-xs">
                    {r.name.map(
                      (e) =>
                        e.min &&
                        e.max && (
                          <p
                            key={e._id}
                          >{`${e?.min} ${e.unit} to ${e?.max} ${e.unit}`}</p>
                        )
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <Chip label={r.status} tone={statusTone("Pending")} />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">
                        View
                      </button>
                      <button className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">
                        History
                      </button>
                      <button className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">
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
    <th className="text-left px-2 py-3 select-none">
      <button
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          false ? "text-gray-900" : "text-gray-600"
        } hover:text-gray-900`}
      >
        {label}
        <span
          className={`text-[10px] ${false ? "opacity-100" : "opacity-40"}`}
        ></span>
      </button>
    </th>
  );
}
