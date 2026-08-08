"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccountTransaction, TransactionType } from "./types";
import { formatINR } from "@/lib/fNumber";
import { ArrowDownLeft, ArrowUpRight, Calendar, User, FileText, Tag, Receipt, CreditCard } from "lucide-react";

interface ViewTransactionModalProps {
  open: boolean;
  transaction: AccountTransaction | null;
  onClose: () => void;
}

export function ViewTransactionModal({
  open,
  transaction,
  onClose,
}: ViewTransactionModalProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === TransactionType.Income;
  const createdByName =
    typeof transaction.createdBy === "object" && transaction.createdBy
      ? transaction.createdBy.name
      : "N/A";

  const formattedTxnDate = transaction.transactionDate
    ? new Date(transaction.transactionDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const formattedCreatedAt = transaction.createdAt
    ? new Date(transaction.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-600" />
              Transaction Details
            </DialogTitle>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                isIncome
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              {transaction.type}
            </span>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Amount banner */}
          <div
            className={`p-4 rounded-xl text-center border ${
              isIncome
                ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                : "bg-rose-50/50 border-rose-100 text-rose-900"
            }`}
          >
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Amount
            </p>
            <p className="text-2xl font-bold mt-1">
              {isIncome ? "+" : "-"} {formatINR(transaction.amount)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Receipt className="w-3.5 h-3.5" /> Transaction ID
              </span>
              <span className="font-mono font-bold text-slate-800 block mt-1">
                {transaction.transactionId}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <CreditCard className="w-3.5 h-3.5" /> Pay Method
              </span>
              <span className="font-semibold text-slate-800 block mt-1">
                {transaction.paymentMethod || "Cash"}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Tag className="w-3.5 h-3.5" /> Category
              </span>
              <span className="font-semibold text-slate-800 block mt-1">
                {transaction.category}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Transaction Date
              </span>
              <span className="font-medium text-slate-800 block mt-1">
                {formattedTxnDate}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5" /> Created By
              </span>
              <span className="font-medium text-slate-800 block mt-1 truncate">
                {createdByName}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5" /> Description
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {transaction.description}
            </p>
          </div>

          {/* Notes if available */}
          {transaction.notes && (
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-sm">
              <span className="text-xs text-amber-700 font-semibold block">
                Notes:
              </span>
              <p className="text-slate-700 mt-0.5">{transaction.notes}</p>
            </div>
          )}

          <div className="text-xs text-slate-400 pt-2 text-right">
            Recorded at: {formattedCreatedAt}
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
