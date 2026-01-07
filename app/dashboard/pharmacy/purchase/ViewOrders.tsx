import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// shadcn table + checkbox
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";

export default function PurchasePackingView({ row }: { row: PurchaseType }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 rounded-lg text-xs"
        >
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl">
        <div className="">
          <div className="">
            <div className="">
              <h3 className="text-lg font-semibold">
                Purchase Order View — {row.mrn || row._id}
              </h3>

              <div className="text-xs text-muted-foreground">
                Date: {fDate(row.createdAt)}
              </div>
            </div>
            <div className="mt-3 bg-muted p-4 rounded-md border">
              <div className="text-sm font-medium">
                {row.pharmacy?.name || "Patient"}{" "}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Contact: {row.contactPerson} • Phone Number: {row.phoneNumber}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Expected delivery: {fDate(row.expectedDelivery)} • Payment
                Terms: {row.paymentTerms}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Allow partial delivery : {row.partialDelivery ? "Yes" : "No"} •
                Mark as urgent: {row.urgent ? "Yes" : "No"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Address: {row.deliveryAddress || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 mt-4">
          <Table>
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <TableHead className="w-12 text-white font-bold text-[11px] uppercase tracking-wider py-4 pl-4 text-center">SL</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4">Medicine</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 text-center">Quantity</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-4 pr-4">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {row.items.map((it, idx) => {
                return (
                  <TableRow key={it._id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <TableCell className="py-3 pl-4 text-center text-slate-500 font-medium">{idx + 1}</TableCell>
                    <TableCell className="py-3">
                      <div className="font-semibold text-slate-900">{it.name}</div>
                    </TableCell>
                    <TableCell className="py-3 text-center font-medium text-slate-700">{it.quantity}</TableCell>
                    <TableCell className="py-3 pr-4 text-slate-600 italic text-[11px]">{it.notes || "-"}</TableCell>
                  </TableRow>
                );
              })}
              {row.instructions && (
                <TableRow>
                  <TableCell colSpan={4} className="py-4 px-4 bg-slate-50/30">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Special Instructions</div>
                    <div className="text-sm text-slate-700">{row.instructions}</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
