import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import React from "react";
import { PurchaseType } from "./interface";

interface PropType {
  purchase: PurchaseType[];
}

export default function PurchaseTable({ purchase }: PropType) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-zinc-900">
            Orders
          </CardTitle>
          <CardDescription className="text-[12px] text-zinc-500">
            Orders packed / waiting for pickup
          </CardDescription>
        </div>

        <Button
          variant="outline"
          className="rounded-xl h-9 border-zinc-200 text-[13px] font-medium text-zinc-700 bg-white hover:bg-zinc-50"
        >
          View all
        </Button>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="border-zinc-200 bg-zinc-50/80">
              <TableHead className="text-zinc-700 font-medium">
                Retailer
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">
                Order ID
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">Items</TableHead>
              <TableHead className="text-zinc-700 font-medium">Total</TableHead>
              <TableHead className="text-zinc-700 font-medium">
                Status
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">
                Priority
              </TableHead>
              <TableHead className="text-right text-zinc-700 font-medium pr-4">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.map((row, i) => (
              <TableRow key={i} className="border-zinc-100 hover:bg-zinc-50/50">
                <TableCell className="py-3 align-top text-zinc-800 font-medium">
                  {row.pharmacy.name}
                </TableCell>
                <TableCell className="py-3 align-top text-zinc-600 font-medium">
                  {row.mrn}
                </TableCell>
                <TableCell className="py-3 align-top text-zinc-600">
                  {row.items.length}
                </TableCell>
                <TableCell className="py-3 align-top text-zinc-800 font-semibold">
                  {formatINR(
                    row.items.reduce((a, b) => a + b.quantity * b.unitPrice, 0)
                  )}
                </TableCell>
                <TableCell className="py-3 align-top">
                  <Badge
                    className={`border bg-amber-200 text-amber-700 rounded-full text-[10px] font-medium px-2 py-0.5`}
                  >
                    Pending
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.urgent ? "destructive" : "secondary"}>
                    {row.urgent ? "Urgent" : "Normal"}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 align-top text-right pr-4">
                  <div className="relative inline-flex gap-2">
                    <Button className="rounded-lg h-8 px-2 text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                      Print Invoice
                    </Button>
                    <Button className="rounded-lg h-8 px-2 text-[12px] font-medium border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50">
                      Mark Shipped
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
