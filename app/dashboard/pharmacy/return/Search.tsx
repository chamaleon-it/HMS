import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/fNumber";
import React from "react";
import { OrderType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";

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
      <Card className="xl:col-span-1 shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <span>Find Bill / Patient</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search invoice no. "
                className="pl-9 text-sm h-9 rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={filter.q ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, q: e.target.value }))
                }
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
            </div>
            <Button
              className="h-9 rounded-lg bg-slate-900 text-white hover:bg-slate-800 px-3 text-xs font-medium"
              onClick={fetchOrder}
            >
              Load
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
        </CardContent>
      </Card>

      {/* RIGHT: BILL SUMMARY */}
      <Card className="xl:col-span-2 shadow-sm border-slate-200">
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-[11px] text-slate-600">
          <div className="flex flex-col">
            <span className="uppercase tracking-wide">Patient</span>
            <span className="text-slate-900 font-medium text-sm leading-tight">
              {order?.patient.name}
            </span>
            <span className="text-[10px] text-slate-400">
              PID: {order?.patient.mrn}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="uppercase tracking-wide">Doctor</span>
            <span className="text-slate-900 font-medium text-sm leading-tight">
              Dr. {order?.doctor.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {order?.doctor.specialization}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="uppercase tracking-wide">Payment Mode</span>
            <span className="text-slate-900 font-medium text-sm leading-tight">
              UPI
            </span>
            <span className="text-[10px] text-slate-400">Txn: TXN284712</span>
          </div>
          <div className="flex flex-col">
            <span className="uppercase tracking-wide">Invoice Total</span>
            <span className="text-slate-900 font-semibold text-base leading-tight">
              {formatINR(
                order?.items.reduce((a, b) => a + b.name.unitPrice * b.quantity, 0) ?? 0
              )}
            </span>
            <span className="text-[10px] text-slate-400">incl. GST</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
