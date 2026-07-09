"use client";
import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Search, Bed, User, FileText, ArrowRight } from "lucide-react";
import PharmacyHeader from "@/app/dashboard/pharmacy/components/PharmacyHeader";
import { format } from "date-fns";

export default function IPList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { data, isLoading } = useSWR(`/in-patients?page=${page}&limit=20&q=${query}`);

  const ipList = data?.data || [];
  const total = data?.total || 0;

  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 flex flex-col gap-6 min-h-[calc(100vh-67px)]">
          <PharmacyHeader title="In-Patients" subtitle="Manage admitted patients">
            <Link
              href="/dashboard/reception/ip/new"
              className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md bg-[var(--color-synapse-dark)] hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" /> Admit Patient
            </Link>
          </PharmacyHeader>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 w-full max-w-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IP number or status..."
                className="bg-transparent border-none outline-none text-sm w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">IP Number</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Ward/Room/Bed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Admitted On</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-10">Loading...</td></tr>
                  ) : ipList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-500">No records found.</td></tr>
                  ) : (
                    ipList.map((ip: any) => (
                      <tr key={ip._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{ip.admissionNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-synapse-light)] flex items-center justify-center font-bold">
                              {ip.patientId?.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{ip.patientId?.name}</div>
                              <div className="text-xs text-gray-500">{ip.patientId?.mrn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{ip.doctorId?.name ? `Dr. ${ip.doctorId.name}` : '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {ip.ward} / {ip.room} / <span className="font-semibold text-gray-900">{ip.bed}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ip.status === 'Admitted' ? 'bg-blue-100 text-blue-700' :
                            ip.status === 'Discharged' ? 'bg-gray-100 text-gray-700' :
                            ip.status === 'Surgery' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ip.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {format(new Date(ip.admissionDate), 'dd MMM yyyy, hh:mm a')}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/reception/ip/${ip._id}`} className="text-[var(--color-synapse-light)] hover:underline font-medium flex items-center gap-1">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination placeholder */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <div>Showing {ipList.length} of {total} records</div>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  disabled={ipList.length < 20} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
