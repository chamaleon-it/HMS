"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import useSWR from "swr";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";
import DateFilter from "@/app/dashboard/pharmacy/DateFilter";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
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
import { PaginationBar } from "@/app/dashboard/pharmacy/components/PaginationBar";
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

export default function AdminLabRegisterPage() {
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

  const { data: billingData, isLoading, mutate } = useSWR<{
    message: string;
    total: number;
    data: {
      roundOff: boolean;
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      insurance: number;
      discount: number;
      items: {
        name: string;
        total: number;
        quantity: number;
        unitPrice: number;
        gst: number;
      }[];
      patient: {
        name: string;
        mrn: string;
        age: number;
        gender: string;
      };
      transactionType: "Return" | "Sale";
      doctor: string;
    }[];
  }>(`/billing/lab/register?${params.toString()}`);

  const billing = billingData?.data ?? [];
  const total = billingData?.total ?? 0;

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900">
        <LabHeader
          title="Lab Register"
          subtitle="Record and review laboratory specimens, investigations, and patient billing entries"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            className="gap-2 cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </LabHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border shadow-xs">
            <DateFilter
              activeDate={filter.activeDate}
              setActiveDate={(activeDate) =>
                setFilter((prev) => ({ ...prev, activeDate, page: 1 }))
              }
              date={filter.date}
              setDate={(date) => setFilter((prev) => ({ ...prev, date, page: 1 }))}
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filter by Patient MRN..."
                  value={filter.q || ""}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      q: e.target.value || null,
                      page: 1,
                    }))
                  }
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-slate-700 hover:bg-slate-700">
                <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 px-4 pl-4">
                    Sl No
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                    Bill No
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                    Patient Details
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                    Referred Doctor
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5">
                    Tests Ordered
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                    Cash
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                    Online
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right">
                    Insurance
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] uppercase tracking-wider py-2.5 text-right pr-4">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-[14px]">
                {isLoading ? (
                  <TableSkeleton rows={10} columns={10} />
                ) : billing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-slate-400">
                      No lab register entries found for selected duration.
                    </TableCell>
                  </TableRow>
                ) : (
                  billing.map((item, idx) => {
                    const totalAmt =
                      (item.cash || 0) + (item.online || 0) + (item.insurance || 0);

                    return (
                      <TableRow
                        key={item._id}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <TableCell className="py-2.5 pl-4 text-slate-500 font-mono text-xs">
                          {(filter.page - 1) * filter.limit + idx + 1}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-slate-500">
                          {fDateandTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="py-2.5 font-mono font-medium text-slate-900">
                          {item.mrn}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <p className="font-semibold text-slate-900">
                            {item.patient?.name || "Walk-in Patient"}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            MRN: {item.patient?.mrn || "N/A"}
                          </p>
                        </TableCell>
                        <TableCell className="py-2.5 text-slate-700 text-xs font-medium">
                          {item.doctor || "Self"}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-slate-600">
                          <div className="max-w-[220px] truncate" title={item.items?.map((i) => i.name).join(", ")}>
                            {item.items?.map((i) => i.name).join(", ") || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium text-slate-700">
                          {item.cash ? formatINR(item.cash) : "-"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium text-slate-700">
                          {item.online ? formatINR(item.online) : "-"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium text-slate-700">
                          {item.insurance ? formatINR(item.insurance) : "-"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-bold text-slate-900 pr-4">
                          {formatINR(totalAmt)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <PaginationBar
              page={filter.page}
              limit={filter.limit}
              total={total}
              setFilter={setFilter}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
