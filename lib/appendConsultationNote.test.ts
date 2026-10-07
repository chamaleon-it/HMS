import assert from "node:assert/strict";
import test from "node:test";
import {
  appendConsultationNote,
  removeConsultationNote,
} from "./appendConsultationNote.ts";

test("a chip appends to existing present history", () => {
  assert.equal(
    appendConsultationNote("Fever, Cold", "Left Knee Pain"),
    "Fever, Cold, Left Knee Pain",
  );
});

test("the first chip fills an empty field", () => {
  assert.equal(appendConsultationNote("", "HTN"), "HTN");
  assert.equal(appendConsultationNote(null, "HTN"), "HTN");
});

test("selecting a chip that is already written does not duplicate it", () => {
  assert.equal(
    appendConsultationNote("Fever, Cold", "Cold"),
    "Fever, Cold",
  );
});

test("removing a chip keeps the rest of the note", () => {
  assert.equal(
    removeConsultationNote("Fever, Cold, Left Knee Pain", "Left Knee Pain"),
    "Fever, Cold",
  );
});
