import { useMemo } from "react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import {
    Receipt,
    Pill,
    Syringe,
    AlertCircle,
    Banknote,
    CreditCard,
    Smartphone,
} from "lucide-react";
import { pharmacyLineMoney } from "@/lib/pharmacyReceiptLine";
import { isProcedureOrTherapyLine, itemDisplayName, pharmacyPageBillKind } from "@/lib/billTypeUtils";

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
        transactionType?: "Return" | "Sale";
    }[]
}

export default function Statistics({ billing }: StatisticsProps) {
    const {
        totalBills,
        procedureFee,
        pharmacyFee,
        dueAmount,
        cashTotal,
        cardTotal,
        upiTotal,
    } = useMemo(() => {
        let procItemsSum = 0;
        let pharm = 0;
        let due = 0;
        let cashTotal = 0;
        let cardTotal = 0;
        let upiTotal = 0;
        let visibleBills = 0;

        billing.forEach(bill => {
            if (pharmacyPageBillKind(bill) === "hidden") return;
            visibleBills += 1;

            const isReturn = bill.transactionType === "Return";
            const multiplier = isReturn ? -1 : 1;

            cashTotal += (bill.cash || 0) * multiplier;
            cardTotal += (bill.card || 0) * multiplier;
            upiTotal += (bill.upi || 0) * multiplier;

            let billTotal = 0;
            bill.items.forEach(item => {
                const itemTotal = pharmacyLineMoney(item).net * multiplier;
                const name = itemDisplayName(item).toLowerCase();
                const receptionLine =
                    name.includes("consultation") ||
                    name.includes("registration") ||
                    name.includes("ncf") ||
                    name.includes("refund") ||
                    name.includes("fee") ||
                    name.includes("opd") ||
                    name.includes("doctor") ||
                    name.includes("token");

                if (isProcedureOrTherapyLine(bill, item)) {
                    procItemsSum += itemTotal;
                    billTotal += itemTotal;
                } else if (!receptionLine) {
                    pharm += itemTotal;
                    billTotal += itemTotal;
                }
            });

            const roundOffVal = bill.roundOff ? getDecimal(Math.abs(billTotal)) * multiplier : 0;
            due += (billTotal - roundOffVal - (((bill.cash || 0) + (bill.card || 0) + (bill.upi || 0) + (bill.discount || 0)) * multiplier));
        });

        return {
            totalBills: visibleBills,
            procedureFee: procItemsSum,
            pharmacyFee: pharm,
            dueAmount: due,
            cashTotal,
            cardTotal,
            upiTotal,
        };
    }, [billing]);

    const stats = useMemo(() => [
        {
            label: "Total Bills",
            value: totalBills,
            icon: Receipt,
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            iconColor: "text-(--color-synapse-light)/70",
            textColor: "text-blue-800/70",
            headingColor: "text-blue-900"
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
            label: "Cash",
            value: formatINR(cashTotal),
            icon: Banknote,
            bg: "bg-teal-50/50",
            border: "border-teal-100",
            iconColor: "text-teal-600/70",
            textColor: "text-teal-800/70",
            headingColor: "text-teal-900"
        },
        {
            label: "Card",
            value: formatINR(cardTotal),
            icon: CreditCard,
            bg: "bg-violet-50/50",
            border: "border-violet-100",
            iconColor: "text-violet-600/70",
            textColor: "text-violet-800/70",
            headingColor: "text-violet-900"
        },
        {
            label: "UPI",
            value: formatINR(upiTotal),
            icon: Smartphone,
            bg: "bg-sky-50/50",
            border: "border-sky-100",
            iconColor: "text-sky-600/70",
            textColor: "text-sky-800/70",
            headingColor: "text-sky-900"
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
    ], [totalBills, pharmacyFee, procedureFee, dueAmount, cashTotal, cardTotal, upiTotal]);


    return (

        <div className="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-4 xl:grid-cols-7">

            {stats.map((stat, index) => (
                <div
                    key={index}
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
