import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fDate } from "@/lib/fDateAndTime";
import { PlusCircle, Search } from "lucide-react";
import React from "react";

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="uppercase tracking-wide">Wholesaler</span>
          <span className="text-zinc-400">/</span>
          <span className="uppercase tracking-wide text-zinc-700">
            Dashboard
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900">
            Pharmacy Wholesale Overview
          </h1>
        </div>

        <div className="text-[12px] text-zinc-500">
          {fDate(new Date())} · GSTIN: 32ABCDE1234F1Z5
        </div>
      </div>

      <div className="flex-1 flex flex-col-reverse sm:flex-row sm:items-start justify-end gap-3 md:max-w-xl md:ml-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search products, retailers, invoices..."
            className="pl-9 text-sm bg-white/70 backdrop-blur border-zinc-200 shadow-sm rounded-xl h-10"
          />
        </div>

        <Button className="rounded-xl h-10 px-3 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm text-[13px] font-semibold whitespace-nowrap flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </Button>
      </div>
    </header>
  );
}
