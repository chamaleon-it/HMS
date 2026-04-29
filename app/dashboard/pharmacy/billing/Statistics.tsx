import { useMemo } from "react";
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
    const { data: billingItemsResponse } = useSWR<{ data: { item: string }[] }>("/billing/billing_items");
    const billingItems = billingItemsResponse?.data ?? [];

    const {
        totalBills,
        consultingFee,
        procedureFee,
        pharmacyFee,
        paidAmount,
        dueAmount
    } = useMemo(() => {
        let consult = 0;
        let procItemsSum = 0;
        let pharm = 0;
        let paid = 0;
        let due = 0;

        const billingItemNames = new Set(billingItems.map(i => i.item));

        billing.forEach(bill => {
            paid += (bill.cash || 0) + (bill.online || 0) + (bill.insurance || 0);

            let billTotal = 0;
            bill.items.forEach(item => {
                const itemTotal = item.total || 0;
                billTotal += itemTotal;

                if (item.name.toLowerCase().includes("consultation")) {
                    consult += itemTotal;
                }

                if (billingItemNames.has(item.name)) {
                    procItemsSum += itemTotal;
                } else {
                    pharm += itemTotal;
                }
            });

            const roundOffVal = bill.roundOff ? getDecimal(billTotal) : 0;
            due += (billTotal - roundOffVal - (bill.insurance + bill.cash + bill.online + (bill.discount ?? 0)));
        });

        return {
            totalBills: billing.length,
            consultingFee: consult,
            procedureFee: procItemsSum - consult,
            pharmacyFee: pharm,
            paidAmount: paid,
            dueAmount: due
        };
    }, [billing, billingItems]);

    const stats = useMemo(() => [
        {
            label: "Total Bills",
            value: totalBills,
            icon: Receipt,
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            iconColor: "text-blue-600/70",
            textColor: "text-blue-800/70",
            headingColor: "text-blue-900"
        },
        {
            label: "Consulting Fees",
            value: formatINR(consultingFee),
            icon: UserRound,
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            iconColor: "text-indigo-600/70",
            textColor: "text-indigo-800/70",
            headingColor: "text-indigo-900"
        },
        {
            label: "Pharmacy Sales",
            value: formatINR(pharmacyFee),
            icon: Pill,
            bg: "bg-emerald-50/50",
            border: "border-emerald-100",
            iconColor: "text-emerald-600/70",
            textColor: "text-emerald-800/70",
            headingColor: "text-emerald-900"
        },
        {
            label: "Procedure Fees",
            value: formatINR(procedureFee),
            icon: Syringe,
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            iconColor: "text-amber-600/70",
            textColor: "text-amber-800/70",
            headingColor: "text-amber-900"
        },
        {
            label: "Paid Amount",
            value: formatINR(paidAmount),
            icon: Wallet,
            bg: "bg-teal-50/50",
            border: "border-teal-100",
            iconColor: "text-teal-600/70",
            textColor: "text-teal-800/70",
            headingColor: "text-teal-900"
        },
        {
            label: "Due Amount",
            value: formatINR(dueAmount),
            icon: AlertCircle,
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            iconColor: "text-rose-600/70",
            textColor: "text-rose-800/70",
            headingColor: "text-rose-900"
        }
    ], [totalBills, consultingFee, pharmacyFee, procedureFee, paidAmount, dueAmount]);

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
    );
}