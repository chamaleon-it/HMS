import assert from "node:assert/strict";
import test from "node:test";
import { billDoctorLabel } from "./billDoctor.js";

test("pharmacy doctor object stays the visible name", () => {
  assert.equal(billDoctorLabel({ doctor: { name: "Mukhthar" } }), "Mukhthar");
});

test("a placeholder doctor falls through to the patient doctor", () => {
  assert.equal(
    billDoctorLabel({
      doctor: "-",
      therapistName: "Shadan",
      patient: { doctor: { name: "Mukhthar" } },
    }),
    "Mukhthar",
  );
});

test("the visit doctor is used before the patient doctor", () => {
  assert.equal(
    billDoctorLabel({
      doctor: null,
      visit: { doctor: { name: "Mukhthar" } },
      patient: { doctor: { name: "Someone Else" } },
      therapistName: "Ali Abrar",
    }),
    "Mukhthar",
  );
});

test("the therapist is not shown as the doctor", () => {
  assert.equal(
    billDoctorLabel({
      doctor: "Self",
      therapistName: "Shadan",
    }),
    "",
  );
});

test("a doctor name is not replaced by a role label", () => {
  assert.equal(
    billDoctorLabel({ doctorName: "Ali Abrar", doctor: "Doctor" }),
    "Ali Abrar",
  );
});
