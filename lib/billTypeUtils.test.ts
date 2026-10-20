import assert from "node:assert/strict";
import test from "node:test";
import {
  matchesPharmacyBillingTypeFilter,
  pharmacyBillingTypeQueryParam,
  pharmacyPageBillKind,
} from "./billTypeUtils.ts";

test("pharmacy billing list fetches refund bills for local classification", () => {
  assert.equal(pharmacyBillingTypeQueryParam("all"), null);
  assert.equal(pharmacyBillingTypeQueryParam("pharmacy"), null);
});

test("pharmacy refunds remain visible under Pharmacy", () => {
  const refund = {
    transactionType: "Refund",
    note: "Refund for Invoice INV-1",
    items: [{ name: "Refund - THERAPY OIL" }],
  };

  assert.equal(pharmacyPageBillKind(refund), "pharmacy");
  assert.equal(matchesPharmacyBillingTypeFilter(refund, "all"), true);
  assert.equal(matchesPharmacyBillingTypeFilter(refund, "pharmacy"), true);
});

test("therapy package refunds remain visible under Procedure", () => {
  const refund = {
    transactionType: "Refund",
    note: "Therapy Package Refund for Invoice INV-1",
    items: [{ name: "Refund - Acupuncture" }],
  };

  assert.equal(pharmacyPageBillKind(refund), "procedure");
  assert.equal(matchesPharmacyBillingTypeFilter(refund, "procedure"), true);
});
