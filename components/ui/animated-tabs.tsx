"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabOption {
    value: string;
    label: string;
    icon?: React.ElementType;
}

interface AnimatedTabsProps {
    options: TabOption[];
    value: string;
    onChange: (value: any) => void;
    layoutId: string;
    className?: string;
}

export function AnimatedTabs({ options, value, onChange, layoutId, className }: AnimatedTabsProps) {
    return (
        <div className={cn("relative inline-flex flex-wrap items-center gap-2 text-sm bg-white border border-gray-200 rounded-full p-1 w-fit", className)}>
            {options.map(({ value: key, label, icon: Icon }) => {
                const active = value === key;
                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={cn(
                            "relative flex items-center justify-center gap-2 rounded-full px-4 py-2 transition text-sm font-medium will-change-transform cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
                            active ? "text-white" : "text-gray-700 hover:text-gray-900"
                        )}
                        type="button"
                    >
                        {active && (
                            <motion.span
                                layoutId={layoutId}
                                className="absolute inset-0 rounded-full"
                                style={{ background: "linear-gradient(90deg,#4f46e5,#d946ef)" }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {Icon && <Icon size={16} />} {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
