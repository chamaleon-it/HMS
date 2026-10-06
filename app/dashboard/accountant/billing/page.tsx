"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";

import AdminHeader from "../components/AdminHeader";
import useSWR from "swr";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import Filters from "./components/Filter";
import { endOfDay, startOfDay, subDays } from "date-fns";
import Statistics from "./components/Statistics";
import AllBill from "./components/AllBill";
import { DateRange } from "react-day-picker";
import type { PatientVisitorFilter } from "@/components/dashboard/billing/PatientModeToggle";
import { getStoredPatientVisitorFilter } from "@/components/dashboard/billing/PatientModeToggle";
import { billMatchesDoctor } from "./doctorFilter";
import {
  matchesAccountantStatus,
  matchesAccountantTherapist,
  matchesAccountantType,
} from "./accountantBilling";
import BillingToolbar from "./components/BillingToolbar";

export interface FilterType {
  q: null | string;
  status: string;
  method: string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  dateRange?: DateRange;
  date?: Date;
  page: number;
  limit: number;
  doctor: string[];
  therapist: string;
  billType: string;
  patientVisitor: PatientVisitorFilter;
}

export default function AdminBillingPage() {
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    status: "",
    method: "",
    activeDate: "Today",
    dateRange: { from: new Date(), to: new Date() },
    date: new Date(),
    page: 1,
    limit: 10,
    doctor: [],
    therapist: "",
    billType: "all",
    patientVisitor: "all",
  });

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      patientVisitor: getStoredPatientVisitorFilter(),
    }));
  }, []);

  const params = new URLSearchParams();

  if (filter.q && filter.q.trim()) {
    params.set("q", filter.q.trim());
  }

  if (filter.method && filter.method !== "all") {
    params.set("method", filter.method);
  }

  if (filter.patientVisitor && filter.patientVisitor !== "all") {
    params.set("patientVisitor", filter.patientVisitor);
  }

  let sd: Date = startOfDay(new Date());
  let ed: Date = endOfDay(new Date());

  if (filter.activeDate === "Today") {
    sd = startOfDay(new Date());
    ed = endOfDay(new Date());
  } else if (filter.activeDate === "7 days") {
    sd = startOfDay(subDays(new Date(), 7));
    ed = endOfDay(new Date());
  } else if (filter.activeDate === "30 days") {
    sd = startOfDay(subDays(new Date(), 30));
    ed = endOfDay(new Date());
  } else if (filter.activeDate === "Custom") {
    const from = filter.dateRange?.from || filter.date || new Date();
    const to = filter.dateRange?.to || from;
    sd = startOfDay(from);
    ed = endOfDay(to);
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
      transactionType: "Return" | "Sale" | "Refund";
      doctor: string | any;
      therapistName?: string;
      note?: string;
    }[];
  }>(`/admin/billing?${params.toString()}`);

  const allBilling = billingData?.data ?? [];
  const billing = useMemo(() => {
    return allBilling.filter((b) =>
      billMatchesDoctor(b.doctor, filter.doctor) &&
      matchesAccountantTherapist(b, filter.therapist) &&
      matchesAccountantType(b, filter.billType) &&
      matchesAccountantStatus(b, filter.status)
    );
  }, [allBilling, filter.doctor, filter.therapist, filter.billType, filter.status]);

  const total = billingData?.total ?? 0;

  return (
    <AppShell>
      <TooltipProvider>
        <div className="min-h-[calc(100vh-67px)] w-full p-6 text-slate-900 dark:text-slate-100">
          <div className="flex flex-col gap-6">
            <AdminHeader
              title="Billing Management"
              subtitle="View and manage hospital-wide billing and collections."
            >
              <BillingToolbar filter={filter} setFilter={setFilter} billing={allBilling} />
            </AdminHeader>

            <div className="flex-1 overflow-hidden mt-0">
              <Statistics billing={billing} />
              <Filters filter={filter} setFilter={setFilter} billing={allBilling} />

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
