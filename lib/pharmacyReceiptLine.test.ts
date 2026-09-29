import assert from "node:assert/strict";
import test from "node:test";
import { presentPharmacyReceiptLine } from "./pharmacyReceiptLine.ts";

const doloBatch = {
  name: "Dolo",
  generic: "test",
  unitPrice: 0,
  batches: [
    {
      batchNumber: "DL-EXP-2027",
      unitPrice: 30,
      gst: 5,
      expiryDate: "2027-01-31",
      quantity: 57,
    },
  ],
};

test("qty 9 at unit price 30 does not render a blank price, a zero amount, or batch B0", () => {
  const line = presentPharmacyReceiptLine(
    {
      name: "Dolo",
      quantity: 9,
      unitPrice: 30,
      gst: 5,
      batchNumber: "B0",
      total: 0,
    },
    doloBatch,
  );

  assert.match(line.unitPriceLabel, /30/);
  assert.notEqual(line.unitPriceLabel.trim(), "₹");
  assert.equal(line.unitPrice, 30);
  assert.equal(line.taxable, 270);
  assert.match(line.amountLabel, /270/);
  assert.notEqual(line.amountLabel, "₹0");
  assert.doesNotMatch(line.amountLabel, /^₹0(?:\.00)?$/);
  assert.notEqual(line.batchLabel, "B0");
  assert.equal(line.batchLabel, "DL-EXP-2027");
  assert.equal(line.gst, 5);
  assert.equal(line.gstAmount, 13.5);
  assert.equal(line.net, 283.5);
});

test("a zero medicine price does not wipe the selected batch price", () => {
  const line = presentPharmacyReceiptLine(
    {
      name: "Dolo",
      quantity: 9,
      unitPrice: 0,
      gst: 0,
      batchNumber: "B0",
      total: 0,
    },
    doloBatch,
    5,
  );

  assert.equal(line.unitPrice, 30);
  assert.match(line.unitPriceLabel, /30/);
  assert.equal(line.taxable, 270);
  assert.notEqual(line.amountLabel, "₹0");
  assert.notEqual(line.batchLabel, "B0");
});
