"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";

import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import Filters from "./components/Filter";
import { endOfDay, startOfDay, subDays } from "date-fns";
import Statistics from "./components/Statistics";
import AllBill from "./components/AllBill";

export interface FilterType {
  q: null | string;
  qEnd: null | string;
  status: string;
  method: string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  date: Date;
  page: number;
  limit: number;
  doctor: string[];
}

export default function AdminBillingPage() {
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    qEnd: null,
    status: "",
    method: "",
    activeDate: "Today",
    date: new Date(),
    page: 1,
    limit: 10,
    doctor: []
  });

  const params = new URLSearchParams();

  if (filter.q) {
    params.set("q", filter.q);
  }

  if (filter.qEnd && filter.qEnd.length >= 7) {
    params.set("qEnd", filter.qEnd);
  }

  if (filter.status && filter.status !== "all") {
    params.set("status", filter.status);
  }

  if (filter.method && filter.method !== "all") {
    params.set("method", filter.method);
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

  const { data: billingData, mutate: billingMutate, isLoading: isLoadingBilling } = useSWR<{
    message: string;
    total: number;
    data: {
      roundOff: boolean;
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      card: number;
      upi: number;
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
      };
      transactionType: "Return" | "Sale"
      doctor: string | any
    }[];
  }>(`/admin/billing?${params.toString()}`);

  const allBilling = billingData?.data ?? [];
  const billing = useMemo(() => {
    if (filter.doctor.length === 0) return allBilling;
    return allBilling.filter(b => {
      const docName = typeof b.doctor === 'object' ? b.doctor?.name : b.doctor;
      return filter.doctor.includes(docName);
    });
  }, [allBilling, filter.doctor]);

  const total = billingData?.total ?? 0;

  return (
    <AppShell>
      <TooltipProvider>
        <div className="min-h-[calc(100vh-67px)] w-full p-6 text-slate-900 dark:text-slate-100">
          <div className="flex flex-col gap-6">
            <AdminHeader 
                title="Billing Management" 
                subtitle="View and manage hospital-wide billing and collections."
            />

            <div className="flex-1 overflow-hidden mt-0">
              <Statistics billing={billing} />
              <Filters filter={filter} setFilter={setFilter} />
              
              {isLoadingBilling ? (
                <TableSkeleton rows={10} columns={6} />
              ) : (
                <AllBill
                  billing={billing}
                  filter={filter}
                  setFilter={setFilter}
                  total={total}
                  billingMutate={billingMutate}
                />
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
