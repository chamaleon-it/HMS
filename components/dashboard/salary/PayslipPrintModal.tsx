"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/fNumber";
import { fDate } from "@/lib/fDateAndTime";
import { Printer, X, CheckCircle2, Building2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PayslipData {
  _id: string;
  employee: {
    _id: string;
    name: string;
    role: string;
    employeeId?: string;
    designation?: string;
    phone?: string;
    email?: string;
    qualification?: string;
    address?: string;
  };
  month: string;
  year: number;
  basicPay: number;
  hourlySalary: number;
  hoursWorked: number;
  hourlyPayTotal: number;
  commission: number;
  commissionAmount: number;
  allowances: number;
  bonus: number;
  grossSalary: number;
  deductions: number;
  unpaidLeaves: number;
  unpaidLeaveDeduction: number;
  netSalary: number;
  paymentStatus: "Pending" | "Paid" | "Partially Paid";
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  transactionReference?: string;
  note?: string;
  createdAt?: string;
}

interface PayslipPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PayslipData | null;
}

export default function PayslipPrintModal({
  open,
  onOpenChange,
  data,
}: PayslipPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalDeductions =
    (data.deductions || 0) + (data.unpaidLeaveDeduction || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="p-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/70 print:hidden">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-(--color-synapse-light)" />
            <span>Salary Payslip Preview</span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Payslip Body */}
        <div
          ref={printRef}
          id="printable-payslip"
          className="p-8 space-y-6 text-slate-900 bg-white"
        >
          {/* Hospital Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-(--color-synapse-light) text-white font-black flex items-center justify-center text-sm shadow-xs">
                  S
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  SYNAPSE HOSPITAL
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Multi-Speciality Healthcare & Clinical Services
              </p>
              <p className="text-[11px] text-slate-400">
                Phone: +91 98765 43210 • Email: accounts@synapsehospital.com
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black uppercase tracking-wider text-slate-800">
                Salary Slip
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1.5 uppercase tracking-wide">
                {data.month} {data.year}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Slip Ref: #{data._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Employee Information Card */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Employee Name:
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {data.employee?.name || "Staff Member"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Employee ID:
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {data.employee?.employeeId || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Department:
                </span>
                <span className="font-medium text-slate-800">
                  {data.employee?.role}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Designation:
                </span>
                <span className="font-medium text-slate-800">
                  {data.employee?.designation || data.employee?.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Contact:
                </span>
                <span className="font-medium text-slate-800">
                  {data.employee?.phone || data.employee?.email || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold w-24">
                  Payment Status:
                </span>
                <span
                  className={`px-2 py-0.2 rounded font-bold text-[10px] uppercase tracking-wider ${
                    data.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {data.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Table */}
          <div className="grid grid-cols-2 gap-0 border border-slate-300 rounded-xl overflow-hidden text-xs">
            {/* Earnings Column */}
            <div className="border-r border-slate-300">
              <div className="bg-slate-900 text-white font-bold px-4 py-2 uppercase tracking-wider text-[11px] flex justify-between">
                <span>Earnings Description</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Basic Pay</span>
                  <span className="font-bold tabular-nums">
                    {formatINR(data.basicPay || 0)}
                  </span>
                </div>

                {Boolean(data.hoursWorked > 0 && data.hourlySalary > 0) && (
                  <div className="flex justify-between text-slate-700">
                    <div>
                      <span>Hourly Pay</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({data.hoursWorked} hrs @ {formatINR(data.hourlySalary)}
                        /hr)
                      </span>
                    </div>
                    <span className="font-bold tabular-nums">
                      {formatINR(data.hourlyPayTotal || 0)}
                    </span>
                  </div>
                )}

                {Boolean(data.commissionAmount > 0) && (
                  <div className="flex justify-between text-slate-700">
                    <span>Commission Payout</span>
                    <span className="font-bold tabular-nums">
                      {formatINR(data.commissionAmount || 0)}
                    </span>
                  </div>
                )}

                {Boolean(data.allowances > 0) && (
                  <div className="flex justify-between text-slate-700">
                    <span>Allowances (HRA/Travel)</span>
                    <span className="font-bold tabular-nums">
                      {formatINR(data.allowances || 0)}
                    </span>
                  </div>
                )}

                {Boolean(data.bonus > 0) && (
                  <div className="flex justify-between text-slate-700">
                    <span>Performance Bonus</span>
                    <span className="font-bold tabular-nums">
                      {formatINR(data.bonus || 0)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900">
                  <span>Gross Earnings (A)</span>
                  <span className="tabular-nums">
                    {formatINR(data.grossSalary || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <div className="bg-slate-900 text-white font-bold px-4 py-2 uppercase tracking-wider text-[11px] flex justify-between">
                <span>Deductions Description</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-2">
                {Boolean(data.unpaidLeaves > 0) && (
                  <div className="flex justify-between text-slate-700">
                    <div>
                      <span>Unpaid Leaves</span>
                      <span className="text-[10px] text-rose-500 block">
                        ({data.unpaidLeaves} days absence)
                      </span>
                    </div>
                    <span className="font-bold tabular-nums text-rose-600">
                      -{formatINR(data.unpaidLeaveDeduction || 0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700">
                  <span>Other Deductions / Tax</span>
                  <span className="font-bold tabular-nums text-rose-600">
                    -{formatINR(data.deductions || 0)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900">
                  <span>Total Deductions (B)</span>
                  <span className="tabular-nums text-rose-600">
                    -{formatINR(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Total Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800">
                Net Payable Salary (A - B)
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {data.paymentStatus === "Paid"
                  ? `Disbursed via ${data.paymentMethod || "Direct Payment"}`
                  : "Pending Disbursement"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800 tabular-nums">
                {formatINR(data.netSalary || 0)}
              </span>
            </div>
          </div>

          {/* Payment Details & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
            <div className="space-y-1 text-slate-500">
              <p>
                <strong className="text-slate-700">Payment Mode:</strong>{" "}
                {data.paymentMethod || "—"}
              </p>
              <p>
                <strong className="text-slate-700">Payment Date:</strong>{" "}
                {data.paymentDate ? fDate(data.paymentDate) : "—"}
              </p>
              {data.transactionReference && (
                <p>
                  <strong className="text-slate-700">Ref / Cheque No:</strong>{" "}
                  {data.transactionReference}
                </p>
              )}
              {data.note && (
                <p>
                  <strong className="text-slate-700">Remarks:</strong>{" "}
                  {data.note}
                </p>
              )}
            </div>

            <div className="flex justify-between items-end pt-6">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p className="text-[10px] text-slate-500 font-semibold uppercase">
                  Employee Signature
                </p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p className="text-[10px] text-slate-500 font-semibold uppercase">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 px-6 border-t border-slate-100 bg-slate-50 print:hidden">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-semibold border-slate-200"
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Payslip</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
