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
        online: number;
        insurance: number;
    };
}

export const useBillCalculations = ({
    items,
    discount,
    roundOff,
    payments = { cash: 0, online: 0, insurance: 0 },
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

        const totalPaid = payments.cash + payments.online + payments.insurance;
        const dueAmount = finalTotal - totalPaid;

        return {
            subtotal,
            totalGst,
            itemsTotal,
            roundOffAmount,
            finalTotal,
            totalPaid,
            dueAmount,
        };
    }, [items, discount, roundOff, payments.cash, payments.online, payments.insurance]);

    return calculations;
};
