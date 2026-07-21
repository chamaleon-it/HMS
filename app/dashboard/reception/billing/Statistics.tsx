import { useMemo } from "react";
import { formatINR, getDecimal } from "@/lib/fNumber";
import {
    Receipt,
    UserRound,
    Pill,
    Syringe,
    Wallet,
    AlertCircle,
    Stethoscope
} from "lucide-react";
import useSWR from "swr";

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
    }[]
}

export default function Statistics({ billing }: StatisticsProps) {
    const {
        totalBills,
        consultingFee,
        paidAmount,
        dueAmount,
        totalConsultation
    } = useMemo(() => {
        let consult = 0;
        let paid = 0;
        let due = 0;
        let totalConsultation = 0;

        billing.forEach(bill => {
            paid += (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0);

            let billTotal = 0;
            bill.items.forEach(item => {
                const itemTotal = item.total || 0;
                billTotal += itemTotal;

                if (item.name.toLowerCase().includes("consultation")) {
                    consult += itemTotal;
                    totalConsultation += 1;
                }
            });

            const roundOffVal = bill.roundOff ? getDecimal(billTotal) : 0;
            due += (billTotal - roundOffVal - (bill.upi + bill.cash + bill.card + (bill.discount ?? 0)));
        });

        return {
            totalBills: billing.length,
            consultingFee: consult,
            paidAmount: paid,
            dueAmount: due,
            totalConsultation: totalConsultation
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
            label: "Total Consultations",
            value: totalConsultation,
            icon: UserRound,
            bg: "bg-synapse-light/10/50",
            border: "border-[var(--color-synapse-light)]/20",
            iconColor: "text-(--color-synapse-light)/70",
            textColor: "text-(--color-synapse-light)/70",
            headingColor: "text-(--color-synapse-light)"
        },
        {
            label: "Consulting Fees",
            value: formatINR(consultingFee),
            icon: UserRound,
            bg: "bg-synapse-light/10/50",
            border: "border-[var(--color-synapse-light)]/20",
            iconColor: "text-(--color-synapse-light)/70",
            textColor: "text-(--color-synapse-light)/70",
            headingColor: "text-(--color-synapse-light)"
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
    ], [totalBills, totalConsultation, consultingFee, dueAmount]);


    return (

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3">

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