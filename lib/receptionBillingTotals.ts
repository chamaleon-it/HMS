type PaymentBill = {
  cash?: number;
  upi?: number;
  card?: number;
  discount?: number;
  transactionType?: string;
  items?: { name?: string }[];
};

export function isNegativeBill(bill: PaymentBill) {
  return bill.transactionType === "Return" ||
    bill.transactionType === "Refund" ||
    !!bill.items?.some((item) => item.name?.toLowerCase().includes("refund"));
}

export function receptionBillingTotals(billing: PaymentBill[]) {
  return billing.reduce((totals, bill) => {
    const sign = isNegativeBill(bill) ? -1 : 1;
    totals.totalCash += sign * (bill.cash ?? 0);
    totals.totalUpi += sign * (bill.upi ?? 0);
    totals.totalCard += sign * (bill.card ?? 0);
    totals.totalDiscount += bill.discount ?? 0;
    return totals;
  }, { totalCash: 0, totalUpi: 0, totalCard: 0, totalDiscount: 0 });
}
