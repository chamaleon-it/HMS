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

        <Table className="rounded-2xl overflow-hidden">
          <TableHeader>
            <TableRow className="bg-slate-700 hover:bg-slate-700">
              <TableHead className="w-8 text-white">SL</TableHead>
              <TableHead className="text-white">Medicine</TableHead>
              <TableHead className="text-white">Quantity</TableHead>
              <TableHead className="text-white">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {row.items?.map((it, idx) => {
              return (
                <TableRow key={it._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{it.name}</div>
                  </TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>{it.notes}</TableCell>
                </TableRow>
              );
            })}
            {row.instructions && (
              <TableRow>
                <TableCell colSpan={4}>
                  <span className="font-medium">Instructions:</span> <br />{" "}
                  {row.instructions}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
