"use client";

import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CircleCheck, Users, Pill, FlaskConical, HeartHandshake, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";

const ROLES = [
  { key: "all", label: "All" },
  { key: "Pharmacist", label: "Pharmacists" },
  { key: "Technician", label: "Technicians" },
  { key: "Therapist", label: "Therapists" },
];

const ROLE_BADGE: Record<string, string> = {
  Pharmacist: "bg-blue-50 text-blue-700 border-blue-200",
  Technician: "bg-amber-50 text-amber-700 border-amber-200",
  Therapist: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminEmployeesPage() {
  const [roleFilter, setRoleFilter] = useState("all");

  const url = `/employee${roleFilter !== "all" ? `?role=${roleFilter}` : ""}`;
  const { data: response, isLoading } = useSWR(url);
  const employees = response?.data || [];

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <AdminHeader
          title="Employees"
          subtitle="View all staff — pharmacists, technicians, therapists, and pharmacy employees."
        />

        {/* Role Tabs */}
        <div className="relative inline-flex items-center text-[13px] bg-white border border-gray-200 rounded-full p-1 shadow-sm">
          {ROLES.map((tab) => {
            const active = roleFilter === tab.key;
            return (
              <button key={tab.key} onClick={() => setRoleFilter(tab.key)}
                className={cn(
                  "relative flex items-center rounded-full px-4 py-1.5 transition cursor-pointer font-medium shrink-0",
                  active ? "text-white" : "text-slate-600 hover:bg-slate-50"
                )} type="button">
                {active && (
                  <motion.span layoutId="admin-employee-tab"
                    className="absolute inset-0 rounded-full bg-(--color-synapse-light)"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
          <Table className="min-w-fit">
            <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
              <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">Name</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Role</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Qualification</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">License No.</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Designation</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} className="py-3 px-4">
                        <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground bg-white">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((p: any, idx: number) => (
                  <TableRow key={p._id}
                    className={cn("group transition-colors", idx % 2 === 0 ? "bg-white hover:bg-white/60" : "bg-slate-50 hover:bg-slate-50/60")}>
                    <TableCell className="py-3 pl-4 font-medium text-slate-900 flex items-center gap-2">
                      {p.name}
                      {p.inCharge && <CircleCheck size={14} className="text-green-500 fill-green-500/20" />}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase px-2 py-0.5", ROLE_BADGE[p.role] || "")}>
                        {p.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-slate-600">
                      {p.qualification || <span className="text-slate-400 italic text-[11px]">Not set</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      {p.licenseNumber || <span className="text-slate-400 italic text-[11px]">Not set</span>}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 font-medium text-[13px]">
                      {p.designation || <span className="text-slate-400 italic text-[11px]">Not set</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase px-2 py-0.5",
                        p.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                        {p.status || "Active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
