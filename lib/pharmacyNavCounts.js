/**
 * Pharmacy nav badges.
 *
 * A new order is a pharmacy order created after this browser last opened
 * Dashboard. A new treatment is a treatment created after this browser last
 * opened Treatments. Opening one page does not move the other baseline.
 *
 * Plain JavaScript so the Node test can import it with a `.js` specifier.
 */

/** Browser baselines for pharmacy nav badges. New means created after this instant. */
export const PHARMACY_ORDERS_SEEN_KEY = "pharmacy-nav-orders-seen-at";
export const PHARMACY_TREATMENTS_SEEN_KEY = "pharmacy-nav-treatments-seen-at";

export const PHARMACY_NAV_POLL_MS = 5000;

/**
 * @param {string} label
 * @param {number} count
 */
export function labelWithCount(label, count) {
  const n = Math.floor(Number(count));
  if (!Number.isFinite(n) || n <= 0) return label;
  return `${label} (${n})`;
}

/** @param {string | null | undefined} pathname */
export function isPharmacyDashboardPath(pathname) {
  if (!pathname) return false;
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return path === "/dashboard/pharmacy";
}

/** @param {string | null | undefined} pathname */
export function isPharmacyTreatmentsPath(pathname) {
  if (!pathname) return false;
  return (
    pathname === "/dashboard/pharmacy/treatments" ||
    pathname.startsWith("/dashboard/pharmacy/treatments/")
  );
}

/**
 * Opening Dashboard rewrites only the order baseline.
 * Opening Treatments rewrites only the treatment baseline.
 * A missing baseline starts at `now`, so history from before this browser
 * started watching is not treated as new.
 *
 * @param {{
 *   pathname: string | null | undefined,
 *   ordersSeenAt: string | null,
 *   treatmentsSeenAt: string | null,
 *   now: string,
 * }} args
 * @returns {{ ordersSeenAt: string, treatmentsSeenAt: string }}
 */
export function nextSeenAt(args) {
  return {
    ordersSeenAt: isPharmacyDashboardPath(args.pathname)
      ? args.now
      : (args.ordersSeenAt ?? args.now),
    treatmentsSeenAt: isPharmacyTreatmentsPath(args.pathname)
      ? args.now
      : (args.treatmentsSeenAt ?? args.now),
  };
}

/** @param {string} since */
export function ordersSincePath(since) {
  const params = new URLSearchParams({
    page: "1",
    limit: "1",
    since,
  });
  return `/pharmacy/orders?${params.toString()}`;
}

/** @param {string} since */
export function treatmentsSincePath(since) {
  const params = new URLSearchParams({
    page: "1",
    limit: "1",
    since,
  });
  return `/treatment?${params.toString()}`;
}
