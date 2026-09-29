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

export function registrationBillValidUpto(visitDate, consultationValidUntil) {
  if (consultationValidUntil) {
    const stored = new Date(consultationValidUntil);
    if (!Number.isNaN(stored.getTime())) return stored;
  }
  const visit = visitDate ? new Date(visitDate) : new Date();
  const base = Number.isNaN(visit.getTime()) ? new Date() : visit;
  return addCalendarDays(base, CONSULTATION_VALIDITY_DAYS);
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
