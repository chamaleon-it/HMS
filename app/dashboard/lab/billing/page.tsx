"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import useSWR from "swr";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import LabHeader from "@/components/dashboard/lab/LabHeader";
import { FilePlus2 } from "lucide-react";

export interface FilterType {
  q: null | string;
  status: string;
  method: string;
  date: undefined | Date
}

export default function BillingPage() {
  const [tab, setTab] = useState<"all" | "new">("all");
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    status: "",
    method: "",
    date: undefined
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
    params.set("date", filter.date.toISOString())
  }

  const { data: billingData, mutate: billingMutate } = useSWR<{
    message: string;
    data: {
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      insurance: number;
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
      <div
        className="min-h-[calc(100vh-67px)] w-full p-5 text-slate-900 dark:text-slate-100"

      >
        <div className="">
          <div className="mb-4">
            <LabHeader
              title="Billing"
              subtitle="Search, filter & review billing history"
            >
              <button
                onClick={() => setTab("new")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95"
              >
                <FilePlus2 className="h-4 w-4" /> New Invoice
              </button>
            </LabHeader>
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
