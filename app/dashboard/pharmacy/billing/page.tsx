"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./Header";
import useSWR from "swr";
import { BillingFormSkeleton, TableSkeleton } from "../components/PharmacySkeleton";
import { ReceiptIndianRupee, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

export interface FilterType {
  q: null | string;
  status: string;
  method: string;
  date: undefined | Date;
  page: number;
  limit: number;
}

export default function BillingPage() {
  const [tab, setTab] = useState<"all" | "new">("all");
  const [filter, setFilter] = useState<FilterType>({
    q: null,
    status: "",
    method: "",
    date: undefined,
    page: 1,
    limit: 10,
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
      <div
        className="min-h-[calc(100vh-80px)] w-full p-5 text-slate-900 dark:text-slate-100"
      >
        <div className="flex flex-col gap-6">
          <Header setTab={setTab} filter={filter} setFilter={setFilter} />

          <Tabs
            defaultValue="all"
            className="flex-1 overflow-hidden"
            onValueChange={(e) => setTab(e as "all" | "new")}
            value={tab}
          >
            <div className="relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 print:hidden w-fit">
              {[
                { key: "all", label: "All Bills", icon: ReceiptIndianRupee },
                { key: "new", label: "Create Bill", icon: PlusCircle },
              ].map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key as "all" | "new")}
                    className={
                      "relative flex items-center gap-2 rounded-full px-4 py-2 transition will-change-transform cursor-pointer " +
                      (active ? "text-white" : "text-gray-700")
                    }
                    type="button"
                  >
                    {active && (
                      <motion.span
                        layoutId="billing-tab-indicator-1"
                        className="absolute inset-0 rounded-full"
                        style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} /> {label}
                    </span>
                  </button>
                );
              })}
            </div>
            <TabsContent value="all">
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
    </AppShell>
  );
}
