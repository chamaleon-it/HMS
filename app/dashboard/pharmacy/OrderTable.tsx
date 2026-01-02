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
import PrintReceipt from "./PrintReceipt";
import useSWR from "swr";
import ViewOrder from "./ViewOrder";

export default function OrderTable({
  orders,
  handleDelete,
  OrderMutate,
}: {
  orders: OrderType[];
  handleDelete: (rx: OrderType) => void;
  OrderMutate: () => void;
}) {

  const { data } = useSWR<{ data: { pharmacy: { billing: { autoGenerateBill: boolean, prefix: string } } }, message: string }>("/users/profile")

  const autoGenerateBill = data?.data.pharmacy.billing.autoGenerateBill ?? false
  const prefix = data?.data.pharmacy.billing.prefix ?? "INV"

  const [printBill, setPrintBill] = useState<null | {
    payload?: {
      patient: string;
      items: {
        name: string;
        quantity: number;
        unitPrice: number;
        gst: number;
        total: number;
      }[];
      cash: number;
      online: number;
      insurance: number;
      discount: number;
      doctor?: string;
      department?: string;
      note?: string;
    },
    patient?: {
      name: string;
      mrn?: string;
      phoneNumber?: string;
      gender?: string;
      dateOfBirth?: string | Date;
      address?: string;
    };
    invoiceDetails?: {
      prefix: string;
      roundOffAmount: number;
      subtotal: number;
      totalGst: number;
      grandTotal: number;
    };
  }>(null)
  const [printOrder, setPrintOrder] = useState<OrderType | null>(null);

  const handlePrint = (order: OrderType) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  const handlePrintBill = async (mrn: string,) => {
    const params = new URLSearchParams()
    params.set("q", mrn)
    const { data } = await api.get<{
      data: {
        assignedTo: string,
        createdAt: Date,
        discount: number,
        doctor: {
          name: string;
          phoneNumber: string;
          specialization: string;
          _id: string
        },
        items: {
          dosage: string;
          duration: string;
          food: string;
          frequency: string;
          isPacked: string;
          quantity: number;
          name: {
            name: string;
            unitPrice: number;
            _is: string

          },
        }[];
        mrn: string;
        patient: {
          name: string;
          mrn?: string;
          phoneNumber?: string;
          gender?: string;
          dateOfBirth?: string | Date;
          address?: string;
          _id: string
        }
        priority: string;
        status: string;
        updatedAt: string;
        _id: string


      }, message: string
    }>(`/pharmacy/orders/single?${params}`,)
    setPrintBill({
      patient: data.data.patient, payload: {
        items: data.data.items.map(e => ({ gst: 0, name: e.name.name, quantity: e.quantity, unitPrice: e.name.unitPrice, total: e.quantity * e.name.unitPrice })),
        cash: 0,
        discount: data.data.discount,
        insurance: 0,
        online: 0,
        patient: data.data.patient._id,
        department: data.data.doctor.specialization,
        doctor: data.data.doctor.name,
        note: "",

      },
      invoiceDetails: {
        totalGst: 0,
        prefix,
        roundOffAmount: 0,
        subtotal: data.data.items.reduce((a, b) => a + (b.quantity * b.name.unitPrice), 0),
        grandTotal: data.data.items.reduce((a, b) => a + (b.quantity * b.name.unitPrice), 0) - data.data.discount
      }
    });
    setTimeout(() => {
      window.print();
      setPrintBill(null);
    }, 100);
  }

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OrderType | null>(null);


  return (
    <div className="rounded-2xl overflow-hidden">
      <Table className="print:hidden">
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
                {r?.patient?.name || "Unknown Patient"} <br />{" "}
                <span className="text-xs">
                  ({r?.patient?.mrn || "No MRN"})
                </span>
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
                  onClick={() => {
                    setSelected(r);
                    setOpen(true);
                  }}
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

                {autoGenerateBill ? <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs"
                  onClick={() => { handlePrintBill(r.mrn) }}
                >

                  <Printer className="h-3.5 w-3.5" />
                  Print Bill

                </Button> : <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs"
                  asChild
                >
                  <Link href={`/dashboard/pharmacy/billing?mrn=${r?.mrn}#new`}>
                    <Printer className="h-3.5 w-3.5" />
                    Print Bill
                  </Link>
                </Button>}


              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {printOrder && <PrintPrescription order={printOrder} />}

      <ViewOrder
        open={open}
        setOpen={setOpen}
        order={selected}
        OrderMutate={OrderMutate}
        autoGenerateBill={autoGenerateBill}
        handlePrintBill={handlePrintBill}
      />

      {Boolean(printBill) && <PrintReceipt payload={printBill?.payload} invoiceDetails={printBill?.invoiceDetails} patient={printBill?.patient} />}
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
