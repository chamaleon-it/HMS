import { useMemo } from "react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import {
    Receipt,
    Pill,
    Syringe,
    AlertCircle,
    Stethoscope,
    Wallet,
    Banknote,
    CreditCard,
    Smartphone,
    BadgePercent,
} from "lucide-react";
import { accountantLineBucket } from "../accountantBilling";

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
    }[]
}

export default function Statistics({ billing }: StatisticsProps) {
    const totals = useMemo(() => {
        let consulting = 0;
        let pharmacy = 0;
        let procedure = 0;
        let reception = 0;
        let cash = 0;
        let card = 0;
        let upi = 0;
        let discount = 0;
        let due = 0;

        billing.forEach((bill) => {
            const isReturn = bill.transactionType === "Return" || bill.transactionType === "Refund";
            const multiplier = isReturn ? -1 : 1;

            cash += (bill.cash || 0) * multiplier;
            card += (bill.card || 0) * multiplier;
            upi += (bill.upi || 0) * multiplier;
            discount += (bill.discount || 0) * multiplier;

            let billTotal = 0;
            bill.items.forEach((item) => {
                const itemTotal = (item.total || 0) * multiplier;
                billTotal += itemTotal;
                const bucket = accountantLineBucket(bill, item);
                if (bucket === "consulting") consulting += itemTotal;
                else if (bucket === "procedure") procedure += itemTotal;
                else if (bucket === "reception") reception += itemTotal;
                else pharmacy += itemTotal;
            });

            const roundOffVal = bill.roundOff ? getDecimal(Math.abs(billTotal)) * multiplier : 0;
            due += billTotal - roundOffVal - (((bill.cash || 0) + (bill.card || 0) + (bill.upi || 0) + (bill.discount || 0)) * multiplier);
        });

        return {
            totalBills: billing.length,
            consulting,
            pharmacy,
            procedure,
            reception,
            cash,
            card,
            upi,
            discount,
            due,
        };
    }, [billing]);

    const stats = [
        { label: "Total Bills", value: totals.totalBills, icon: Receipt, bg: "bg-blue-50/50", border: "border-blue-100", iconColor: "text-(--color-synapse-light)/70", textColor: "text-blue-800/70", headingColor: "text-blue-900" },
        { label: "Consulting Fees", value: formatINR(totals.consulting), icon: Stethoscope, bg: "bg-purple-50/50", border: "border-purple-100", iconColor: "text-purple-600/70", textColor: "text-purple-800/70", headingColor: "text-purple-900" },
        { label: "Pharmacy Sales", value: formatINR(totals.pharmacy), icon: Pill, bg: "bg-emerald-50/50", border: "border-emerald-100", iconColor: "text-emerald-600/70", textColor: "text-emerald-800/70", headingColor: "text-emerald-900" },
        { label: "Procedure Fees", value: formatINR(totals.procedure), icon: Syringe, bg: "bg-amber-50/50", border: "border-amber-100", iconColor: "text-amber-600/70", textColor: "text-amber-800/70", headingColor: "text-amber-900" },
        { label: "Reception Fees", value: formatINR(totals.reception), icon: Wallet, bg: "bg-orange-50/50", border: "border-orange-100", iconColor: "text-orange-600/70", textColor: "text-orange-800/70", headingColor: "text-orange-900" },
        { label: "Cash", value: formatINR(totals.cash), icon: Banknote, bg: "bg-teal-50/50", border: "border-teal-100", iconColor: "text-teal-600/70", textColor: "text-teal-800/70", headingColor: "text-teal-900" },
        { label: "Card", value: formatINR(totals.card), icon: CreditCard, bg: "bg-violet-50/50", border: "border-violet-100", iconColor: "text-violet-600/70", textColor: "text-violet-800/70", headingColor: "text-violet-900" },
        { label: "UPI", value: formatINR(totals.upi), icon: Smartphone, bg: "bg-sky-50/50", border: "border-sky-100", iconColor: "text-sky-600/70", textColor: "text-sky-800/70", headingColor: "text-sky-900" },
        { label: "Discount", value: formatINR(totals.discount), icon: BadgePercent, bg: "bg-slate-50/80", border: "border-slate-200", iconColor: "text-slate-500", textColor: "text-slate-600", headingColor: "text-slate-900" },
        { label: "Due Amount", value: formatINR(totals.due), icon: AlertCircle, bg: "bg-rose-50/50", border: "border-rose-100", iconColor: "text-rose-600/70", textColor: "text-rose-800/70", headingColor: "text-rose-900" },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 lg:grid-cols-5">
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
