/**
 * Payment fields on Create Appointment.
 *
 * A patient whose consultation with this doctor is still inside the 10-day
 * window does not pay, so the cash / card / UPI / discount fields stay hidden.
 * Until the check returns, the fields stay hidden too, so a free visit cannot
 * collect money in the gap. A failed check falls back to showing payment.
 *
 * Plain JavaScript so the Node test can import it with a `.js` specifier.
 */

/** @typedef {"fields" | "free" | "checking"} AppointmentPaymentPanel */

/**
 * @param {{ ready: boolean, charge?: boolean | null, failed?: boolean }} input
 * @returns {AppointmentPaymentPanel}
 */
export function appointmentPaymentPanel(input) {
  if (!input.ready || input.failed) return "fields";
  if (typeof input.charge !== "boolean") return "checking";
  return input.charge ? "fields" : "free";
}

/**
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatConsultationValidUntil(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
