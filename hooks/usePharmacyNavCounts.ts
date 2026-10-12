"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import {
  PHARMACY_NAV_POLL_MS,
  PHARMACY_ORDERS_SEEN_KEY,
  PHARMACY_TREATMENTS_SEEN_KEY,
  nextSeenAt,
  ordersSincePath,
  treatmentsSincePath,
} from "@/lib/pharmacyNavCounts";

function isPharmacyNavRole(role: string | undefined): boolean {
  return role === "Pharmacy" || role === "Pharmacy Wholesaler";
}

function positiveTotal(total: unknown): number {
  const n = Math.floor(Number(total));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Polls the pharmacy order list and the treatment list every 5 seconds.
 * A record counts when its createdAt is after the last time this browser
 * opened that page. Opening one page does not clear the other count.
 */
export function usePharmacyNavCounts(role: string | undefined, pathname: string | null) {
  const enabled = isPharmacyNavRole(role);
  const [ordersSeenAt, setOrdersSeenAt] = useState<string | null>(null);
  const [treatmentsSeenAt, setTreatmentsSeenAt] = useState<string | null>(null);

  const syncBaselines = useCallback(
    (currentPath: string | null, force?: "orders" | "treatments") => {
      if (!enabled || typeof window === "undefined") return;
      const now = new Date().toISOString();
      const ordersPrev = window.localStorage.getItem(PHARMACY_ORDERS_SEEN_KEY);
      const treatmentsPrev = window.localStorage.getItem(PHARMACY_TREATMENTS_SEEN_KEY);
      const path =
        force === "orders"
          ? "/dashboard/pharmacy"
          : force === "treatments"
            ? "/dashboard/pharmacy/treatments"
            : currentPath;
      const next = nextSeenAt({
        pathname: path,
        ordersSeenAt: ordersPrev,
        treatmentsSeenAt: treatmentsPrev,
        now,
      });
      window.localStorage.setItem(PHARMACY_ORDERS_SEEN_KEY, next.ordersSeenAt);
      window.localStorage.setItem(PHARMACY_TREATMENTS_SEEN_KEY, next.treatmentsSeenAt);
      setOrdersSeenAt(next.ordersSeenAt);
      setTreatmentsSeenAt(next.treatmentsSeenAt);
    },
    [enabled],
  );

  useEffect(() => {
    syncBaselines(pathname);
  }, [pathname, syncBaselines]);

  const markOrdersSeen = useCallback(() => {
    syncBaselines(pathname, "orders");
  }, [pathname, syncBaselines]);

  const markTreatmentsSeen = useCallback(() => {
    syncBaselines(pathname, "treatments");
  }, [pathname, syncBaselines]);

  const { data: ordersData } = useSWR<{ total?: number }>(
    enabled && ordersSeenAt ? ordersSincePath(ordersSeenAt) : null,
    { refreshInterval: PHARMACY_NAV_POLL_MS },
  );
  const { data: treatmentsData } = useSWR<{ total?: number }>(
    enabled && treatmentsSeenAt ? treatmentsSincePath(treatmentsSeenAt) : null,
    { refreshInterval: PHARMACY_NAV_POLL_MS },
  );

  return {
    ordersCount: positiveTotal(ordersData?.total),
    treatmentsCount: positiveTotal(treatmentsData?.total),
    markOrdersSeen,
    markTreatmentsSeen,
  };
}
