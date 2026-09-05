"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import useSWR from "swr";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

export interface FilterType {
  q: null | string;
  status: string;
  method: string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  dateRange?: DateRange;
  date?: Date;
  page?: number;
  limit?: number;
}

export default function BillingPage() {
  const [tab, setTab] = useState<"all" | "new">("all");
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    status: "all",
    method: "all",
    activeDate: "Today",
    dateRange: { from: new Date(), to: new Date() },
    date: new Date(),
    page: 1,
    limit: 100,
  });

  const params = new URLSearchParams();

  if (filter.q && filter.q.trim()) {
    params.set("q", filter.q.trim());
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
  params.set("limit", "1000");

  const { data: billingData, mutate: billingMutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      card: number;
      upi: number;
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
        <div>
          <div className="mb-4">
            <LabHeader
              title="Billing"
              subtitle="Search, filter & review billing history"
            />
          </div>

          <Tabs
            defaultValue="all"
            className="flex-1 overflow-hidden"
            onValueChange={(e) => setTab(e as "all" | "new")}
            value={tab}
          >
            <AnimatedTabs
              options={[
                { label: "All Bills", value: "all" },
                { label: "Create Bill", value: "new" },
              ]}
              value={tab}
              onChange={(v) => setTab(v as "all" | "new")}
              layoutId="billing-tabs"
              className="mb-4"
            />
            <TabsContent value="all">
              <AllBill
                billing={billing}
                filter={filter}
                setFilter={setFilter}
                billingMutate={billingMutate}
              />
            </TabsContent>
            <TabsContent value="new">
              <CreateBill billingMutate={billingMutate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
