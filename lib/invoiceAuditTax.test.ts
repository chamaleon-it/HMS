import assert from "node:assert/strict";
import test from "node:test";
import { invoiceAuditRowTax, splitInvoiceGst, sumInvoiceAuditTax } from "./invoiceAuditTax.ts";

test("pharmacy rows are 2.5 percent SGST, 2.5 percent CGST, and 5 percent GST", () => {
  const row = invoiceAuditRowTax(1620, { billingCategory: "Pharmacy" });
  assert.equal(row.sgst, 40.5);
  assert.equal(row.cgst, 40.5);
  assert.equal(row.gst, 81);
  assert.equal(row.gst, row.sgst + row.cgst);
  assert.equal(row.gst, (1620 * 5) / 100);
});

test("pharmacy tax follows a non-integer invoice total", () => {
  const total = 354.76;
  const row = invoiceAuditRowTax(total, { billingCategory: "Pharmacy" });
  assert.equal(row.sgst, (total * 2.5) / 100);
  assert.equal(row.cgst, (total * 2.5) / 100);
  assert.equal(row.gst, row.sgst + row.cgst);
});

test("reception, procedure, therapy, and other rows have no GST", () => {
  const total = 1620;
  const untaxed = [
    { billingCategory: "Reception" },
    { billingCategory: "Procedure" },
    { billingCategory: "Other" },
    { billingCategory: "Pharmacy", therapistName: "Anita" },
    { note: "Therapy session #3", items: [{ name: "Abhyangam" }] },
    { therapistName: "Anita", items: [{ name: "Acupuncture" }] },
  ];

  for (const bill of untaxed) {
    assert.deepEqual(invoiceAuditRowTax(total, bill), { sgst: 0, cgst: 0, gst: 0 });
  }
});

test("summary cards sum the per-row tax, so non-pharmacy rows add nothing", () => {
  const rows = [
    invoiceAuditRowTax(1620, { billingCategory: "Pharmacy" }),
    invoiceAuditRowTax(1000, { billingCategory: "Reception" }),
    invoiceAuditRowTax(400, { billingCategory: "Procedure" }),
    invoiceAuditRowTax(200, { note: "Therapy session #1", items: [{ name: "Abhyangam" }] }),
    invoiceAuditRowTax(354.76, { billingCategory: "Pharmacy" }),
    invoiceAuditRowTax(0, { billingCategory: "Pharmacy" }),
    invoiceAuditRowTax(Number.NaN, { billingCategory: "Pharmacy" }),
  ];
  const sum = sumInvoiceAuditTax(rows);

  assert.equal(sum.sgst, 40.5 + (354.76 * 2.5) / 100);
  assert.equal(sum.cgst, sum.sgst);
  assert.equal(sum.gst, sum.sgst + sum.cgst);
  assert.equal(sum.gst, rows.reduce((acc, row) => acc + row.gst, 0));
  assert.deepEqual(sumInvoiceAuditTax([]), { sgst: 0, cgst: 0, gst: 0 });
});

test("pharmacy column sums are the sums of the per-row tax amounts", () => {
  const totals = [1620, 140, 354.76, 0];
  const rows = totals.map((total) => splitInvoiceGst(total));
  const sum = sumInvoiceAuditTax(rows);
  const billed = totals.reduce((acc, total) => acc + total, 0);

  assert.ok(Math.abs(sum.sgst - (billed * 2.5) / 100) < 1e-9);
  assert.equal(sum.cgst, sum.sgst);
  assert.equal(sum.gst, sum.sgst + sum.cgst);
  assert.equal(splitInvoiceGst(0).gst, 0);
  assert.equal(splitInvoiceGst(Number.NaN).gst, 0);
});
