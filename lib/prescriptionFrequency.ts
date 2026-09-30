export const PRESCRIPTION_FREQUENCY_OPTIONS = [
  "1-0-1",
  "1-1-1",
  "0-1-1",
  "1-0-0",
  "0-0-1",
  "2-0-2",
  "1oz-0-1oz",
  "1sp-0-1sp",
  "SOS",
];

const TABLET_UNITS: Record<string, number> = {
  "½ tab": 0.5,
  "1 tab": 1,
  "2 tab": 2,
};

const DURATION_DAYS: Record<string, number> = {
  "3 days": 3,
  "5 days": 5,
  "7 days": 7,
  "10 days": 10,
  "14 days": 14,
  "28 days": 28,
};

/** Doses per day for morning-noon-night patterns. 2-0-2 is morning 2, noon 0, night 2. */
const DOSES_PER_DAY: Record<string, number> = {
  "1-0-1": 2,
  "1-1-1": 3,
  "0-1-1": 2,
  "1-0-0": 1,
  "0-0-1": 1,
  "2-0-2": 4,
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
