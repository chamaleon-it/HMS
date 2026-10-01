export const PRESCRIPTION_FREQUENCY_OPTIONS = [
  "1-0-1",
  "1-1-1",
  "0-1-1",
  "1-0-0",
  "0-0-1",
  "1oz-0-1oz",
  "1sp-0-1sp",
  "SOS",
];

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

export function frequencySetsQuantityToOne(frequency: string): boolean {
  return frequency === "1oz-0-1oz" || frequency === "1sp-0-1sp";
}

/**
 * Tablet quantity = dosage units × days × doses per day.
 * Null when dosage or frequency is not a numeric pattern (including ounce, spoon, and SOS).
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
