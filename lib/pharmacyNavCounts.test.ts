import assert from "node:assert/strict";
import test from "node:test";
import {
  isPharmacyDashboardPath,
  isPharmacyTreatmentsPath,
  labelWithCount,
  nextSeenAt,
  ordersSincePath,
  treatmentsSincePath,
} from "./pharmacyNavCounts.js";

const earlierOrders = "2026-10-11T08:00:00.000Z";
const earlierTreatments = "2026-10-11T09:00:00.000Z";
const now = "2026-10-12T10:00:00.000Z";

test("hides a zero count and shows the real number", () => {
  assert.equal(labelWithCount("Dashboard", 0), "Dashboard");
  assert.equal(labelWithCount("Dashboard", 1), "Dashboard (1)");
  assert.equal(labelWithCount("Dashboard", 3), "Dashboard (3)");
  assert.equal(labelWithCount("Treatments", 1), "Treatments (1)");
  assert.equal(labelWithCount("Inventory", -2), "Inventory");
});

test("opening Dashboard clears only the order baseline", () => {
  const next = nextSeenAt({
    pathname: "/dashboard/pharmacy/",
    ordersSeenAt: earlierOrders,
    treatmentsSeenAt: earlierTreatments,
    now,
  });
  assert.equal(isPharmacyDashboardPath("/dashboard/pharmacy/"), true);
  assert.equal(isPharmacyTreatmentsPath("/dashboard/pharmacy/"), false);
  assert.equal(next.ordersSeenAt, now);
  assert.equal(next.treatmentsSeenAt, earlierTreatments);
});

test("opening Treatments clears only the treatment baseline", () => {
  const next = nextSeenAt({
    pathname: "/dashboard/pharmacy/treatments",
    ordersSeenAt: earlierOrders,
    treatmentsSeenAt: earlierTreatments,
    now,
  });
  assert.equal(next.ordersSeenAt, earlierOrders);
  assert.equal(next.treatmentsSeenAt, now);
});

test("other pharmacy pages keep both baselines", () => {
  const next = nextSeenAt({
    pathname: "/dashboard/pharmacy/inventory/",
    ordersSeenAt: earlierOrders,
    treatmentsSeenAt: earlierTreatments,
    now,
  });
  assert.equal(next.ordersSeenAt, earlierOrders);
  assert.equal(next.treatmentsSeenAt, earlierTreatments);
});

test("a missing baseline starts now so older records are not all new", () => {
  const next = nextSeenAt({
    pathname: "/dashboard/pharmacy/billing",
    ordersSeenAt: null,
    treatmentsSeenAt: null,
    now,
  });
  assert.equal(next.ordersSeenAt, now);
  assert.equal(next.treatmentsSeenAt, now);
});

test("poll urls ask the same lists for records created after the baseline", () => {
  assert.equal(
    ordersSincePath(now),
    `/pharmacy/orders?page=1&limit=1&since=${encodeURIComponent(now)}`,
  );
  assert.equal(
    treatmentsSincePath(now),
    `/treatment?page=1&limit=1&since=${encodeURIComponent(now)}`,
  );
});
