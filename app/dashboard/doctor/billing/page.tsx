"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./Header";
import useSWR from "swr";

export default function BillingPage() {
  const [tab, setTab] = useState<"all" | "new">("all");

  const { data: billingData } = useSWR<{
    message: string;
    data: {
      _id: string;
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
  }>("/billing");

  const billing = billingData?.data ?? [];

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
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="cursor-pointer">
                All Bills
              </TabsTrigger>
              <TabsTrigger value="new" className="cursor-pointer">
                Create Bill
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <AllBill billing={billing} />
            </TabsContent>
            <TabsContent value="new">
              <CreateBill />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
