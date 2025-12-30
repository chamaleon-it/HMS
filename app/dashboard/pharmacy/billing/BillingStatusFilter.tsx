"use client";

import React, { useMemo } from "react";
import { CheckCircle, Clock, XCircle, List } from "lucide-react";
import { motion } from "framer-motion";

export type BillingStatusType = "all" | "Paid" | "Partial" | "Unpaid";

interface Props {
    currentStatus: string;
    setStatus: (status: string) => void;
}

export default function BillingStatusFilter({
    currentStatus,
    setStatus,
}: Props) {
    const tabs = useMemo(
        () => [
            { key: "all", label: "All", icon: List, color: "linear-gradient(90deg,#4f46e5,#d946ef)" },
            { key: "Paid", label: "Paid", icon: CheckCircle, color: "linear-gradient(90deg,#4f46e5,#d946ef)" },
            { key: "Partial", label: "Partial", icon: Clock, color: "linear-gradient(90deg,#4f46e5,#d946ef)" },
            { key: "Unpaid", label: "Unpaid", icon: XCircle, color: "linear-gradient(90deg,#4f46e5,#d946ef)" },
        ],
        []
    );

    return (
        <div className="relative inline-flex items-center gap-1 text-sm bg-slate-50 border border-slate-200 rounded-full p-1 dark:bg-slate-800/50 dark:border-slate-700">
            {tabs.map(({ key, label, icon: Icon, color }) => {
                const active = currentStatus === key;
                return (
                    <button
                        key={key}
                        onClick={() => setStatus(key)}
                        className={
                            "relative flex items-center gap-2 rounded-full px-4 py-1.5 transition-all duration-300 ease-in-out cursor-pointer " +
                            (active ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200")
                        }
                        type="button"
                    >
                        {active && (
                            <motion.span
                                layoutId="billing-tab-indicator"
                                className="absolute inset-0 rounded-full shadow-sm"
                                style={{ background: color }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2 font-bold tracking-tight">
                            <Icon size={14} className={active ? "text-white" : "text-slate-400"} />
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
