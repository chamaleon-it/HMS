/**
 * Patient Registration Bill figures.
 *
 * Valid Upto is stored on the visit. A free revisit must print that date,
 * not this visit's date plus the window. The fee and the amount in words
 * both use the same paid-versus-zero decision.
 */

const CONSULTATION_VALIDITY_DAYS = 10;

function addCalendarDays(date, days) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
      12,
      0,
      0,
      0,
    ),
  );
}

function clinicNoon(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));
  const read = (type) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(read("year"), read("month") - 1, read("day"), 12, 0, 0, 0));
}

/**
 * Valid Upto for the thermal bill.
 * A stored end date is printed as that clinic day. An unpaid visit with no
 * stored date must not become this visit plus 10 days.
 */
export function registrationBillValidUpto(visitDate, consultationValidUntil, options) {
  if (consultationValidUntil) {
    const stored = new Date(consultationValidUntil);
    if (!Number.isNaN(stored.getTime())) return clinicNoon(stored);
  }
  if (options?.unpaid) return null;
  const visit = visitDate ? new Date(visitDate) : new Date();
  const base = Number.isNaN(visit.getTime()) ? new Date() : visit;
  return addCalendarDays(base, CONSULTATION_VALIDITY_DAYS);
}

export function formatRegistrationBillDay(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function registrationConsultationFee(row) {
  const isFeeZero =
    row?.hasConsultationFee === false ||
    row?.isRefunded === true ||
    Boolean(row?.refundReason);
  if (isFeeZero) return 0;
  return typeof row?.consultationFee === "number" ? row.consultationFee : 200;
}

export function registrationAmountInWords(fee, amountInWords) {
  if (!fee) return "ZERO only";
  return amountInWords;
}
