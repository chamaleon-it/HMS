"use client";

import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CircleCheck,
  Users,
  Pill,
  FlaskConical,
  HeartHandshake,
  Search,
  Calendar,
  IndianRupee,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/fNumber";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ROLES = [
  { key: "all", label: "All Staff" },
  { key: "Pharmacist", label: "Pharmacists" },
  { key: "Technician", label: "Technicians" },
  { key: "Therapist", label: "Therapists" },
];

const ROLE_CONFIG: Record<
  string,
  { icon: any; badge: string; color: string; bg: string }
> = {
  Pharmacist: {
    icon: Pill,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  Technician: {
    icon: FlaskConical,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  Therapist: {
    icon: HeartHandshake,
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

export default function AdminEmployeesPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const url = `/employee${roleFilter !== "all" ? `?role=${roleFilter}` : ""}`;
  const { data: response, isLoading } = useSWR(url);
  const rawEmployees = response?.data || [];

  const employees = rawEmployees.filter((emp: any) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      (emp.name || "").toLowerCase().includes(term) ||
      (emp.employeeId || "").toLowerCase().includes(term) ||
      (emp.designation || "").toLowerCase().includes(term) ||
      (emp.phone || "").toLowerCase().includes(term)
    );
  });

  const totalCount = rawEmployees.length;
  const activeCount = rawEmployees.filter(
    (e: any) => e.status?.toLowerCase() === "active"
  ).length;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <AdminHeader
          title="Employees & Staff Roster"
          subtitle="View and manage hospital clinical staff, compensation structure, and profile details."
        >
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5"
            >
              <Link href="/dashboard/admin/leaves">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Leaves</span>
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
            >
              <Link href="/dashboard/admin/salary">
                <IndianRupee className="h-3.5 w-3.5" />
                <span>Payroll</span>
              </Link>
            </Button>
          </div>
        </AdminHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Staff
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
                  {totalCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-(--color-synapse-light) flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Staff
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
                  {activeCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CircleCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pharmacists
                </p>
                <h3 className="text-2xl font-bold text-blue-600 mt-0.5">
                  {rawEmployees.filter((e: any) => e.role === "Pharmacist").length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pill className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Therapists & Techs
                </p>
                <h3 className="text-2xl font-bold text-purple-600 mt-0.5">
                  {rawEmployees.filter((e: any) => e.role !== "Pharmacist").length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartHandshake className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative inline-flex items-center text-[13px] bg-slate-100 border border-slate-200 rounded-xl p-1 overflow-x-auto">
            {ROLES.map((tab) => {
              const active = roleFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setRoleFilter(tab.key)}
                  className={cn(
                    "relative flex items-center rounded-lg px-4 py-1.5 transition cursor-pointer font-medium shrink-0",
                    active ? "text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                  type="button"
                >
                  {active && (
                    <motion.span
                      layoutId="admin-employee-tab"
                      className="absolute inset-0 rounded-lg bg-(--color-synapse-light)"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-(--color-synapse-light) h-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 overflow-x-auto">
          <Table className="min-w-fit">
            <TableHeader className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark)">
              <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-b-0">
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pl-6">
                  Employee
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Role
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Designation / ID
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Compensation
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5">
                  Contact
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 text-center">
                  Status
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-3.5 pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className="py-3.5 px-4">
                        <div className="h-5 w-full animate-pulse bg-slate-100 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-36 text-center text-slate-400 bg-white"
                  >
                    No employees found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((p: any, idx: number) => {
                  const cfg = ROLE_CONFIG[p.role] || ROLE_CONFIG.Pharmacist;
                  const Icon = cfg.icon;
                  return (
                    <TableRow
                      key={p._id}
                      className={cn(
                        "group transition-colors",
                        idx % 2 === 0
                          ? "bg-white hover:bg-slate-50/80"
                          : "bg-slate-50/50 hover:bg-slate-100/70"
                      )}
                    >
                      <TableCell className="py-3.5 pl-6 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.inCharge && (
                                <CircleCheck
                                  size={14}
                                  className="text-amber-500 fill-amber-500/20"
                                />
                              )}
                            </div>
                            {p.qualification && (
                              <p className="text-[11px] text-slate-400">
                                {p.qualification}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold uppercase px-2 py-0.5 gap-1",
                            cfg.badge
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{p.role}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          <span>{p.designation || p.role}</span>
                        </div>
                        {p.employeeId && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            ID: {p.employeeId}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 tabular-nums flex items-center gap-1">
                            <span className="text-[10px] uppercase text-slate-400 font-bold">
                              Basic:
                            </span>
                            <span className="text-emerald-700 font-bold">
                              {p.basicPay ? formatINR(p.basicPay) : "—"}
                            </span>
                          </div>
                          {(Boolean(p.hourlySalary) || Boolean(p.commission)) && (
                            <div className="flex items-center gap-1 text-[10px] font-medium flex-wrap mt-0.5">
                              {Boolean(p.hourlySalary) && (
                                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  {formatINR(p.hourlySalary || 0)}/hr
                                </span>
                              )}
                              {Boolean(p.commission) && (
                                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                  Comm: {formatINR(p.commission || 0)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-600">
                        <div>{p.phone || "—"}</div>
                        {p.email && (
                          <div className="text-[11px] text-slate-400">
                            {p.email}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold uppercase px-2 py-0.5",
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {p.status || "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          >
                            <Link href={`/dashboard/admin/leaves?employeeId=${p._id}`}>
                              Leaves
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Link href={`/dashboard/admin/salary?employeeId=${p._id}`}>
                              Salary
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
