import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { Eye } from "lucide-react";
import React from "react";
import { PurchaseType } from "./interface";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";


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
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.mrn}</TableCell>
                  <TableCell>{row.wholesaler.name}</TableCell>
                  <TableCell>{fDateandTime(row.createdAt)}</TableCell>
                  <TableCell>{fDate(row.expectedDelivery)}</TableCell>
                  <TableCell className="text-right">
                    {formatINR(row.items.reduce((a,b)=>a+b.quantity*b.unitPrice,0)+row.shipping)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`rounded-full text-[11px] border bg-amber-200 text-amber-700 font-bold`}
                    >
                      {/* {row.status} */}
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-lg text-xs"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
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
