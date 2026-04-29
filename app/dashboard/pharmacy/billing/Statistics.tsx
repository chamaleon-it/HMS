import { formatINR, getDecimal } from "@/lib/fNumber";
import {
    Receipt,
    UserRound,
    Pill,
    Syringe,
    Wallet,
    AlertCircle
} from "lucide-react";
import useSWR from "swr";

interface StatisticsProps {
    billing: {
        roundOff: boolean;
        _id: string;
        mrn: string;
        createdAt: Date;
        cash: number;
        online: number;
        insurance: number;
        discount: number;
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
    }[]
}

export default function Statistics({ billing }: StatisticsProps) {

    const { data: billingItemsResponse } = useSWR<{ data: { code: string, item: string, price: number, _id: string }[], message: string }>("/billing/billing_items")
    const billingItems = billingItemsResponse?.data ?? []

    const totalBills = billing.length
    const consultingFee = billing.reduce((acc, bill) => acc + (bill.items.reduce((a, b) => a + (b.name.toLowerCase().includes("consultation") ? b.total : 0), 0)), 0)
    const procedureFee = billing.reduce((acc, bill) => acc + (bill.items.reduce((a, b) => a + (billingItems.find((item) => item.item === b.name) ? b.total : 0), 0)), 0) - consultingFee
    const pharmacyFee = billing.reduce((acc, bill) => acc + (bill.items.reduce((a, b) => a + (b.total), 0)), 0) - consultingFee - procedureFee
    const paidAmount = billing.reduce((acc, bill) => acc + (bill.cash + bill.online + bill.insurance), 0)
    const dueAmount = billing.reduce((acc, b) =>
        acc + (b.items.reduce((a, x) => a + x.total, 0) -
            (b.roundOff ? getDecimal(b.items.reduce((a, x) => a + x.total, 0)) : 0) -
            (b.insurance + b.cash + b.online + (b.discount ?? 0))), 0
    )

    const stats = [
        {
            label: "Total Bills",
            value: totalBills ?? 0,
            icon: Receipt,
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            iconColor: "text-blue-600/70",
            textColor: "text-blue-800/70",
            headingColor: "text-blue-900"
        },
        {
            label: "Consulting Fees",
            value: formatINR(consultingFee ?? 0),
            icon: UserRound,
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            iconColor: "text-indigo-600/70",
            textColor: "text-indigo-800/70",
            headingColor: "text-indigo-900"
        },
        {
            label: "Pharmacy Sales",
            value: formatINR(pharmacyFee ?? 0),
            icon: Pill,
            bg: "bg-emerald-50/50",
            border: "border-emerald-100",
            iconColor: "text-emerald-600/70",
            textColor: "text-emerald-800/70",
            headingColor: "text-emerald-900"
        },
        {
            label: "Procedure Fees",
            value: formatINR(procedureFee ?? 0),
            icon: Syringe,
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            iconColor: "text-amber-600/70",
            textColor: "text-amber-800/70",
            headingColor: "text-amber-900"
        },
        // {
        //     label: "Total Amount",
        //     value: formatINR(0),
        //     icon: Wallet,
        //     bg: "bg-blue-50/50",
        //     border: "border-blue-100",
        //     iconColor: "text-blue-600/70",
        //     textColor: "text-blue-800/70",
        //     headingColor: "text-blue-900"
        // },
        {
            label: "Paid Amount",
            value: formatINR(paidAmount ?? 0),
            icon: Wallet,
            bg: "bg-teal-50/50",
            border: "border-teal-100",
            iconColor: "text-teal-600/70",
            textColor: "text-teal-800/70",
            headingColor: "text-teal-900"
        },
        {
            label: "Due Amount",
            value: formatINR(dueAmount ?? 0),
            icon: AlertCircle,
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            iconColor: "text-rose-600/70",
            textColor: "text-rose-800/70",
            headingColor: "text-rose-900"
        }
    ];

    return (
        <div className="grid grid-cols-6 gap-5 pb-5">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`${stat.bg} p-6 rounded-2xl border ${stat.border} shadow-sm transition-all hover:scale-[1.02] cursor-default`}
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
    )
}