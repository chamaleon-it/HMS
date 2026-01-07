"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./Header";
import useSWR from "swr";

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
        className="min-h-[calc(100vh-80px)] w-full p-5 text-slate-900 dark:text-slate-100"

      >
        <div className="">
          <Header setTab={setTab} />

          <Tabs
            defaultValue="all"
            className="flex-1 overflow-hidden"
            onValueChange={(e) => setTab(e as "all" | "new")}
            value={tab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="cursor-pointer">
                All Bills
              </TabsTrigger>
              <TabsTrigger value="new" className="cursor-pointer">
                Create Bill
              </TabsTrigger>
            </TabsList>
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
