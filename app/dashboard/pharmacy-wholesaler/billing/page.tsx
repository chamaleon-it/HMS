"use client";

import React from "react";

import {
  FilePlus2,
  FileText,
  Wallet2,
  RefreshCcw,
} from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import AllBill from "./AllBill";
import CreateBill from "./CreateBill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};



// ========== Small UI Primitives ==========
const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className}`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);


// ========== Component ==========
export default function BillingPage() {



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

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-gray-500">Search, filter & review billing history</p>
        </div>
            <div className="flex flex-wrap items-center gap-2">
              <PrimaryButton>
                <FilePlus2 className="mr-2 inline h-4 w-4" /> New Invoice
              </PrimaryButton>
              <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110">
                <Wallet2 className="mr-2 inline h-4 w-4" /> Collect Payment
              </button>
              <button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
                <RefreshCcw className="mr-2 inline h-4 w-4" /> Refund
              </button>
              <button className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300">
                <FileText className="mr-2 inline h-4 w-4" /> Reports
              </button>
            </div>
          </div>

          {/* Tabs */}


<Tabs defaultValue="all" className="flex-1 overflow-hidden">
  <TabsList className="mb-4">
            <TabsTrigger value="all" className="cursor-pointer">All Bills</TabsTrigger>
            <TabsTrigger value="new" className="cursor-pointer">Create Bill</TabsTrigger>
            
          </TabsList>
          <TabsContent value="all">
            <AllBill/>
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
