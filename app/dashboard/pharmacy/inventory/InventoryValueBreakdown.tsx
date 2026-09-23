"use client";

import React from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { Wallet } from "lucide-react";

interface CategoryRow {
  category: string;
  itemCount: number;
  quantity: number;
  sellingValue: number;
  purchaseValue: number;
  mrpValue: number;
}

interface Breakdown {
  totals: {
    sellingValue: number;
    purchaseValue: number;
    mrpValue: number;
    totalQuantity: number;
    totalItems: number;
  };
  byCategory: CategoryRow[];
  topItems: {
    id: string;
    name: string;
    sku?: string;
    category?: string;
    quantity: number;
    sellingValue: number;
    purchaseValue: number;
    mrpValue: number;
  }[];
}

export default function InventoryValueBreakdown({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useSWR<{ message: string; data: Breakdown }>(
    open ? "/pharmacy/items/stats/breakdown" : null
  );

  const breakdown = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </span>
            Inventory Value Breakdown
          </DialogTitle>
          <DialogDescription>
            Stock on hand valued at purchase rate, selling price and MRP.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {breakdown && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryTile
                label="Purchase Value"
                value={formatINR(breakdown.totals.purchaseValue)}
                tone="bg-sky-50 text-sky-800 border-sky-200"
              />
              <SummaryTile
                label="Selling Value"
                value={formatINR(breakdown.totals.sellingValue)}
                tone="bg-emerald-50 text-emerald-800 border-emerald-200"
              />
              <SummaryTile
                label="MRP Value"
                value={formatINR(breakdown.totals.mrpValue)}
                tone="bg-indigo-50 text-indigo-800 border-indigo-200"
              />
            </div>

            <p className="text-xs text-slate-500">
              {breakdown.totals.totalQuantity} units across{" "}
              {breakdown.totals.totalItems} items.
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Category
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Items
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Qty
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Purchase
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Selling
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      MRP
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.byCategory.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium text-slate-800">
                        {row.category}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.itemCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatINR(row.purchaseValue)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatINR(row.sellingValue)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatINR(row.mrpValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {breakdown.byCategory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No stock to value.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {breakdown.byCategory.length > 0 && (
                  <TableFooter className="bg-slate-100">
                    <TableRow>
                      <TableCell className="font-bold uppercase tracking-wider text-slate-700">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {breakdown.totals.totalItems}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {breakdown.totals.totalQuantity}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {formatINR(breakdown.totals.purchaseValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {formatINR(breakdown.totals.sellingValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {formatINR(breakdown.totals.mrpValue)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>

            {breakdown.topItems.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Highest stock holdings
                </p>
                <div className="flex flex-wrap gap-2">
                  {breakdown.topItems.slice(0, 12).map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                      title={`${item.quantity} units · ${formatINR(item.sellingValue)}`}
                    >
                      {item.name}
                      <span className="ml-1 text-slate-400">
                        ({item.quantity})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
