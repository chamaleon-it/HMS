"use client";

import React, { useEffect, useState } from "react";
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
      roundOff: boolean;
      _id: string;
      mrn: string;
      createdAt: Date;
      cash: number;
      online: number;
      insurance: number;
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

  const { data } = useSWR<{
    message: string,
    data: {
      pharmacy: {
        billing: {
          autoPrintAfterSave: boolean,
          defaultGst?: number | undefined,
          roundOff: boolean,
          prefix: string
        }
      }
    }
  }>("/users/profile")

  const pharmacyBilling = data?.data.pharmacy.billing ?? {
    autoPrintAfterSave: false,
    roundOff: false,
    prefix: "INV"
  }



  useEffect(() => {
    window.location.hash.includes("new") && setTab("new")
  }, [])


  return (
    <AppShell>
      <div
        className="min-h-[calc(100vh-80px)] w-full p-5 text-slate-900 dark:text-slate-100"
        style={
          {
            background:
              "radial-gradient(110% 80% at 0% 0%, rgba(79,70,229,0.08), transparent 60%), radial-gradient(110% 80% at 100% 100%, rgba(236,72,153,0.08), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
          } as React.CSSProperties
        }
      >
        <div className="">
          <Header setTab={setTab} />

          <Tabs
            defaultValue="all"
            className="flex-1 overflow-hidden"
            onValueChange={(e) => setTab(e as "all" | "new")}
            value={tab}
          >
            <TabsList className="mb-4 print:hidden">
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
              <CreateBill billingMutate={billingMutate} pharmacyBilling={pharmacyBilling} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
