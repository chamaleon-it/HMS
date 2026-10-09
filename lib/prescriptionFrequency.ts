export const PRESCRIPTION_FREQUENCY_OPTIONS = [
  "1-0-1",
  "1-1-1",
  "0-1-1",
  "1-0-0",
  "0-0-1",
  "L/A",
  "1oz-0-1oz",
  "1sp-0-1sp",
  "SOS",
  "Weekly 1's",
  "Weekly 3's",
];

/** Food timing choices. "Bed Time" replaces the older "With food" label. */
export const PRESCRIPTION_FOOD_OPTIONS = [
  "After food",
  "Before food",
  "Bed Time",
  "Empty stomach",
  "Anytime",
];

/**
 * Stored prescription text that should still display under the current label.
 * The saved value is left unchanged until someone picks the new option.
 */
const PRESCRIPTION_LABEL_ALIASES: Record<string, string> = {
  "Weakly 1s": "Weekly 1's",
  "Weakly 1's": "Weekly 1's",
  "weakly 1s": "Weekly 1's",
  "weakly 1's": "Weekly 1's",
  "With food": "Bed Time",
  "with food": "Bed Time",
  "weekly 3's": "Weekly 3's",
};

export function prescriptionChoiceLabel(
  stored: string | null | undefined,
): string {
  if (!stored) return "";
  return PRESCRIPTION_LABEL_ALIASES[stored] ?? stored;
}

/** Shared dosage list for doctor, pharmacy, and reception prescription dropdowns. */
export const PRESCRIPTION_DOSAGE_OPTIONS = [
  "½ tab",
  "1 tab",
  "2 tab",
  "1",
  "5 ml",
  "10 ml",
  "20 ml",
  "30 ml",
];

const QUANTITY_ONE_DOSAGES = new Set(["1", "5 ml", "10 ml", "20 ml", "30 ml"]);

/** Shared duration list for doctor and pharmacy prescription dropdowns. */
export const PRESCRIPTION_DURATION_OPTIONS = [
  "3 days",
  "5 days",
  "6 days",
  "7 days",
  "9 days",
  "10 days",
  "12 days",
  "14 days",
  "15 days",
  "21 days",
  "24 days",
  "28 days",
  "30 days",
  "45 days",
  "60 days",
];

const TABLET_UNITS: Record<string, number> = {
  "½ tab": 0.5,
  "1 tab": 1,
  "2 tab": 2,
};

const DURATION_DAYS: Record<string, number> = Object.fromEntries(
  PRESCRIPTION_DURATION_OPTIONS.map((label) => [
    label,
    Number.parseInt(label, 10),
  ]),
);

/** Doses per day for morning-noon-night patterns. */
const DOSES_PER_DAY: Record<string, number> = {
  "1-0-1": 2,
  "1-1-1": 3,
  "0-1-1": 2,
  "1-0-0": 1,
  "0-0-1": 1,
};

export function dosageSetsQuantityToOne(dosage: string): boolean {
  return QUANTITY_ONE_DOSAGES.has(dosage);
}

export function frequencySetsQuantityToOne(frequency: string): boolean {
  return (
    frequency === "1oz-0-1oz" ||
    frequency === "1sp-0-1sp" ||
    frequency === "L/A"
  );
}

/** ml, plain "1", ounce, spoon, and L/A keep quantity at 1 instead of a tablet total. */
export function selectionKeepsQuantityAtOne(
  dosage: string,
  frequency: string,
): boolean {
  return dosageSetsQuantityToOne(dosage) || frequencySetsQuantityToOne(frequency);
}

/**
 * True only on the change that enters a quantity-1 dosage or frequency.
 * Later edits to quantity stay as the user left them.
 */
export function selectionJustSetQuantityToOne(
  previous: { dosage: string; frequency: string },
  next: { dosage: string; frequency: string },
): boolean {
  const dosageEntered =
    dosageSetsQuantityToOne(next.dosage) && previous.dosage !== next.dosage;
  const frequencyEntered =
    frequencySetsQuantityToOne(next.frequency) &&
    previous.frequency !== next.frequency;
  return dosageEntered || frequencyEntered;
}

/**
 * Tablet quantity = dosage units × days × doses per day.
 * Null when dosage or frequency is not a numeric tablet pattern
 * (including ml, plain "1", ounce, spoon, L/A, and SOS).
 */
export function derivedTabletQuantity(
  dosage: string,
  duration: string,
  frequency: string,
): number | null {
  const units = TABLET_UNITS[dosage];
  const doses = DOSES_PER_DAY[frequency];
  if (units == null || doses == null) return null;
  const days =
    duration in DURATION_DAYS ? DURATION_DAYS[duration] : Number(duration) || 0;
  return Math.ceil(units * days * doses);
}
