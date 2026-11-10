import assert from "node:assert/strict";
import test from "node:test";
import {
  accountantBillKind,
  accountantInvoiceTotal,
  accountantLineBucket,
  accountantSummaryCards,
  matchesAccountantStatus,
  matchesAccountantType,
} from "./accountantBilling.ts";

test("pharmacy refunds stay in the all-bills list and pharmacy totals", () => {
  const refund = {
    transactionType: "Refund",
    billingCategory: "Pharmacy",
    note: "Therapy Package Refund for Invoice INV-00003",
    items: [{ name: "Refund - THERAPY OIL", total: 60 }],
    cash: 60,
  };

  assert.equal(accountantBillKind(refund), "pharmacy");
  assert.equal(matchesAccountantType(refund, "all"), true);
  assert.equal(matchesAccountantType(refund, "pharmacy"), true);
  assert.equal(matchesAccountantStatus(refund, "all"), true);
  assert.equal(accountantLineBucket(refund, refund.items[0]), "pharmacy");
  assert.equal(accountantBillKind({ ...refund, billingCategory: undefined, creator: { role: "Pharmacy" } }), "pharmacy");
});

test("procedure and reception refunds keep their source category", () => {
  const item = { name: "Refund - Acupuncture", total: 60 };
  assert.equal(accountantBillKind({ billingCategory: "Procedure", transactionType: "Refund", items: [item] }), "procedure");
  assert.equal(accountantLineBucket({ billingCategory: "Procedure" }, item), "procedure");
  assert.equal(accountantBillKind({ billingCategory: "Reception", transactionType: "Refund", items: [item] }), "reception");
  assert.equal(accountantLineBucket({ billingCategory: "Reception" }, item), "reception");
});

test("all lines on a reception bill count as reception fees", () => {
  const bill = {
    billingCategory: "Reception",
    items: [
      { name: "Consultation Fee", total: 200 },
      { name: "Registration Fee", total: 50 },
      { name: "Miscellaneous charge", total: 25 },
    ],
  };

  assert.equal(accountantBillKind(bill), "reception");
  assert.deepEqual(bill.items.map((item) => accountantLineBucket(bill, item)), [
    "reception",
    "reception",
    "reception",
  ]);
  assert.equal(accountantLineBucket({ creator: { role: "Receptionist" }, items: bill.items }, bill.items[0]), "reception");
});

test("summary cards use each invoice total for billed amount and tax", () => {
  const cards = accountantSummaryCards([
    { items: [{ total: 1620 }], cash: 1620 },
    { items: [{ total: 354.76 }], cash: 354, discount: 0.76 },
    { items: [{ total: 100.4 }], roundOff: true, cash: 50, upi: 20 },
  ]);

  assert.equal(accountantInvoiceTotal({ items: [{ total: 100.4 }], roundOff: true }), 100);
  assert.equal(cards.totalBilled, 1620 + 354.76 + 100);
  assert.equal(cards.totalCollected, 1620 + 354 + 70);
  assert.equal(cards.cash, 1620 + 354 + 50);
  assert.equal(cards.upi, 20);
  assert.equal(cards.discount, 0.76);
  assert.equal(cards.totalOutstanding, 100 - 70);
  assert.equal(cards.sgst, (1620 * 2.5) / 100 + (354.76 * 2.5) / 100 + (100 * 2.5) / 100);
  assert.equal(cards.cgst, cards.sgst);
  assert.equal(cards.gst, (1620 * 5) / 100 + (354.76 * 5) / 100 + (100 * 5) / 100);
  assert.equal(accountantSummaryCards([]).gst, 0);
});
