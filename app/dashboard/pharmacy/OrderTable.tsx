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
import { AlertTriangle, CheckCircle, Eye, Printer, RotateCcw, Trash, View } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Link from "next/link";
import PrintPrescription from "./billing/PrintPrescription";
import PrintReceipt from "./PrintReceipt";
import useSWR from "swr";
import ViewOrder from "./ViewOrder";
import { PaginationBar } from "./components/PaginationBar";
import { Dispatch, SetStateAction } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDrafts } from "./DraftContext";

export default function OrderTable({
  orders,
  total,
  filter,
  setFilter,
  handleDelete,
  OrderMutate,
}: {
  orders: OrderType[];
  total: number;
  filter: { page: number; limit: number };
  setFilter: Dispatch<SetStateAction<any>>;
  handleDelete: (rx: OrderType) => void;
  OrderMutate: () => void;
}) {

  const { updateDraft, removeDraft } = useDrafts();
  
  const { data: profile } = useSWR<{
    data: {
      pharmacy: {
        billing: {
          autoGenerateBill: boolean;
          prefix: string;
          defaultGst?: number;
        };
      };
    };
    message: string;
  }>("/users/profile");

  const autoGenerateBill =
    profile?.data?.pharmacy?.billing?.autoGenerateBill ?? false;
  const prefix = profile?.data?.pharmacy?.billing?.prefix ?? "INV";
  const defaultGst = profile?.data?.pharmacy?.billing?.defaultGst ?? 0;

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
    };
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
  }>(null);
  const [printOrder, setPrintOrder] = useState<OrderType | null>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const handlePrint = (order: OrderType) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 100);
  };

  const handlePrintBill = async (order: OrderType) => {
    setPrintingOrderId(order._id);
    try {
      const params = new URLSearchParams();
      params.set("q", order.mrn);
      const { data } = await api.get<{
        data: {
          assignedTo: string;
          createdAt: Date;
          discount: number;
          doctor: {
            name: string;
            phoneNumber: string;
            specialization: string;
            _id: string;
          };
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
              _id: string;
            };
          }[];
          mrn: string;
          patient: {
            name: string;
            mrn?: string;
            phoneNumber?: string;
            gender?: string;
            dateOfBirth?: string | Date;
            address?: string;
            _id: string;
          };
          priority: string;
          status: string;
          updatedAt: string;
          _id: string;
        };
        message: string;
      }>(`/pharmacy/orders/single?${params}`);

      const items = data.data.items.map((e) => {
        const unitPrice = e.name.unitPrice || 0;
        const quantity = e.quantity || 0;
        // Since GST might not be in the order fetch, we fallback to defaultGst or 0
        const itemGst = defaultGst;
        const basePrice = unitPrice * quantity;
        const gstAmount = basePrice * (itemGst / 100);
        return {
          gst: itemGst,
          name: e.name.name,
          quantity,
          unitPrice,
          total: Math.round((basePrice + gstAmount) * 100) / 100,
        };
      });

      const subtotal = items.reduce(
        (a, b) => a + b.unitPrice * b.quantity,
        0
      );
      const totalGst = items.reduce(
        (a, b) => a + b.unitPrice * b.quantity * (b.gst / 100),
        0
      );
      const discount = data.data.discount || 0;
      const grandTotal = subtotal + totalGst - discount;

      setPrintBill({
        patient: data.data.patient,
        payload: {
          items,
          cash: 0,
          discount,
          insurance: 0,
          online: 0,
          patient: data.data.patient._id,
          department: data.data.doctor.specialization,
          doctor: data.data.doctor.name,
          note: "",
        },
        invoiceDetails: {
          totalGst,
          prefix,
          roundOffAmount: 0, // Simplified for now
          subtotal,
          grandTotal,
        },
      });
      setTimeout(() => {
        window.print();
        setPrintBill(null);
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bill details");
    } finally {
      setPrintingOrderId(null);
    }
  };

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OrderType | null>(null);

  const handleRowClick = (r: OrderType) => {
    if (r.status === "Draft") {
      updateDraft(r._id, { isOpen: true, minimized: false });
    } else {
      setSelected(r);
      setOpen(true);
    }
  };

  return (
    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200 overflow-x-auto">
      <Table className="print:hidden min-w-fit">
        <TableHeader className="bg-slate-700 hover:bg-slate-700">
          <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4 w-16">
              Sl No
            </TableHead>
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">RX ID</TableHead>
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Patient</TableHead>
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-center">Items</TableHead>
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-center">Priority</TableHead>
            <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 text-center">Status</TableHead>
            <TableHead className="text-left text-white font-bold text-[11px] uppercase tracking-wider py-2.5">
              Created At
            </TableHead>
            <TableHead className="text-right text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4">
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

              <TableCell className="py-3 pl-4 text-slate-500 font-medium cursor-pointer"
                onClick={() => handleRowClick(r)}
              >
                {(filter.page - 1) * filter.limit + idx + 1}
              </TableCell>
              <TableCell className="py-3 font-medium text-slate-900 cursor-pointer"
                onClick={() => handleRowClick(r)}
              >{r?.mrn}</TableCell>
              <TableCell className="py-3 cursor-pointer"
                onClick={() => handleRowClick(r)}
              >
                <div className="flex items-center gap-1.5">
                  <div className="font-medium text-slate-900">{r?.patient?.name}</div>
                  {r?.patient?.allergies && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <p className="text-xs font-semibold">Allergy: {r.patient.allergies}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {r.status !== "Draft" && <div className="text-[11px] text-slate-500">({r?.patient?.mrn})</div>}
              </TableCell>
              <TableCell className="py-3 text-center cursor-pointer"
                onClick={() => handleRowClick(r)}
              >
                {r.status === "Draft" 
                  ? r.items?.filter((i: any) => i.medicineName)?.length || 0 
                  : r?.items?.length || 0}
              </TableCell>
              <TableCell className="py-3 text-center cursor-pointer"
                onClick={() => handleRowClick(r)}
              >
                <PriorityBadge priority={r?.priority} />
              </TableCell>
              <TableCell className="py-3 text-center cursor-pointer"
                onClick={() => handleRowClick(r)}
              >
                <StatusBadge status={r?.status} />
              </TableCell>
              <TableCell className="py-3 cursor-pointer"
                onClick={() => handleRowClick(r)}
              >{fDateandTime(r?.createdAt)}</TableCell>
              <TableCell className="py-3 text-right space-x-1 pr-4">
                {r.status === "Draft" && (
                  <div className="flex justify-end items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft(r._id, { isOpen: true, minimized: false });
                          }}
                          className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Open Draft</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDraft(r._id);
                          }}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Discard Draft</p></TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {r.status !== "Draft" && r.isDeleted === false && <div className="flex justify-end items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelected(r);
                          setOpen(true);
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Order</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(r)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Order</p>
                    </TooltipContent>
                  </Tooltip>

                  {r?.status === "Ready" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete Order</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-xs text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800"
                    onClick={() => handlePrint(r)}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Rx
                  </Button>

                  {r.billNo != "-" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!printingOrderId}
                      className="gap-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                      onClick={() => { handlePrintBill(r) }}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {printingOrderId === r._id ? "..." : "Bill"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                      asChild
                    >
                      <Link href={`/dashboard/pharmacy/billing?mrn=${r?.mrn}#new`}>
                        <Printer className="h-3.5 w-3.5" />
                        Bill
                      </Link>
                    </Button>
                  )}
                </div>}

                {
                  r.isDeleted === true && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={"outline"} size={"icon"}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Recover Lab Report?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to recover the lab report for{" "}
                            <span className="font-bold text-slate-900">
                              {r.patient?.name}
                            </span>
                            ? This will move it back to its previous status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={async () => {
                              try {
                                await toast.promise(
                                  api.post(`pharmacy/orders/recover/${r._id}`),
                                  {
                                    loading: "Processing...",
                                    success: "Recovered",
                                    error: "Failed to recover",
                                  }
                                );
                                OrderMutate();
                              } catch (error) {
                                toast.error(`Failed to recover : ${error}`);
                              }
                            }}
                          >
                            Recover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )
                }
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
        printingOrderId={printingOrderId}
      />

      {Boolean(printBill) && <PrintReceipt payload={printBill?.payload} invoiceDetails={printBill?.invoiceDetails} patient={printBill?.patient} />}

      {total > filter.limit && (
        <div className="px-4 py-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <PaginationBar
            page={filter.page}
            limit={filter.limit}
            total={total}
            setFilter={setFilter}
          />
        </div>
      )}
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
