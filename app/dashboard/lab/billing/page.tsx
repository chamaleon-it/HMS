"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import useSWR from "swr";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { Info } from "lucide-react";
import Link from "next/link";

export interface FilterType {
  q: null | string;
  status: string;
  method: string;
  date: undefined | Date;
}

export default function BillingPage() {
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    status: "",
    method: "",
    date: undefined,
  });

  const params = new URLSearchParams();

  if (filter.q) {
    params.set("q", filter.q);
  }

  if (filter.status !== "all") {
    params.set("status", filter.status);
  }

  if (filter.method !== "all") {
    params.set("method", filter.method);
  }
  if (filter.date) {
    params.set("date", filter.date.toISOString());
  }

  const { data: billingData, mutate: billingMutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      discount: number;
      items: {
        total: number;
      }[];
      patient: {
        name: string;
        mrn: string;
      };
    }[];
  }>(`/billing?${params.toString()}`);

  const billing = billingData?.data ?? [];

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100">
        <div className="">
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Billing is centralised at the pharmacy counter. New invoices and
              payments must be raised from{" "}
              <Link
                href="/dashboard/pharmacy/billing/"
                className="font-semibold underline"
              >
                Pharmacy Billing
              </Link>
              . This view is history and reprints only — create-bill is disabled
              here.
            </p>
          </div>

          <div className="mb-4">
            <LabHeader
              title="Billing"
              subtitle="Search, filter & reprint lab bill history"
            />
          </div>

          <AllBill
            billing={billing}
            filter={filter}
            setFilter={setFilter}
            billingMutate={billingMutate}
          />
        </div>
      </div>
    </AppShell>
  );
}
