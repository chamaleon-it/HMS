import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/fNumber";
import React from "react";
import { OrderType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { Search as SearchIcon, User, Stethoscope, CreditCard, ReceiptIndianRupee, Download } from "lucide-react";

interface Props {
  filter: {
    q: string | null;
  };
  setFilter: React.Dispatch<
    React.SetStateAction<{
      q: null | string;
    }>
  >;

  fetchOrder: () => Promise<void>;

  order: OrderType | null;
}

export default function Search({
  fetchOrder,
  filter,
  setFilter,
  order,
}: Props) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* LEFT: SEARCH BOX */}
      <div className="xl:col-span-1 bg-white border rounded-2xl p-4 shadow-sm shadow-slate-100 flex flex-col gap-3">
        <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <span>Find Bill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search invoice no. "
              className="pl-9 text-sm h-9 rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              value={filter.q ?? ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, q: e.target.value.trim() }))
              }
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
          </div>
          <Button
            className="h-9 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 text-xs font-medium shadow-md flex items-center gap-2 transition-all active:scale-95"
            onClick={fetchOrder}
          >
            <Download className="w-3.5 h-3.5" />
            Load Order
          </Button>
        </div>
        {Boolean(order) && (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex flex-col">
              <span className="uppercase tracking-wide">Invoice No</span>
              <span className="text-slate-900 font-medium text-xs">
                {order?.mrn}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="uppercase tracking-wide">Invoice Date</span>
              <span className="text-slate-900 font-medium text-xs">
                {fDate(order?.createdAt)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: BILL SUMMARY */}
      <div className="xl:col-span-2 bg-white border rounded-2xl p-4 shadow-sm shadow-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-slate-600">
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <User className="w-3 h-3 text-blue-500" /> Patient
          </span>
          <span className="text-blue-700 font-semibold text-sm leading-tight mt-1">
            {order?.patient.name}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            PID: {order?.patient.mrn}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <Stethoscope className="w-3 h-3 text-purple-500" /> Doctor
          </span>
          <span className="text-slate-900 font-medium text-sm leading-tight mt-1">
            Dr. {order?.doctor.name}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {order?.doctor.specialization}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <CreditCard className="w-3 h-3 text-orange-500" /> Payment
          </span>
          <span className="text-slate-900 font-medium text-sm leading-tight mt-1">
            UPI
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uppercase tracking-wide flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <ReceiptIndianRupee className="w-3 h-3 text-emerald-500" /> Total
          </span>
          <span className="text-emerald-700 font-bold text-lg leading-tight mt-1">
            {formatINR(
              order?.items.reduce((a, b) => a + b.name.unitPrice * b.quantity, 0) ?? 0
            )}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">incl. GST</span>
        </div>
      </div>
    </section >
  );
}
