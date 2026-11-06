import assert from "node:assert/strict";
import test from "node:test";
import { receptionBillingTotals } from "./receptionBillingTotals.ts";

test("payment cards and footer share totals for sales, mixed payments, refunds and discounts", () => {
  assert.deepEqual(receptionBillingTotals([
    { transactionType: "Sale", cash: 500, upi: 1000, card: 200, discount: 50 },
    { transactionType: "Return", cash: 100, discount: 10 },
    { transactionType: "Refund", upi: 200 },
    { items: [{ name: "Consultation Refund" }], card: 50 },
    {},
  ]), { totalCash: 400, totalUpi: 800, totalCard: 150, totalDiscount: 60 });
  assert.deepEqual(receptionBillingTotals([]), {
    totalCash: 0, totalUpi: 0, totalCard: 0, totalDiscount: 0,
  });
});
