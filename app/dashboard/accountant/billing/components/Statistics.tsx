import { useMemo } from "react";
import { formatINR } from "@/lib/fNumber";
import {
    Receipt,
    AlertCircle,
    Wallet,
    Banknote,
    Smartphone,
    BadgePercent,
    Percent,
} from "lucide-react";
import { accountantSummaryCards } from "../accountantBilling";

interface StatisticsProps {
    billing: {
        roundOff: boolean;
        _id: string;
        mrn: string;
        createdAt: Date;
        cash: number;
        card: number;
        upi: number;
        discount: number;
        note?: string;
        items: {
            name: string;
            total: number;
            quantity: number;
            unitPrice: number;
            gst: number;
        }[];
        patient: {
            name: string;
            mrn: string;
        };
        doctor: string;
        transactionType?: "Return" | "Sale" | "Refund";
        billingCategory?: "Pharmacy" | "Procedure" | "Reception" | "Other";
    }[]
}

export default function Statistics({ billing }: StatisticsProps) {
    const totals = useMemo(() => accountantSummaryCards(billing), [billing]);

    const stats = [
        { label: "Total Billed", value: formatINR(totals.totalBilled), icon: Receipt, bg: "bg-blue-50/50", border: "border-blue-100", iconColor: "text-(--color-synapse-light)/70", textColor: "text-blue-800/70", headingColor: "text-blue-900" },
        { label: "Total Collected", value: formatINR(totals.totalCollected), icon: Wallet, bg: "bg-emerald-50/50", border: "border-emerald-100", iconColor: "text-emerald-600/70", textColor: "text-emerald-800/70", headingColor: "text-emerald-900" },
        { label: "Total Outstanding", value: formatINR(totals.totalOutstanding), icon: AlertCircle, bg: "bg-rose-50/50", border: "border-rose-100", iconColor: "text-rose-600/70", textColor: "text-rose-800/70", headingColor: "text-rose-900" },
        { label: "Cash Settlement", value: formatINR(totals.cash), icon: Banknote, bg: "bg-teal-50/50", border: "border-teal-100", iconColor: "text-teal-600/70", textColor: "text-teal-800/70", headingColor: "text-teal-900" },
        { label: "UPI Settlement", value: formatINR(totals.upi), icon: Smartphone, bg: "bg-sky-50/50", border: "border-sky-100", iconColor: "text-sky-600/70", textColor: "text-sky-800/70", headingColor: "text-sky-900" },
        { label: "Discounts Given", value: formatINR(totals.discount), icon: BadgePercent, bg: "bg-amber-50/50", border: "border-amber-100", iconColor: "text-amber-600/70", textColor: "text-amber-800/70", headingColor: "text-amber-900" },
        { label: "Total SGST", value: formatINR(totals.sgst), icon: Percent, bg: "bg-blue-50/50", border: "border-blue-100", iconColor: "text-(--color-synapse-light)/70", textColor: "text-blue-800/70", headingColor: "text-blue-900" },
        { label: "Total CGST", value: formatINR(totals.cgst), icon: Percent, bg: "bg-blue-50/50", border: "border-blue-100", iconColor: "text-(--color-synapse-light)/70", textColor: "text-blue-800/70", headingColor: "text-blue-900" },
        { label: "Total GST", value: formatINR(totals.gst), icon: Percent, bg: "bg-blue-50/50", border: "border-blue-100", iconColor: "text-(--color-synapse-light)/70", textColor: "text-blue-800/70", headingColor: "text-blue-900" },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 pb-3 sm:grid-cols-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${stat.bg} p-4 rounded-2xl border ${stat.border} shadow-sm transition-all hover:scale-[1.02] cursor-default`}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                            <p className={`text-[11px] font-semibold ${stat.textColor} uppercase tracking-widest`}>
                                {stat.label}
                            </p>
                        </div>
                        <h3 className={`text-xl font-bold ${stat.headingColor} leading-none`}>
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
