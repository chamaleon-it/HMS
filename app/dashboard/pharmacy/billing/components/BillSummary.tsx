import React from "react";
import { Wallet2, FilePlus2, Printer, Download } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/fNumber";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface BillSummaryProps {
    subtotal: number;
    totalGst: number;
    roundOffAmount: number;
    finalTotal: number;
    totalPaid: number;
    dueAmount: number;
    payload: any;
    saveBill: () => void;
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
    saveBill,
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
            className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-4 sticky top-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="flex justify-between items-center border-b pb-3 border-slate-50">
                <div className="flex items-center gap-2">
                    <Wallet2 className="h-4 w-4 text-slate-400" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Bill Summary</h3>
                </div>
            </div>

            <div className="space-y-3">
                <SummaryRow label="Sub Total" value={subtotal} />
                <SummaryRow label="Discount" value={payload.discount} isNegative />
                <SummaryRow label="GST" value={totalGst} />
                {roundOffAmount !== 0 && (
                    <SummaryRow label="Round off" value={roundOffAmount} />
                )}

                <div className="h-px bg-slate-100/60 my-2" />

                <div className="bg-slate-900 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 mt-4 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full rotate-45 group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex justify-between items-center text-white mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Net Payable</span>
                        <span className="text-3xl font-black tracking-tight">₹{Math.ceil(finalTotal).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-medium text-right mt-1">Inclusive of all taxes</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <span>Paid</span>
                        <span className="font-semibold tabular-nums text-slate-700 text-base">₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-500 text-xs font-bold uppercase tracking-wider">
                        <span>Balance Due</span>
                        <span className="font-bold tabular-nums text-rose-600 text-base">₹{dueAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <PrimaryButton
                    className="col-span-half h-14 rounded-2xl text-base font-bold uppercase tracking-widest shadow-xl shadow-indigo-200/50"
                    onClick={() => handleAction(saveBill)}
                >
                    <div className="flex items-center justify-center gap-2">
                        <FilePlus2 className="h-5 w-5" />
                        Generate & Save Invoice
                    </div>
                </PrimaryButton>
                <PrimaryButton
                    className="col-span-half h-14 rounded-2xl text-base font-bold uppercase tracking-widest shadow-xl shadow-indigo-200/50"
                    onClick={() => handleAction(generateBill)}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Printer className="h-5 w-5" />
                        Generate & Print Invoice
                    </div>
                </PrimaryButton>
                <button
                    className="rounded-xl border-2 border-slate-100 bg-white px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
                    onClick={() => handleAction(onPrint)}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </div>
                </button>
                <button
                    className="rounded-xl border-2 border-slate-100 bg-white px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
                    onClick={() => handleAction(downloadPdf)}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        PDF
                    </div>
                </button>
            </div>


        </motion.div>
    );
};

function SummaryRow({ label, value, isBold = false, isNegative = false }: { label: string, value: number, isBold?: boolean, isNegative?: boolean }) {
    return (
        <div className="flex justify-between items-center group/row">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider group-hover/row:text-slate-700 transition-colors">{label}</span>
            <span className={cn(
                "text-sm font-bold tabular-nums tracking-tight text-slate-700",
                isBold && "text-slate-900 text-base",
                isNegative && "text-rose-500"
            )}>
                {isNegative && "- "}₹{Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}
