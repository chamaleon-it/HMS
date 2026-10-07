import assert from "node:assert/strict";
import test from "node:test";
import {
  isProcedureOrTherapyLine,
  matchesPharmacyBillingTypeFilter,
  pharmacyBillingBadge,
  pharmacyPageBillKind,
} from "./billTypeUtils.ts";

test("a medicine whose name contains therapy, massage, or treatment stays Pharmacy", () => {
  for (const name of ["Pain therapy oil", "Massage liniment", "Wound treatment cream"]) {
    const bill = { items: [{ name }], note: "apply daily" };
    assert.equal(pharmacyPageBillKind(bill), "pharmacy");
    assert.equal(pharmacyBillingBadge(bill).label, "Pharmacy");
    assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), true);
    assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), false);
    assert.equal(isProcedureOrTherapyLine(bill, bill.items[0]), false);
  }
});

test("a note that merely mentions therapy does not relabel a medicine sale", () => {
  const bill = {
    note: "advised therapy, massage, and treatment",
    items: [{ name: "Paracetamol", batchNumber: "B1" }],
  };
  assert.equal(pharmacyBillingBadge(bill).label, "Pharmacy");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), false);
});

test("a stocked product keeps Pharmacy even when the name is a service word", () => {
  const bill = {
    items: [{ name: { _id: "med1", name: "Shirodhara oil" }, batchNumber: "B9" }],
  };
  assert.equal(pharmacyBillingBadge(bill).label, "Pharmacy");
  assert.equal(pharmacyPageBillKind(bill), "pharmacy");
});

test("a therapy session is Therapy and is included in the Procedure filter", () => {
  const bill = {
    note: "Therapy Session #1",
    items: [{ name: "Kizhi" }],
  };
  assert.equal(pharmacyBillingBadge(bill).label, "Therapy Bill");
  assert.equal(pharmacyPageBillKind(bill), "procedure");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), false);
  assert.equal(isProcedureOrTherapyLine(bill, bill.items[0]), true);
});

test("a procedure session is Procedure Bill", () => {
  const bill = {
    note: "Procedure Session #2",
    items: [{ name: "Suturing" }],
  };
  assert.equal(pharmacyBillingBadge(bill).label, "Procedure Bill");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), false);
});

test("an exact therapy service line is Therapy Bill", () => {
  const bill = { items: [{ name: "Shirodhara" }] };
  assert.equal(pharmacyBillingBadge(bill).label, "Therapy Bill");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), true);
});

test("a mixed bill with a medicine and a real therapy line stays Therapy", () => {
  const bill = {
    items: [
      { name: "Paracetamol", batchNumber: "B1" },
      { name: "Kizhi" },
    ],
  };
  assert.equal(pharmacyBillingBadge(bill).label, "Therapy Bill");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), false);
  assert.equal(isProcedureOrTherapyLine(bill, bill.items[0]), false);
  assert.equal(isProcedureOrTherapyLine(bill, bill.items[1]), true);
});

test("an ordinary pharmacy sale stays Pharmacy under All Type and Pharmacy", () => {
  const bill = { items: [{ name: "Paracetamol" }] };
  assert.equal(pharmacyBillingBadge(bill).label, "Pharmacy");
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "all"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "pharmacy"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(bill, "procedure"), false);
});
