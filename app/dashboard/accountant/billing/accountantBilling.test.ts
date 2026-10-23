import assert from "node:assert/strict";
import test from "node:test";
import {
  accountantBillKind,
  accountantLineBucket,
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
