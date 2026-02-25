import React, { useState } from "react";
import { Wallet2, Banknote, CreditCard, Building2, IndianRupee, BadgePercent, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/fNumber";
import { useBillCalculations } from "../hooks/useBillCalculations";

interface PaymentSectionProps {
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
    payload,
    setPayload,
}) => {

    const paymentModes = [
        {
            key: "cash",
            label: "Cash Payment",
            icon: Banknote,
            color: "text-emerald-600",
            activeBorder: "border-emerald-500",
            activeBg: "bg-emerald-50"
        },
        {
            key: "online",
            label: "UPI / Card",
            icon: CreditCard,
            color: "text-indigo-600",
            activeBorder: "border-indigo-500",
            activeBg: "bg-indigo-50"
        },
        {
            key: "insurance",
            label: "Insurance / TPA",
            icon: Building2,
            color: "text-fuchsia-600",
            activeBorder: "border-fuchsia-500",
            activeBg: "bg-fuchsia-50"
        },
    ];

    const {
        finalTotal,
        totalPaid,
        dueAmount
    } = useBillCalculations({
        items: payload.items,
        discount: payload.discount,
        roundOff: payload.roundOff,
        payments: {
            cash: payload.cash,
            online: payload.online,
            insurance: payload.insurance
        }
    });

    const itemsTotal = payload.items.reduce((a: number, b: any) => a + b.total, 0);

    return (
        <div className="mb-2 relative z-10">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <Wallet2 className="h-4 w-4" />
                Payments & Insurance
            </div>
            {/* Payment Section Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {paymentModes.map(({ key, label, icon: Icon, color, activeBorder, activeBg }) => {
                    const active = payload[key] && payload[key] > 0;
                    return (
                        <div
                            key={key}
                            className={cn(
                                "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all group",
                                active
                                    ? `${activeBorder} ${activeBg} shadow-md`
                                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                            )}
                        >
                            <div className={cn("p-2 rounded-lg shrink-0", active ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                                <Icon className={cn("h-5 w-5", active ? color : "text-slate-400")} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className={cn("text-[10px] font-semibold uppercase tracking-widest truncate", active ? "text-slate-900" : "text-slate-500")}>{label}</div>
                                <div className={cn("text-sm font-bold flex items-center gap-1", active ? "text-slate-900" : color)}>
                                    <span className="opacity-60">₹</span>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        onFocus={(e) => (e.target.placeholder = "")}
                                        onBlur={(e) => (e.target.placeholder = "0")}
                                        value={payload[key] === 0 ? "" : payload[key].toString()}
                                        onChange={(e) =>
                                            setPayload((prev: any) => ({
                                                ...prev,
                                                [key]: Number(e.target.value),
                                            }))
                                        }
                                        className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Discount (₹) */}
                <div
                    className={cn(
                        "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all group",
                        payload.discount > 0
                            ? `border-rose-500 bg-rose-50 shadow-md`
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    )}
                >
                    <div className={cn("p-2 rounded-lg shrink-0", payload.discount > 0 ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                        <BadgePercent className={cn("h-5 w-5", payload.discount > 0 ? "text-rose-600" : "text-slate-400")} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className={cn("text-[10px] font-semibold uppercase tracking-widest truncate", payload.discount > 0 ? "text-slate-900" : "text-slate-500")}>Discount (₹)</div>
                        <div className={cn("text-sm font-bold flex items-center gap-1", payload.discount > 0 ? "text-slate-900" : "text-rose-600")}>
                            <span className="opacity-60">₹</span>
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                onFocus={(e) => (e.target.placeholder = "")}
                                onBlur={(e) => (e.target.placeholder = "0")}
                                value={payload.discount === 0 ? "" : parseFloat(payload.discount.toFixed(2))}
                                onChange={(e) =>
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        discount: Number(e.target.value),
                                    }))
                                }
                                className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Discount (%) */}
                <div
                    className={cn(
                        "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all group",
                        payload.discount > 0
                            ? `border-rose-500 bg-rose-50 shadow-md`
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    )}
                >
                    <div className={cn("p-2 rounded-lg shrink-0", payload.discount > 0 ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                        <Percent className={cn("h-5 w-5", payload.discount > 0 ? "text-rose-600" : "text-slate-400")} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className={cn("text-[10px] font-semibold uppercase tracking-widest truncate", payload.discount > 0 ? "text-slate-900" : "text-slate-500")}>Discount (%)</div>
                        <div className={cn("text-sm font-bold flex items-center gap-1", payload.discount > 0 ? "text-slate-900" : "text-rose-600")}>
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                onFocus={(e) => (e.target.placeholder = "")}
                                onBlur={(e) => (e.target.placeholder = "0")}
                                value={parseFloat(((payload.discount / (itemsTotal || 1)) * 100).toFixed(2)) || ""}
                                onChange={(e) =>
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        discount: (Number(e.target.value) * itemsTotal) / 100,
                                    }))
                                }
                                className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0 pr-1 text-left"
                            />
                            <span className="opacity-60">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4  pt-6 border-slate-100">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</label>
                    <div className="h-11 w-full flex items-center px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-lg">
                        {formatINR(totalPaid)}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance to Return (₹)</label>
                    <div className={cn(
                        "h-11 flex items-center px-4 rounded-lg border-2 font-bold text-lg transition-colors",
                        (totalPaid - finalTotal) > 0
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : "bg-slate-50 border-slate-100 text-slate-700"
                    )}>
                        {formatINR(Math.max(0, totalPaid - finalTotal))}
                    </div>
                </div>
            </div>
        </div>
    );
};
