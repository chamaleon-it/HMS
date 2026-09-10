import { useMemo } from "react";
import { getDecimal } from "@/lib/fNumber";

export interface BillItem {
    name?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface CalculationOptions {
    items: BillItem[];
    discount: number;
    roundOff?: boolean;
    payments?: {
        cash: number;
        online: number;
    };
}

export const useBillCalculations = ({
    items,
    discount,
    payments = { cash: 0, online: 0 },
}: CalculationOptions) => {
    const calculations = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const totalGst = 0;
        const itemsTotal = items.reduce((acc, item) => acc + (item.total ?? (item.quantity * item.unitPrice)), 0);

        const roundOffAmount = 0;
        const finalTotal = Math.max(0, itemsTotal - discount);

        const totalPaid = (payments.cash || 0) + (payments.online || 0);
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
    }, [items, discount, payments.cash, payments.online]);

    return calculations;
};
