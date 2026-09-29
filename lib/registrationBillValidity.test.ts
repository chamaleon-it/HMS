import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRegistrationBillDay,
  registrationAmountInWords,
  registrationBillValidUpto,
  registrationConsultationFee,
} from "./registrationBillValidity.js";

function day(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function morning(isoDay: string): string {
  return `${isoDay}T04:30:00.000Z`;
}

test("1. a paid visit on the 15th prints Valid Upto the 25th and the consultation fee", () => {
  const validUpto = registrationBillValidUpto(morning("2026-09-15"), null);
  const fee = registrationConsultationFee({
    hasConsultationFee: true,
    consultationFee: 200,
  });

  assert.equal(day(validUpto), "2026-09-25");
  assert.equal(fee, 200);
  assert.equal(registrationAmountInWords(fee, "TWO HUNDRED only"), "TWO HUNDRED only");
});

test("2. a visit on the 20th keeps Valid Upto the 25th and prints a zero fee", () => {
  const validUpto = registrationBillValidUpto(
    morning("2026-09-20"),
    "2026-09-25T12:00:00.000Z",
  );
  const fee = registrationConsultationFee({ hasConsultationFee: false, consultationFee: 200 });

  assert.equal(day(validUpto), "2026-09-25");
  assert.equal(fee, 0);
  assert.equal(registrationAmountInWords(fee, "TWO HUNDRED only"), "ZERO only");
});

test("3. a visit on the Valid Upto date stays inside the window", () => {
  const validUpto = registrationBillValidUpto(
    morning("2026-09-25"),
    "2026-09-25T12:00:00.000Z",
  );
  const fee = registrationConsultationFee({ hasConsultationFee: false, consultationFee: 200 });

  assert.equal(day(validUpto), "2026-09-25");
  assert.equal(fee, 0);
  assert.equal(registrationAmountInWords(fee, "TWO HUNDRED only"), "ZERO only");
});

test("4. a visit on the 30th after the window prints a new calendar end date", () => {
  const september = registrationBillValidUpto(morning("2026-09-30"), null);
  const october = registrationBillValidUpto(morning("2026-10-30"), null);
  const fee = registrationConsultationFee({
    hasConsultationFee: true,
    consultationFee: 200,
  });

  assert.equal(day(september), "2026-10-10");
  assert.equal(day(october), "2026-11-09");
  assert.equal(fee, 200);
});

test("paid 01/01/2026 prints Valid Upto 11/01/2026", () => {
  const validUpto = registrationBillValidUpto(morning("2026-01-01"), null);
  assert.equal(day(validUpto), "2026-01-11");
});

test("a zero-fee visit on 01/10/2026 keeps stored Valid Upto 09/10/2026", () => {
  const validUpto = registrationBillValidUpto(
    morning("2026-10-01"),
    "2026-10-09T12:00:00.000Z",
    { unpaid: true },
  );
  const fee = registrationConsultationFee({ hasConsultationFee: false, consultationFee: 200 });

  if (!validUpto) {
    throw new Error("expected the stored Valid Upto");
  }
  assert.equal(day(validUpto), "2026-10-09");
  assert.notEqual(day(validUpto), "2026-10-11");
  assert.equal(fee, 0);
  assert.equal(registrationAmountInWords(fee, "TWO HUNDRED only"), "ZERO only");
});

test("an unpaid visit with no stored end date does not print the visit plus 10 days", () => {
  const validUpto = registrationBillValidUpto(morning("2026-10-01"), null, { unpaid: true });
  assert.equal(validUpto, null);
  assert.equal(formatRegistrationBillDay(validUpto), "—");
});

test("5. paid 25/09/2026 is Valid Upto 05/10/2026; the 29/09 revisit keeps 05/10 and a zero amount", () => {
  const paidUntil = registrationBillValidUpto(morning("2026-09-25"), null);
  const paidFee = registrationConsultationFee({
    hasConsultationFee: true,
    consultationFee: 200,
  });
  const revisitUntil = registrationBillValidUpto(
    morning("2026-09-29"),
    paidUntil.toISOString(),
  );
  const revisitFee = registrationConsultationFee({
    hasConsultationFee: false,
    consultationFee: 200,
  });

  assert.equal(day(paidUntil), "2026-10-05");
  assert.equal(paidFee, 200);
  assert.equal(registrationAmountInWords(paidFee, "TWO HUNDRED only"), "TWO HUNDRED only");
  assert.equal(day(revisitUntil), "2026-10-05");
  assert.notEqual(day(revisitUntil), "2026-10-09");
  assert.equal(revisitFee, 0);
  assert.equal(registrationAmountInWords(revisitFee, "TWO HUNDRED only"), "ZERO only");
});
