"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorHeader from "../components/DoctorHeader";
import useSWR from "swr";
import { Plus, ReceiptText, PlusSquare } from "lucide-react";
import { motion } from "framer-motion";

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
      roundOff: boolean
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

  const tabs = [
    { key: "all", label: "All Bills", icon: ReceiptText },
    { key: "new", label: "Create Bill", icon: PlusSquare },
  ];

  return (
    <AppShell>
      <div
        className="min-h-[calc(100vh-80px)] w-full p-5 text-slate-900 dark:text-slate-100 space-y-5"
      >
        <div className="space-y-5">
          <DoctorHeader
            title="Billing"
            subtitle="Search, filter & review billing history"
          >
            <PrimaryButton onClick={() => setTab("new")}>
              <Plus className="mr-2 inline h-4 w-4" /> New Invoice
            </PrimaryButton>
          </DoctorHeader>

          <Tabs
            defaultValue="all"
            className="flex-1 overflow-hidden"
            onValueChange={(e) => setTab(e as "all" | "new")}
            value={tab}
          >
            <div className="mb-4 relative inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 w-fit">
              {tabs.map(({ key, label, icon: Icon }) => {
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
                        layoutId="tab-indicator"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg,#4f46e5,#d946ef)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
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

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className} cursor-pointer flex items-center justify-center`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
