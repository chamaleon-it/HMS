"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import AppShell from "@/components/layout/app-shell";
import PharmacyHeader from "../components/PharmacyHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/fNumber";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ChevronLeft,
  ChevronRight,
  XCircle,
  ArrowUpDown,
  FilterX,
} from "lucide-react";
import {
  AccountTransaction,
  GetAccountTransactionsResponse,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "./types";
import { AddTransactionModal } from "./AddTransactionModal";
import { EditTransactionModal } from "./EditTransactionModal";
import { ViewTransactionModal } from "./ViewTransactionModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AccountsPage() {
  // Filters & State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("transactionDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<AccountTransaction | null>(null);

  // Build SWR API URL
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (searchTerm.trim()) queryParams.set("q", searchTerm.trim());
  if (selectedType !== "ALL") queryParams.set("type", selectedType);
  if (selectedCategory !== "ALL") queryParams.set("category", selectedCategory);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (sortBy) queryParams.set("sortBy", sortBy);
  if (sortOrder) queryParams.set("sortOrder", sortOrder);

  const { data, error, isLoading, mutate } = useSWR<GetAccountTransactionsResponse>(
    `/accounts?${queryParams.toString()}`,
    fetcher
  );

  const transactions = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;
  const summary = data?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  };

  // Available categories for dropdown filter based on selected type
  const availableFilterCategories = useMemo(() => {
    if (selectedType === TransactionType.Expense) {
      return EXPENSE_CATEGORIES;
    }
    if (selectedType === TransactionType.Income) {
      return INCOME_CATEGORIES;
    }
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [selectedType]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("ALL");
    setSelectedCategory("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("transactionDate");
    setSortOrder("desc");
    setPage(1);
  };

  const handleDelete = async (transaction: AccountTransaction) => {
    if (
      !confirm(
        `Are you sure you want to delete transaction ${transaction.transactionId}?`
      )
    ) {
      return;
    }

    try {
      await toast.promise(api.delete(`/accounts/${transaction._id}`), {
        loading: "Deleting transaction...",
        success: "Transaction deleted successfully!",
        error: (err) =>
          err?.response?.data?.message || "Failed to delete transaction",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <AppShell>
        <div className="p-5 flex items-center justify-center min-h-[calc(100vh-67px)]">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              Failed to load accounts
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Something went wrong while fetching account transactions.
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200"
              onClick={() => mutate()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-5 min-h-[calc(100vh-67px)] space-y-6">
        {/* Header & Title */}
        <PharmacyHeader
          title="Accounts"
          subtitle="Record, track, and manage pharmacy income and expense transactions"
        >
          <Button
            className="bg-(--color-synapse-light) text-white shadow-md font-semibold rounded-xl"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </PharmacyHeader>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income Card */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Total Income
                </p>
                <h3 className="text-2xl font-bold text-emerald-950 mt-1">
                  {formatINR(summary.totalIncome)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                  Total Expenses
                </p>
                <h3 className="text-2xl font-bold text-rose-950 mt-1">
                  {formatINR(summary.totalExpense)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Net Balance
                </p>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    summary.netBalance >= 0 ? "text-blue-950" : "text-rose-600"
                  }`}
                >
                  {formatINR(summary.netBalance)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {total}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-600">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search description, category, ID..."
                className="pl-9 h-10 rounded-xl border-slate-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Type Filter */}
            <div>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  setSelectedType(val);
                  setSelectedCategory("ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={TransactionType.Income}>Income</SelectItem>
                  <SelectItem value={TransactionType.Expense}>Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-60">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {availableFilterCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <Input
                type="date"
                className="h-10 rounded-xl border-slate-200"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <Input
                type="date"
                className="h-10 rounded-xl border-slate-200"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Active Filter Clear */}
          {(searchTerm ||
            selectedType !== "ALL" ||
            selectedCategory !== "ALL" ||
            startDate ||
            endDate) && (
            <div className="flex items-center justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 rounded-lg"
                onClick={handleResetFilters}
              >
                <FilterX className="w-3.5 h-3.5 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 w-32">
                    <button
                      onClick={() => handleSort("transactionId")}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Transaction ID
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("transactionDate")}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Pay Method
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 max-w-xs">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center gap-1 hover:text-slate-900 ml-auto"
                    >
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Created By
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Created At
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={9} className="py-4">
                        <div className="h-4 bg-slate-100 rounded-md w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <p className="text-slate-700 font-semibold text-base">
                          No transactions found
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Try adjusting search keywords or filters, or create a
                          new transaction.
                        </p>
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

                    const formattedCreatedAt = txn.createdAt
                      ? new Date(txn.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A";

                    return (
                      <TableRow
                        key={txn._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-slate-800 text-xs">
                          {txn.transactionId}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {formattedTxnDate}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : "bg-rose-50 text-rose-700 border border-rose-200/80"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {txn.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {txn.category}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60 font-mono">
                            {txn.paymentMethod || "Cash"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                          {txn.description}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-bold text-right ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"} {formatINR(txn.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {createdByName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {formattedCreatedAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                              title="View Details"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Edit Transaction"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setIsEditOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                              title="Delete Transaction"
                              onClick={() => handleDelete(txn)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {total > 0 && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{total}</span>{" "}
                transactions
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                      setLimit(Number(val));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16 bg-white rounded-lg border-slate-200 text-xs">
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
                    className="h-8 w-8 rounded-lg border-slate-200"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-2 font-medium">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-slate-200"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawers and Modals */}
      <AddTransactionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onRefresh={() => mutate()}
      />

      <EditTransactionModal
        open={isEditOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTransaction(null);
        }}
        onRefresh={() => mutate()}
      />

      <ViewTransactionModal
        open={isViewOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </AppShell>
  );
}
