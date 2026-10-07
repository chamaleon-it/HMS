import assert from "node:assert/strict";
import test from "node:test";
import {
  digestiveSelectionFromStored,
  digestiveSystemForSave,
  toggleDigestiveSelection,
} from "./digestiveSystem.ts";
import { prescriptionChoiceLabel } from "./prescriptionFrequency.ts";

test("loads a legacy single digestive string", () => {
  assert.deepEqual(digestiveSelectionFromStored("GERD"), ["GERD"]);
});

test("loads a saved digestive list", () => {
  assert.deepEqual(digestiveSelectionFromStored(["Bloating", "GERD"]), [
    "Bloating",
    "GERD",
  ]);
});

test("Normal clears Bloating, APD, and GERD", () => {
  assert.deepEqual(
    toggleDigestiveSelection(["Bloating", "GERD"], "Normal"),
    ["Normal"],
  );
});

test("a symptom clears Normal and can combine with other symptoms", () => {
  assert.deepEqual(toggleDigestiveSelection(["Normal"], "Bloating"), [
    "Bloating",
  ]);
  assert.deepEqual(
    toggleDigestiveSelection(["Bloating"], "GERD"),
    ["Bloating", "GERD"],
  );
});

test("clicking a selected symptom removes only that symptom", () => {
  assert.deepEqual(
    toggleDigestiveSelection(["Bloating", "APD", "GERD"], "APD"),
    ["Bloating", "GERD"],
  );
});

test("an empty digestive selection is stored as null", () => {
  assert.equal(digestiveSystemForSave([]), null);
  assert.deepEqual(digestiveSystemForSave(["Bloating", "GERD"]), [
    "Bloating",
    "GERD",
  ]);
});

test("legacy prescription words stay readable under the new labels", () => {
  assert.equal(prescriptionChoiceLabel("Weakly 1s"), "Weekly 1's");
  assert.equal(prescriptionChoiceLabel("Weakly 1's"), "Weekly 1's");
  assert.equal(prescriptionChoiceLabel("With food"), "Bed Time");
  assert.equal(prescriptionChoiceLabel("After food"), "After food");
  assert.equal(prescriptionChoiceLabel("1-0-1"), "1-0-1");
});
