import React from "react";
import { Wallet2, FilePlus2, Printer, Download } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";

interface BillSummaryProps {
    subtotal: number;
    totalGst: number;
    roundOffAmount: number;
    finalTotal: number;
    totalPaid: number;
    dueAmount: number;
    payload: any;
    generateBill: () => void;
    onPrint: () => void;
    downloadPdf: () => void;
    PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
    subtotal,
    totalGst,
    roundOffAmount,
    finalTotal,
    totalPaid,
    dueAmount,
    payload,
    generateBill,
    onPrint,
    downloadPdf,
    PrimaryButton,
}) => {
    const handleAction = (action: () => void) => {
        if (!payload.patient) {
            toast.error("Please select patient.");
            return;
        }
        if (payload.items.length === 0) {
            toast.error("Please add at least one item.");
            return;
        }
        action();
    };

    return (
        <motion.div
            className="rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900 sticky top-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Wallet2 className="h-4 w-4" />
                Invoice Summary
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium tabular-nums">
                        -{formatINR(payload.discount)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">GST</span>
                    <span className="font-medium tabular-nums">{formatINR(totalGst)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Round off</span>
                    <span className="font-medium tabular-nums">{formatINR(roundOffAmount)}</span>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatINR(finalTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Paid</span>
                    <span className="font-medium tabular-nums">{formatINR(totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span className="font-semibold">Due</span>
                    <span className="font-semibold tabular-nums">{formatINR(dueAmount)}</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <PrimaryButton
                    className="col-span-full cursor-pointer"
                    onClick={() => handleAction(generateBill)}
                >
                    <FilePlus2 className="mr-2 inline h-4 w-4" />
                    Generate
                </PrimaryButton>
                <button
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                    onClick={() => handleAction(onPrint)}
                >
                    <Printer className="mr-2 inline h-4 w-4" />
                    Print
                </button>
                <button
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                    onClick={() => handleAction(downloadPdf)}
                >
                    <Download className="mr-2 inline h-4 w-4" />
                    PDF
                </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
                Per-line discount → GST. Supports split payments & insurance.
            </p>
        </motion.div>
    );
};
