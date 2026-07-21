"use client";

import React from "react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import { fDateandTime } from "@/lib/fDateAndTime";

interface ThermalPrintReceiptProps {
  bill: any;
}

export default function ThermalPrintReceipt({ bill }: ThermalPrintReceiptProps) {
  if (!bill) return null;

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
    <div className="thermal-receipt-print-wrapper hidden print:block bg-white text-black font-mono text-[11px] leading-tight select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                visibility: hidden !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .thermal-receipt-print-wrapper, .thermal-receipt-print-wrapper * {
                visibility: visible !important;
              }
              .thermal-receipt-print-wrapper {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 auto !important;
                width: 78mm !important;
                padding: 3mm !important;
                font-family: 'Courier New', Courier, monospace !important;
                font-size: 11px !important;
                line-height: 1.2 !important;
                color: black !important;
                background: white !important;
                display: block !important;
              }
              .no-print, header, footer, nav, button, [role="dialog"] {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Thermal Receipt Body */}
      <div className="w-full">
        {/* Header / Hospital Branding */}
        <div className="text-center pb-1">
          <h2 className="font-bold text-xs tracking-wide uppercase">
            Bhumi Nature Cure
          </h2>
          <p className="text-[10px]">Wellness & Healthcare Center</p>
          <p className="text-[9px]">Ph: +91 98765 43210</p>
        </div>

        <div className="border-b border-dashed border-black my-1" />

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

        <div className="border-b border-dashed border-black my-1" />

        {/* Items Table */}
        <div className="space-y-0.5">
          <div className="grid grid-cols-12 font-bold text-[9.5px] border-b border-black pb-0.5 uppercase">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-4 text-right">Amount</span>
          </div>

          {(bill.items || []).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 text-[10px] py-0.5 border-b border-gray-200 last:border-0">
              <span className="col-span-6 truncate font-medium">{item.name}</span>
              <span className="col-span-2 text-center">{item.quantity || 1}</span>
              <span className="col-span-4 text-right tabular-nums">
                {(item.total || item.unitPrice * (item.quantity || 1)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-1" />

        {/* Totals & Breakdown */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="tabular-nums">₹{itemsTotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="tabular-nums">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {bill.roundOff && roundOffAmount > 0 && (
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span className="tabular-nums">-₹{roundOffAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-[11px] pt-0.5 border-t border-black">
            <span>Grand Total:</span>
            <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-1" />

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
          <div className="flex justify-between font-bold pt-0.5">
            <span>Balance Due:</span>
            <span className="tabular-nums">₹{dueAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-0.5 font-bold">
            <span>Status:</span>
            <span className="uppercase tracking-wider">{status}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-1.5" />

        {/* Footer */}
        <div className="text-center space-y-0.5 pb-2">
          <p className="font-semibold text-[10px]">Thank You!</p>
          <p className="text-[9px]">Wish you good health & well-being</p>
        </div>
      </div>
    </div>
  );
}
