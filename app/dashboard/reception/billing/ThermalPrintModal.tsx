"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";

interface ThermalPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any;
}

export default function ThermalPrintModal({
  open,
  onOpenChange,
  bill,
}: ThermalPrintModalProps) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const docName =
    typeof bill.doctor === "object"
      ? bill.doctor?.name
      : bill.doctor === "Self"
      ? "Self"
      : bill.doctor || "N/A";

  const itemsTotal = (bill.items || []).reduce(
    (sum: number, item: any) => sum + (item.total ?? 0),
    0
  );
  const roundOffAmount = bill.roundOff ? getDecimal(itemsTotal) : 0;
  const discountAmount = bill.discount || 0;
  const grandTotal = itemsTotal - roundOffAmount - discountAmount;

  const cashPaid = bill.cash || 0;
  const cardPaid = bill.card || 0;
  const upiPaid = bill.upi || 0;
  const totalPaid = cashPaid + cardPaid + upiPaid + discountAmount;
  const dueAmount = Math.max(0, grandTotal - (cashPaid + cardPaid + upiPaid));

  const status = (() => {
    if (bill.transactionType === "Refund" || bill.items?.some((i: any) => i.name?.toLowerCase().includes("refund"))) {
      return "REFUND";
    }
    if (bill.transactionType === "Return") {
      return "RETURN";
    }
    if (grandTotal - (cashPaid + cardPaid + upiPaid) <= 0.01) {
      return "PAID";
    }
    if (cashPaid + cardPaid + upiPaid <= 0.01) {
      return "UNPAID";
    }
    return "PARTIAL";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-6 rounded-2xl shadow-2xl overflow-hidden print:bg-transparent print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800 no-print">
          <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Printer className="h-5 w-5 text-emerald-400" />
            Thermal Receipt Preview (80mm)
          </DialogTitle>
        </DialogHeader>

        {/* Thermal Print Content Container */}
        <div className="flex justify-center my-2 overflow-y-auto max-h-[65vh] p-2 no-scrollbar">
          <div className="thermal-print-area bg-white text-black font-mono text-[11px] leading-tight p-4 w-[290px] shadow-lg rounded border border-slate-200 select-none">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @media print {
                    @page {
                      size: 80mm auto;
                      margin: 0;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    .thermal-print-area, .thermal-print-area * {
                      visibility: visible !important;
                    }
                    .thermal-print-area {
                      position: fixed !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 78mm !important;
                      margin: 0 !important;
                      padding: 4mm !important;
                      font-family: 'Courier New', Courier, monospace !important;
                      font-size: 11px !important;
                      line-height: 1.2 !important;
                      color: black !important;
                      background: white !important;
                      box-shadow: none !important;
                      border: none !important;
                      border-radius: 0 !important;
                      transform: none !important;
                      max-height: none !important;
                      overflow: visible !important;
                    }
                    /* Reset Radix Dialog overlay/portal transforms & clipping during print */
                    [data-radix-portal], [role="dialog"], [role="dialog"] > * {
                      position: static !important;
                      transform: none !important;
                      background: transparent !important;
                      border: none !important;
                      box-shadow: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      max-height: none !important;
                      max-width: none !important;
                      overflow: visible !important;
                      width: auto !important;
                      height: auto !important;
                      inset: auto !important;
                    }
                    .no-print, [role="dialog"] > button, header, footer {
                      display: none !important;
                    }
                  }
                `,
              }}
            />

            {/* Header / Hospital Branding */}
            <div className="text-center pb-2">
              <h2 className="font-bold text-sm tracking-wide uppercase">
                Bhumi Nature Cure
              </h2>
              <p className="text-[10px] text-slate-600">Wellness & Healthcare Center</p>
              <p className="text-[9px] text-slate-500">Ph: +91 98765 43210</p>
            </div>

            <div className="border-b border-dashed border-slate-400 my-1.5" />

            {/* Bill & Patient Details */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="font-semibold">Invoice:</span>
                <span>{bill.mrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{fDateandTime(bill.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Patient:</span>
                <span className="font-bold">{bill.patient?.name || "N/A"}</span>
              </div>
              {bill.patient?.mrn && (
                <div className="flex justify-between">
                  <span className="font-semibold">MRN:</span>
                  <span>{bill.patient?.mrn}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold">Doctor:</span>
                <span>{docName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-1.5" />

            {/* Items Table */}
            <div className="space-y-1">
              <div className="grid grid-cols-12 font-bold text-[9.5px] border-b border-slate-300 pb-1 uppercase">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Amount</span>
              </div>

              {(bill.items || []).map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 text-[10px] py-0.5 border-b border-slate-100 last:border-0">
                  <span className="col-span-6 truncate font-medium">{item.name}</span>
                  <span className="col-span-2 text-center">{item.quantity || 1}</span>
                  <span className="col-span-4 text-right tabular-nums">
                    {(item.total || item.unitPrice * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-400 my-1.5" />

            {/* Totals & Breakdown */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="tabular-nums">₹{itemsTotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Discount:</span>
                  <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {bill.roundOff && roundOffAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Round Off:</span>
                  <span className="tabular-nums">-₹{roundOffAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-[11px] pt-1 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-1.5" />

            {/* Payment Details */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Cash Paid:</span>
                <span className="tabular-nums">₹{cashPaid.toFixed(2)}</span>
              </div>
              {cardPaid > 0 && (
                <div className="flex justify-between">
                  <span>Card Paid:</span>
                  <span className="tabular-nums">₹{cardPaid.toFixed(2)}</span>
                </div>
              )}
              {upiPaid > 0 && (
                <div className="flex justify-between">
                  <span>UPI Paid:</span>
                  <span className="tabular-nums">₹{upiPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-0.5">
                <span>Total Paid:</span>
                <span className="tabular-nums">₹{(cashPaid + cardPaid + upiPaid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600 pt-0.5">
                <span>Balance Due:</span>
                <span className="tabular-nums">₹{dueAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold">
                <span>Status:</span>
                <span className="uppercase tracking-wider">{status}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Footer */}
            <div className="text-center space-y-0.5">
              <p className="font-semibold text-[10px]">Thank You!</p>
              <p className="text-[9px] text-slate-500">Wish you good health & well-being</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800 no-print">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 px-5"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
