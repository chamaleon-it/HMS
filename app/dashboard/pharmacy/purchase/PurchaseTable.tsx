import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { PurchaseType } from "./interface";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import ViewOrders from "./ViewOrders";


interface Props {
  purchase: PurchaseType[],
  total: number
}

export default function PurchaseTable({ purchase, total }: Props) {
  return (

    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
      <div className="overflow-x-auto">
        <Table className="text-sm">
          <TableHeader className="bg-slate-700 hover:bg-slate-700">
            <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
              <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 pl-4">PO #</TableHead>
              <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Supplier</TableHead>
              <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Created</TableHead>
              <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Expected</TableHead>
              <TableHead className="text-center text-white font-bold text-[11px] uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.map((row, i) => (
              <TableRow
                className={
                  i % 2 === 0
                    ? "bg-white hover:bg-white/60"
                    : "bg-slate-100 hover:bg-slate-100/60"
                }
                key={i}>
                <TableCell className="py-3 pl-4 font-medium text-slate-900">{row.mrn}</TableCell>
                <TableCell className="py-3 text-slate-700">{row.wholesaler.name}</TableCell>
                <TableCell className="py-3 text-slate-600">{fDateandTime(row.createdAt)}</TableCell>
                <TableCell className="py-3 text-slate-600">{fDate(row.expectedDelivery)}</TableCell>
                <TableCell className="text-center py-3">
                  <Badge
                    className={`rounded-full text-[10px] border bg-amber-50 text-amber-700 border-amber-200 font-bold px-2 py-0.5`}
                  >
                    {/* {row.status} */}
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3 pr-4">
                  <ViewOrders row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

  );
}
