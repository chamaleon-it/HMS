import assert from "node:assert/strict";
import test from "node:test";
import { splitInvoiceGst, sumInvoiceAuditTax } from "./invoiceAuditTax.ts";

test("sgst and cgst are 2.5 percent of the invoice total and gst equals their sum", () => {
  const row = splitInvoiceGst(1620);
  assert.equal(row.sgst, 40.5);
  assert.equal(row.cgst, 40.5);
  assert.equal(row.gst, 81);
  assert.equal(row.gst, row.sgst + row.cgst);
  assert.equal(row.gst, (1620 * 5) / 100);
});

test("tax follows a non-integer invoice total", () => {
  const total = 354.76;
  const row = splitInvoiceGst(total);
  assert.equal(row.sgst, (total * 2.5) / 100);
  assert.equal(row.cgst, (total * 2.5) / 100);
  assert.equal(row.gst, row.sgst + row.cgst);
});

test("column sums are the sums of the per-row tax amounts", () => {
  const totals = [1620, 140, 354.76, 0];
  const rows = totals.map((total) => splitInvoiceGst(total));
  const sum = (key: "sgst" | "cgst" | "gst") => rows.reduce((acc, row) => acc + row[key], 0);
  const billed = totals.reduce((acc, total) => acc + total, 0);

  assert.ok(Math.abs(sum("sgst") - (billed * 2.5) / 100) < 1e-9);
  assert.equal(sum("cgst"), sum("sgst"));
  assert.equal(sum("gst"), sum("sgst") + sum("cgst"));
  assert.equal(splitInvoiceGst(0).gst, 0);
  assert.equal(splitInvoiceGst(Number.NaN).gst, 0);
});

test("summary tax cards sum 2.5 percent and 5 percent of each invoice total", () => {
  const totals = [1620, 140, 354.76];
  const sum = sumInvoiceAuditTax(totals);

  assert.equal(sum.sgst, 40.5 + 3.5 + (354.76 * 2.5) / 100);
  assert.equal(sum.cgst, sum.sgst);
  assert.equal(sum.gst, 81 + 7 + (354.76 * 5) / 100);
  assert.deepEqual(sumInvoiceAuditTax([]), { sgst: 0, cgst: 0, gst: 0 });
  assert.deepEqual(sumInvoiceAuditTax([Number.NaN]), { sgst: 0, cgst: 0, gst: 0 });
});
