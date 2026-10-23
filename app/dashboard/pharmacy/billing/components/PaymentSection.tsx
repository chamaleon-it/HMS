import React from "react";
import { BadgePercent, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentSectionProps {
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
    payload,
    setPayload,
}) => {

    const itemsTotal = payload.items.reduce((a: number, b: any) => a + b.total, 0);

    return (
        <div className="mb-2 relative z-10">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <BadgePercent className="h-4 w-4" />
                Discounts
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        </div>
    );
};
