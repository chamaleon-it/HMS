"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/fNumber";
import {
  AccountTransaction,
  TransactionType,
} from "@/app/dashboard/pharmacy/accounts/types";
import { ViewTransactionModal } from "@/app/dashboard/pharmacy/accounts/ViewTransactionModal";
import {
  Eye,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsTableProps {
  transactions: AccountTransaction[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (column: string) => void;
}

export function AnalyticsTable({
  transactions,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
}: AnalyticsTableProps) {
  const [selectedTxn, setSelectedTxn] = useState<AccountTransaction | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Transaction Audit Trail
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              List of all recorded pharmacy account transactions
            </p>
          </div>
        </div>

        {/* Table Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search description, category, ID..."
            className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors text-xs font-medium"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-50 via-slate-100/70 to-slate-50">
              <TableRow className="border-b border-slate-200/80">
                <TableHead className="font-bold text-slate-700 text-xs w-32 py-3.5">
                  <button
                    onClick={() => onSortChange("transactionId")}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    Transaction ID
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  <button
                    onClick={() => onSortChange("transactionDate")}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Type
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Category
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs max-w-xs py-3.5">
                  Description
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs text-right py-3.5">
                  <button
                    onClick={() => onSortChange("amount")}
                    className="flex items-center gap-1 hover:text-slate-900 ml-auto transition-colors"
                  >
                    Amount
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs py-3.5">
                  Created By
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs text-right py-3.5">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={8} className="py-4">
                      <div className="h-4 bg-slate-100 rounded-md w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Receipt className="w-9 h-9 mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">No transactions found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Adjust your filters or search term</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => {
                  const isIncome = txn.type === TransactionType.Income;
                  const createdByName =
                    typeof txn.createdBy === "object" && txn.createdBy
                      ? txn.createdBy.name
                      : "System";

                  const formattedTxnDate = txn.transactionDate
                    ? new Date(txn.transactionDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A";

                  return (
                    <TableRow
                      key={txn._id}
                      className="hover:bg-slate-50/80 transition-colors duration-150 border-b border-slate-100"
                    >
                      <TableCell className="font-mono font-bold text-slate-800 text-xs">
                        {txn.transactionId}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-semibold">
                        {formattedTxnDate}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs"
                              : "bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          {txn.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-800">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/60 inline-block">
                          {txn.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate font-medium">
                        {txn.description}
                      </TableCell>
                      <TableCell
                        className={`text-sm font-extrabold text-right font-mono ${
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatINR(txn.amount)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600">
                        {createdByName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all"
                          title="View Details"
                          onClick={() => {
                            setSelectedTxn(txn);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="font-medium">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{total}</span>{" "}
              records
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium">
                <span>Per page:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => onLimitChange(Number(val))}
                >
                  <SelectTrigger className="h-8 w-16 bg-white rounded-lg border-slate-200 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 bg-white"
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(page - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 font-bold text-slate-800">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 bg-white"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ViewTransactionModal
        open={isViewOpen}
        transaction={selectedTxn}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTxn(null);
        }}
      />
    </motion.div>
  );
}
