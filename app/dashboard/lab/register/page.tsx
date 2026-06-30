"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import useSWR from "swr";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import DateFilter from "../../pharmacy/DateFilter";
import { TableSkeleton } from "../../pharmacy/components/PharmacySkeleton";
import { endOfDay, startOfDay, subDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Search, RefreshCcw } from "lucide-react";
import { PaginationBar } from "../../pharmacy/components/PaginationBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface FilterType {
  q: null | string;
  qEnd: null | string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  date: Date;
  page: number;
  limit: number;
}

export default function LabRegisterPage() {
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    qEnd: null,
    activeDate: "Today",
    date: new Date(),
    page: 1,
    limit: 10,
  });

  const params = new URLSearchParams();

  if (filter.q) {
    params.set("q", filter.q);
  }

  if (filter.qEnd && filter.qEnd.length >= 7) {
    params.set("qEnd", filter.qEnd);
  }

  let sd: Date = startOfDay(new Date());
  let ed: Date = endOfDay(new Date());

  if (filter.activeDate === "Today") {
    sd = startOfDay(new Date());
  } else if (filter.activeDate === "7 days") {
    sd = startOfDay(subDays(new Date(), 7));
  } else if (filter.activeDate === "30 days") {
    sd = startOfDay(subDays(new Date(), 30));
  } else if (filter.activeDate === "Custom" && filter.date) {
    sd = startOfDay(filter.date);
    ed = endOfDay(filter.date);
  }

  params.set("startDate", sd.toISOString());
  params.set("endDate", ed.toISOString());
  params.set("activeDate", filter.activeDate);
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));

  const { data: billingData, isLoading } = useSWR<{
    message: string;
    total: number;
    data: {
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      insurance: number;
      discount: number;
      roundOff: boolean;
      items: {
        total: number;
        quantity: number;
        unitPrice: number;
      }[];
      patient: {
        name: string;
        mrn: string;
      };
      transactionType: "Return" | "Sale";
      doctor: any;
    }[];
  }>(`/billing?${params.toString()}`);

  const billing = billingData?.data ?? [];
  const totalItems = billingData?.total ?? 0;

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col mb-2 gap-4">
            <LabHeader
              title="Lab Register"
              subtitle="View all registers, customer details, and total amounts"
            />
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-6">
              {/* Search Invoice Range */}
              <div className="space-y-2 flex-1 min-w-[280px]">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                  Search Invoice Range
                </label>
                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[var(--color-cosmo-copper)] transition-colors" />
                    <Input
                      value={filter.q ?? ""}
                      onChange={(e) =>
                        setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
                      }
                      placeholder="From..."
                      className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-cosmo-copper)]/20 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[var(--color-cosmo-copper)] transition-colors" />
                    <Input
                      value={filter.qEnd ?? ""}
                      onChange={(e) =>
                        setFilter((prev) => ({ ...prev, qEnd: e.target.value, page: 1 }))
                      }
                      placeholder="To..."
                      className="pl-9 h-10 bg-slate-50/50 border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-cosmo-copper)]/20 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2 min-w-[180px]">
                <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold ml-1">
                  Date Filter
                </label>
                <div className="block">
                  <DateFilter
                    activeDate={filter.activeDate}
                    setActiveDate={(activeDate) => setFilter((prev) => ({ ...prev, activeDate, page: 1 }))}
                    date={filter.date}
                    setDate={(date) => setFilter((prev) => ({ ...prev, date, page: 1 }))}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="ml-auto">
                <Button
                  variant="outline"
                  className="h-10 px-7 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                  onClick={() => setFilter({ q: null, qEnd: null, activeDate: "Today", date: new Date(), page: 1, limit: 10 })}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 border rounded-2xl shadow-md shadow-slate-200 overflow-hidden">
            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              <Table className="min-w-[1000px] text-sm" containerClassName="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                <TableHeader className="bg-[var(--color-cosmo-dark)] sticky top-0 z-20 shadow-sm">
                  <TableRow className="bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] border-b-0">
                    <TableHead className="py-3 text-left pl-4 text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Sl No</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Invoice</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Date</TableHead>
                    <TableHead className="py-3 text-left text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Patient</TableHead>
                    <TableHead className="py-3 text-right text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Paid Amount</TableHead>
                    <TableHead className="py-3 text-right pr-4 text-white font-bold text-[11px] uppercase tracking-wider bg-[var(--color-cosmo-dark)]">Total Bill</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                            <Search className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No registers found</p>
                          <p className="text-xs text-slate-400">Try selecting a different date</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (filter.activeDate === "Today" || filter.activeDate === "Custom"
                      ? billing
                      : billing.slice((filter.page - 1) * filter.limit, filter.page * filter.limit)
                    ).map((b, idx) => (
                      <TableRow
                        key={b._id}
                        className={idx % 2 === 0
                          ? "bg-white hover:bg-white/60"
                          : "bg-slate-100 hover:bg-slate-100/60"
                        }
                      >
                        <TableCell className="py-3 pl-4 text-slate-500">
                          {(filter.activeDate === "Today" || filter.activeDate === "Custom")
                            ? idx + 1
                            : (filter.page - 1) * filter.limit + idx + 1}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium text-slate-900">{b.mrn}</div>
                        </TableCell>
                        <TableCell className="py-3 text-slate-600 whitespace-nowrap">{fDateandTime(b.createdAt)}</TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium truncate text-slate-900">{b.patient?.name || "Unknown"}</div>
                          <div className="text-[11px] text-slate-500">
                            {b.patient?.mrn || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right tabular-nums text-emerald-600 font-medium">
                          {formatINR((b.cash || 0) + (b.online || 0) + (b.insurance || 0))}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4 tabular-nums font-medium text-slate-900">
                          {formatINR(b.items?.reduce((a, b) => a + (b.total || 0), 0) || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {billing.length > 0 && (
                  <TableFooter className="sticky bottom-0 z-10 bg-emerald-50 font-extrabold text-[15px] text-slate-900 border-t-2 border-slate-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <TableRow className="hover:bg-emerald-50 bg-emerald-50">
                      <TableCell colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider text-sm font-black text-slate-800">
                        Total
                      </TableCell>
                      <TableCell className="py-4 text-right tabular-nums text-emerald-700 font-black">
                        {formatINR(billing.reduce((acc, b) => b.transactionType === "Return" ? acc - (b.cash || 0) : acc + (b.insurance || 0) + (b.cash || 0) + (b.online || 0), 0))}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-4 tabular-nums text-slate-900 font-black">
                        {formatINR(billing.reduce((acc, b) => acc + (b.transactionType === "Return" ? 0 : b.items?.reduce((a, x) => a + (x.total || 0), 0) || 0), 0) - billing.reduce((acc, b) => acc + (b.transactionType === "Sale" ? 0 : b.items?.reduce((a, x) => a + (x.total || 0), 0) || 0), 0))}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </div>
          
          {(filter.activeDate !== "Today" && filter.activeDate !== "Custom") && billing.length > filter.limit && (
            <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
              <PaginationBar
                page={filter.page}
                limit={filter.limit}
                total={billing.length}
                setFilter={setFilter}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
