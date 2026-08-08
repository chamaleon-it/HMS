"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import {
  AccountTransaction,
  TransactionType,
  PaymentMethod,
  PAYMENT_METHODS,
  SourceModule,
  SOURCE_MODULES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "./types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  IndianRupee,
  Calendar,
  Tag,
  FileText,
  MessageSquareText,
  CreditCard,
  Layers,
} from "lucide-react";

const editTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType, {
    error: "Transaction type is required",
  }),
  category: z
    .string({ error: "Category is required" })
    .min(1, "Category is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a number greater than 0",
    }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    error: "Payment method is required",
  }),
  sourceModule: z.nativeEnum(SourceModule).optional(),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(250, "Description must be at most 250 characters"),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
});

type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;

interface EditTransactionModalProps {
  open: boolean;
  transaction: AccountTransaction | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function EditTransactionModal({
  open,
  transaction,
  onClose,
  onRefresh,
}: EditTransactionModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionSchema),
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (transaction) {
      const formattedDate = transaction.transactionDate
        ? new Date(transaction.transactionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      reset({
        type: transaction.type,
        category: transaction.category,
        amount: String(transaction.amount),
        paymentMethod: (transaction.paymentMethod as PaymentMethod) || PaymentMethod.Cash,
        sourceModule: (transaction.sourceModule as SourceModule) || SourceModule.Uncategorised,
        description: transaction.description,
        notes: transaction.notes || "",
        transactionDate: formattedDate,
      });
    }
  }, [transaction, reset]);

  const categories =
    selectedType === TransactionType.Expense
      ? EXPENSE_CATEGORIES
      : INCOME_CATEGORIES;

  const onSubmit = async (values: EditTransactionFormValues) => {
    if (!transaction) return;

    try {
      const payload = {
        type: values.type,
        category: values.category,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
        sourceModule: values.sourceModule || SourceModule.Uncategorised,
        description: values.description.trim(),
        notes: values.notes?.trim() || undefined,
        transactionDate: new Date(values.transactionDate).toISOString(),
      };

      await toast.promise(api.patch(`/accounts/${transaction._id}`, payload), {
        loading: "Updating transaction...",
        success: "Transaction updated successfully!",
        error: (err) =>
          err?.response?.data?.message || "Failed to update transaction",
      });

      onRefresh?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pencil className="w-5 h-5" />
              </div>
              <span>Edit Transaction</span>
            </DialogTitle>

            {transaction && (
              <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {transaction.transactionId}
              </span>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Transaction Type Segmented Switch */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaction Type <span className="text-rose-500">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(TransactionType.Expense);
                      if (!EXPENSE_CATEGORIES.includes(watch("category") as any)) {
                        setValue("category", EXPENSE_CATEGORIES[0]);
                      }
                    }}
                    className={`py-3 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      field.value === TransactionType.Expense
                        ? "bg-white text-rose-700 shadow-sm border border-rose-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(TransactionType.Income);
                      if (!INCOME_CATEGORIES.includes(watch("category") as any)) {
                        setValue("category", INCOME_CATEGORIES[0]);
                      }
                    }}
                    className={`py-3 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      field.value === TransactionType.Income
                        ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    Income
                  </button>
                </div>
              )}
            />
            {errors.type && (
              <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-xl shadow-xl border-slate-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="rounded-lg">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-rose-500 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                Amount (₹) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800 text-base"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment Method <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-xl shadow-xl border-slate-200">
                      {PAYMENT_METHODS.map((pm) => (
                        <SelectItem key={pm} value={pm} className="rounded-lg">
                          {pm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentMethod && (
                <p className="text-xs text-rose-500 font-medium">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Source Module */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Source Module
              </Label>
              <Controller
                name="sourceModule"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-xl shadow-xl border-slate-200">
                      {SOURCE_MODULES.map((sm) => (
                        <SelectItem key={sm} value={sm} className="rounded-lg">
                          {sm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Transaction Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Transaction Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
                {...register("transactionDate")}
              />
              {errors.transactionDate && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.transactionDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Description <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Brief description of the transaction"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <MessageSquareText className="w-3.5 h-3.5 text-slate-400" />
              Notes <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Additional notes or references..."
              className="rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors text-sm"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-rose-500 font-medium">{errors.notes.message}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-5 h-11 border-slate-200 text-slate-700 hover:bg-slate-100"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-(--color-synapse-light) hover:opacity-95 text-white font-semibold rounded-xl px-6 h-11 shadow-md transition-all"
            >
              {isSubmitting ? "Updating..." : "Update Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
