import { fDateandTime } from "@/lib/fDateAndTime";
import Link from "next/link";
import React from "react";
import useSWR from "swr";

export default function PatientTable() {
  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      name: string;
      phoneNumber: string;
      email: string;
      gender: "Male" | "Female" | "Other";
      age: number;
      condition: string;
      blood: string;
      allergies: string;
      address: string;
      notes: string;
      createdBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
        phoneNumber: string;
      };
      createdAt: Date;
    }[];
  }>("/patients");

  return (
    <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-600">
            <th className="w-14 text-left px-4 py-3">No.</th>
            {headerCell("Patient")}
            {headerCell("Phone Number")}
            <th className="w-24 text-left px-4 py-3">ID</th>
            {headerCell("Age / Gender")}
            {headerCell("Created At")}
            {headerCell("Created By")}
            <th className="text-left px-4 py-3">Conditions</th>
            {headerCell("Blood")}
            {headerCell("Allergies")}

            <th className="w-40 text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((r, idx) => {
            const serial = (0 - 1) * 0 + idx + 1; // serial number after filters & sort
            return (
              <tr
                key={r._id}
                className="border-t border-gray-100 hover:bg-gray-50/60"
              >
                <td className="px-2 py-3 text-sm text-gray-500" align="center">
                  {serial}
                </td>
                <td className="px-2 py-3">
                  <Link href={`/patients/${r.name}`}>
                    <div className="font-medium text-gray-900">{r.name}</div>
                  </Link>
                  <div className="text-xs text-gray-500">{r.email}</div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.phoneNumber}
                </td>
                <td className="px-2 py-3 text-sm text-gray-600">
                  {r._id.slice(-5)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.age} <span className="text-gray-400">/</span> {r.gender}
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {fDateandTime(r.createdAt)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.createdBy.name} - {r.createdBy.role}
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r?.condition && <Chip
                      label={r?.condition}
                      tone={
                        r?.condition?.toLowerCase().includes("fever")
                          ? "amber"
                          : r?.condition?.toLowerCase().includes("diabetes")
                          ? "amber"
                          : "gray"
                      }
                    />}
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-700">{r.blood}</td>
                <td className="px-2 py-3 text-sm text-gray-700">
                  {r.allergies}
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link
                      href={`/dashboard/doctor/patients/${r.name}`}
                      className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      View
                    </Link>
                    <button className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer">
                      History
                    </button>
                    <button className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer">
                      Share
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {data?.data.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-12 text-center text-sm text-gray-500"
              >
                No patients match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function headerCell(label: string) {
  return (
    <th className="text-left px-2 py-3 select-none">
      <button
        className={`inline-flex items-center gap-1 text-xs font-medium ${"text-gray-600"} hover:text-gray-900`}
      >
        {label}
      </button>
    </th>
  );
}

const Chip: React.FC<{
  label: string;
  tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    // refreshed palette
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
