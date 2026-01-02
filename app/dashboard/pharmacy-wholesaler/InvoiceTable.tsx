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
import React from "react";
import { PurchaseType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";

interface PropType {
  purchase: PurchaseType[];
}

export default function InvoiceTable({ purchase }: PropType) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-zinc-900">
            Recent Invoices / Payments
          </CardTitle>
          <CardDescription className="text-[12px] text-zinc-500">
            Latest bills sent to retailers
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
                Invoice
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">
                Retailer
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">
                Status
              </TableHead>
              <TableHead className="text-zinc-700 font-medium">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase?.map((row, i) => (
              <TableRow key={i} className="border-zinc-100 hover:bg-zinc-50/50">
                <TableCell className="py-3 align-top text-zinc-800 font-medium">
                  {row.mrn}
                </TableCell>
                <TableCell className="py-3 align-top text-zinc-600">
                  {row.pharmacy.name}
                </TableCell>
                <TableCell className="py-3 align-top">
                  <Badge
                    className={`border bg-red-400 rounded-full text-[10px] font-medium px-2 py-0.5`}
                  >
                    {"Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 align-top text-zinc-600 text-sm">
                  {fDate(
                    new Date(
                      new Date(row.createdAt).getTime() +
                      10 * 24 * 60 * 60 * 1000
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
