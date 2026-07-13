"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { Search, Bed, User, Stethoscope, Eye, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Admitted: "bg-blue-100 text-blue-700 border-blue-200",
  "Under Observation": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Surgery: "bg-red-100 text-red-700 border-red-200",
  Discharged: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminIPPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useSWR<{ data: any[] }>(
    `/in-patients?${query ? `q=${query}` : ""}`
  );

  const records: any[] = data?.data ?? [];

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <AdminHeader
          title="In-Patients (IP)"
          subtitle="Read-only view of all admitted, discharged and under-care patients"
        />

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by admission no. or status…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No in-patient records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {["Admission No.", "Patient", "Doctor", "Ward / Room / Bed", "Admitted On", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((r: any) => (
                    <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-700">{r.admissionNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {r.patientId?.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{r.patientId?.name ?? "—"}</div>
                            <div className="text-[11px] text-gray-400">{r.patientId?.mrn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.doctorId?.name ? `Dr. ${r.doctorId.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {[r.ward, r.room, r.bed].filter(Boolean).join(" / ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {fDate(r.admissionDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/admin/ip/single?id=${r._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-right">{records.length} record{records.length !== 1 ? "s" : ""} found</p>
      </div>
    </AppShell>
  );
}
