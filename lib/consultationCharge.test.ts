import assert from "node:assert/strict";
import test from "node:test";
import {
  appointmentPaymentPanel,
  formatConsultationValidUntil,
} from "./consultationCharge.js";

test("shows payment before a patient, doctor, and date are chosen", () => {
  assert.equal(
    appointmentPaymentPanel({ ready: false, charge: false }),
    "fields",
  );
});

test("hides payment while the 10-day check is still loading", () => {
  assert.equal(
    appointmentPaymentPanel({ ready: true, charge: null }),
    "checking",
  );
});

test("hides payment when the consultation token is still valid", () => {
  assert.equal(appointmentPaymentPanel({ ready: true, charge: false }), "free");
});

test("shows payment when the window has ended", () => {
  assert.equal(appointmentPaymentPanel({ ready: true, charge: true }), "fields");
});

test("shows payment if the consultation check fails", () => {
  assert.equal(
    appointmentPaymentPanel({ ready: true, charge: false, failed: true }),
    "fields",
  );
});

test("formats the valid-until date in the clinic calendar", () => {
  assert.equal(
    formatConsultationValidUntil("2026-10-16T12:00:00.000Z"),
    "16 Oct 2026",
  );
});
