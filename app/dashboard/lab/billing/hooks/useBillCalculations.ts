import { useMemo } from "react";
import { getDecimal } from "@/lib/fNumber";

export interface BillItem {
    name?: string;
    quantity: number;
    unitPrice: number;
    gst: number;
    total: number;
}

interface CalculationOptions {
    items: BillItem[];
    discount: number;
    roundOff: boolean;
    payments?: {
        cash: number;
        card: number;
        upi: number;
    };
}

export const useBillCalculations = ({
    items,
    discount,
    roundOff,
    payments = { cash: 0, card: 0, upi: 0 },
}: CalculationOptions) => {
    const calculations = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const totalGst = items.reduce(
            (acc, item) => acc + (item.quantity * item.unitPrice * item.gst) / 100,
            0
        );
        const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);

        const roundOffAmount = roundOff ? getDecimal(itemsTotal) : 0;
        const finalTotal = itemsTotal - roundOffAmount - discount;

        const totalPaid = (payments?.cash ?? 0) + (payments?.card ?? 0) + (payments?.upi ?? 0);
        const dueAmount = Math.max(0, finalTotal - totalPaid);

        return {
            subtotal,
            totalGst,
            itemsTotal,
            roundOffAmount,
            finalTotal,
            totalPaid,
            dueAmount,
        };
    }, [items, discount, roundOff, payments.cash, payments.card, payments.upi]);

    return calculations;
};
