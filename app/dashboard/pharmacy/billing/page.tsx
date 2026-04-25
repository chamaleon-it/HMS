"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./Header";
import useSWR from "swr";
import { BillingFormSkeleton, TableSkeleton } from "../components/PharmacySkeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReceiptIndianRupee, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Filters from "./Filter";
import { endOfDay, startOfDay, subDays } from "date-fns";

export interface FilterType {
  q: null | string;
  qEnd: null | string;
  status: string;
  method: string;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  date: Date;
  page: number;
  limit: number;
}

export default function BillingPage() {
  const [tab, setTab] = useState<"all" | "new">("all");
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    qEnd: null,
    status: "",
    method: "",
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

  if (filter.status !== "all") {
    params.set("status", filter.status);
  }

  if (filter.method !== "all") {
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
      };
    }[];
  }>(`/billing?${params.toString()}`);

  const billing = billingData?.data ?? [];
  const total = billingData?.total ?? 0;

  const { data, isLoading: isLoadingProfile } = useSWR<{
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
      <TooltipProvider>
        <div
          className="min-h-[calc(100vh-80px)] w-full p-5 text-slate-900 dark:text-slate-100"
        >
          <div className="flex flex-col gap-5">
            <Header tab={tab} setTab={setTab} filter={filter} setFilter={setFilter} />

            <Tabs
              defaultValue="all"
              className="flex-1 overflow-hidden"
              onValueChange={(e) => setTab(e as "all" | "new")}
              value={tab}
            >
              <TabsContent value="all">
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
              </TabsContent>
              <TabsContent value="new">
                {isLoadingProfile ? (
                  <BillingFormSkeleton />
                ) : (
                  <CreateBill billingMutate={billingMutate} pharmacyBilling={pharmacyBilling} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
