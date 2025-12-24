import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState } from "react";
import { OrderType } from "./interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fDateandTime } from "@/lib/fDateAndTime";
import { CheckCircle, Eye, Printer, Trash, View } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Link from "next/link";
import PrintPrescription from "./billing/PrintPrescription";

export default function OrderTable({
  handleView,
  orders,
  handleDelete,
  OrderMutate,
}: {
  handleView: (rx: OrderType) => void;
  orders: OrderType[];
  handleDelete: (rx: OrderType) => void;
  OrderMutate: () => void;
}) {
  const [printOrder, setPrintOrder] = useState<OrderType | null>(null);

  const handlePrint = (order: OrderType) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  return (
    <div className="rounded-2xl overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-700 hover:bg-slate-700">
          <TableRow className="bg-slate-700 hover:bg-slate-700">
            <TableHead className="text-white font-semibold">
              <Checkbox />
            </TableHead>
            <TableHead className="text-white font-semibold">Sl No</TableHead>
            <TableHead className="text-white font-semibold">RX ID</TableHead>
            <TableHead className="text-white font-semibold">Patient</TableHead>
            <TableHead className="text-white font-semibold">Items</TableHead>
            <TableHead className="text-white font-semibold">Priority</TableHead>
            <TableHead className="text-white font-semibold">Status</TableHead>
            <TableHead className="text-left text-white font-semibold">
              Assigned To
            </TableHead>

            <TableHead className="text-left text-white font-semibold">
              Created At
            </TableHead>
            <TableHead className="text-right text-white font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((r: OrderType, idx) => (
            <TableRow
              key={r._id}
              className={
                idx % 2 === 0
                  ? "bg-white hover:bg-white/60"
                  : "bg-slate-100 hover:bg-slate-100/60"
              }
            >
              <TableCell>
                <Checkbox />
              </TableCell>

              <TableCell>{idx + 1}</TableCell>
              <TableCell className="font-medium">{r?.mrn}</TableCell>
              <TableCell>
                {r?.patient?.name} <br />{" "}
                <span className="text-xs">({r?.patient?.mrn})</span>
              </TableCell>
              <TableCell>{r?.items?.length}</TableCell>
              <TableCell>
                <PriorityBadge priority={r?.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={r?.status} />
              </TableCell>
              <TableCell className="text-left">
                {r?.assignedTo ? (
                  <Badge className={"bg-emerald-100 text-emerald-700"}>
                    {r?.assignedTo}
                  </Badge>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </TableCell>
              <TableCell>{fDateandTime(r?.createdAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button

                  size="sm"
                  variant="outline"
                  onClick={() => handleView(r)}
                  className="gap-2 h-8 text-xs"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(r)}
                  className="gap-2 h-8 text-xs"
                >
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
                {
                  r?.status === "Ready" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-8 text-xs"
                      onClick={async () => {
                        await toast.promise(api.patch(`/pharmacy/orders/complete/${r._id}`), {
                          loading: "Completing...",
                          success: (data) => {
                            OrderMutate();
                            return data.data.message;
                          },
                          error: ({ response: { data } }) => {
                            return data.message;
                          }
                        })
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </Button>
                  )
                }

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs"
                  onClick={() => handlePrint(r)}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Prescription
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs"
                  asChild
                >
                  <Link href={`/dashboard/pharmacy/billing?mrn=${r?.mrn}#new`}>
                    <Printer className="h-3.5 w-3.5" />
                    Print Bill
                  </Link>
                </Button>


              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {printOrder && <PrintPrescription order={printOrder} />}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    STAT: "bg-rose-100 text-rose-700",
    VIP: "bg-purple-100 text-purple-700",
    Routine: "bg-sky-100 text-sky-700",
  };
  return (
    <Badge className={map[priority] || "bg-slate-100 text-slate-700"}>
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Filling: "bg-blue-100 text-blue-700",
    "Clinical Check": "bg-amber-100 text-amber-700",
    Ready: "bg-emerald-100 text-emerald-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Badge className={map[status] || "bg-slate-100 text-slate-700"}>
      {status}
    </Badge>
  );
}
