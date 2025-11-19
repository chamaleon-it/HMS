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
    total:number
}

export default function PurchaseTable({purchase,total}:Props) {
  return (
    <Card className="rounded-2xl shadow-sm border-border/60">
      <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <CardTitle className="text-base font-medium">
          All Purchase Orders
        </CardTitle>
        <div className="text-xs text-muted-foreground">{total} orders found</div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-x-auto">
          <Table className="min-w-[900px] text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow className="bg-slate-700 hover:bg-slate-700 text-white">
                <TableHead className="text-white">PO #</TableHead>
                <TableHead className="text-white">Supplier</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Expected</TableHead>
                <TableHead className="text-center text-white">Status</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.mrn}</TableCell>
                  <TableCell>{row.wholesaler.name}</TableCell>
                  <TableCell>{fDateandTime(row.createdAt)}</TableCell>
                  <TableCell>{fDate(row.expectedDelivery)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`rounded-full text-[11px] border bg-amber-200 text-amber-700 font-bold`}
                    >
                      {/* {row.status} */}
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ViewOrders row={row}/>
                    
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
