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

export default function LowStock() {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-zinc-900">
            Low Stock / Reorder
          </CardTitle>
          <CardDescription className="text-[12px] text-zinc-500">
            These SKUs will run out soon
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
              <TableHead className="text-zinc-700 font-medium">Item</TableHead>
              <TableHead className="text-zinc-700 font-medium">Qty</TableHead>
              <TableHead className="text-right text-zinc-700 font-medium pr-4">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {[]?.map((row: Record<string, string | number>, i) => (
              <TableRow key={i} className="border-zinc-100 hover:bg-zinc-50/50">
                <TableCell className="py-3 align-top text-zinc-800 font-medium">
                  <div className="leading-tight">
                    <div>{row.name}</div>
                    <div className="text-[11px] text-zinc-500 font-normal">
                      {row.gen}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 align-top text-zinc-800 font-semibold whitespace-nowrap">
                  <div className="leading-tight">
                    <div>{row.qty}</div>
                    <div className="text-[11px] text-zinc-500 font-normal">
                      Min {row.min}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 align-top text-right pr-4">
                  <Button className="rounded-lg h-8 text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                    Reorder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
