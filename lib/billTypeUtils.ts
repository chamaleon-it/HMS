export type BillTypeCategory = "all" | "therapy" | "procedure" | "reception" | "other";

export function getBillType(b: {
  note?: string;
  items?: { name: string }[];
  transactionType?: string;
}): "therapy" | "procedure" | "reception" | "other" {
  if (!b) return "reception";

  const noteStr = String(b.note || "").toLowerCase();
  const itemNames = (b.items || []).map((i) => String(i.name || "").toLowerCase());

  // 1. Therapy Bills (prescribed therapies, acupuncture, panchakarma, etc.)
  const isTherapy =
    noteStr.includes("therapy") ||
    itemNames.some(
      (name) =>
        name.includes("therapy") ||
        name.includes("acupuncture") ||
        name.includes("panchakarma") ||
        name.includes("cupping") ||
        name.includes("moxibustion") ||
        name.includes("varmam") ||
        name.includes("physio") ||
        name.includes("kizhi") ||
        name.includes("massage") ||
        name.includes("treatment")
    );

  if (isTherapy) return "therapy";

  // 2. Procedure Bills (prescribed procedures, sub-procedures)
  const isProcedure =
    noteStr.includes("procedure") ||
    itemNames.some((name) => name.includes("procedure"));

  if (isProcedure) return "procedure";

  // 3. Reception Bills (consultation fees, registration fees, refunds, NCF bills, etc.)
  const isReception =
    b.transactionType === "Refund" ||
    b.transactionType === "Return" ||
    noteStr.includes("consultation") ||
    noteStr.includes("reception") ||
    noteStr.includes("registration") ||
    noteStr.includes("ncf") ||
    noteStr.includes("refund") ||
    itemNames.length === 0 ||
    itemNames.some(
      (name) =>
        name.includes("consultation") ||
        name.includes("registration") ||
        name.includes("ncf") ||
        name.includes("refund") ||
        name.includes("fee") ||
        name.includes("opd") ||
        name.includes("doctor") ||
        name.includes("token")
    );

  if (isReception) return "reception";

  return "other";
}

/** Generated when a therapy or procedure session is billed. Not a free-text note. */
const THERAPY_SESSION_NOTE = /^\s*therapy\s+session\s+#\s*\d+\s*$/i;
const PROCEDURE_SESSION_NOTE = /^\s*procedure\s+session\s+#\s*\d+\s*$/i;

/**
 * Whole service names. Words such as therapy, massage, treatment, and
 * procedure are intentionally absent: a medicine name that merely contains
 * them is still a medicine.
 */
const THERAPY_SERVICE_NAMES = new Set([
  "acupuncture",
  "panchakarma",
  "cupping",
  "hijama",
  "moxibustion",
  "varmam",
  "varma",
  "physio",
  "physiotherapy",
  "kizhi",
  "elakizhi",
  "podikizhi",
  "njavarakizhi",
  "abhyangam",
  "abhyanga",
  "shirodhara",
  "takradhara",
  "ksheeradhara",
  "dhara",
  "vasti",
  "basti",
  "kativasti",
  "januvasti",
  "greevavasti",
  "matravasti",
  "nasya",
  "nasyam",
  "raktamokshana",
  "udvarthanam",
  "udvartana",
  "pizhichil",
  "thalam",
  "talam",
  "lepanam",
  "lepa",
  "tarpanam",
  "tarpana",
  "pichu",
  "karna poorana",
  "karnapooranam",
  "fasad",
  "agni karma",
  "agnikarma",
  "steam bath",
  "swedana",
  "swedanam",
]);

function serviceKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A stocked medicine line, even when its product name contains a service word. */
export function isStockedMedicine(item: {
  name?: unknown;
  batchNumber?: unknown;
  expiryDate?: unknown;
  generic?: unknown;
} | null | undefined): boolean {
  if (!item) return false;
  const name = item.name;
  if (name && typeof name === "object" && ("_id" in name || "name" in name)) {
    return true;
  }
  if (String(item.batchNumber || "").trim()) return true;
  if (item.expiryDate) return true;
  if (String(item.generic || "").trim()) return true;
  return false;
}

export function sessionServiceKind(note: unknown): "therapy" | "procedure" | null {
  const text = String(note || "");
  if (THERAPY_SESSION_NOTE.test(text)) return "therapy";
  if (PROCEDURE_SESSION_NOTE.test(text)) return "procedure";
  return null;
}

export function isRealTherapyLine(item: { name?: unknown; batchNumber?: unknown; expiryDate?: unknown; generic?: unknown } | null | undefined): boolean {
  if (!item || isStockedMedicine(item)) return false;
  return THERAPY_SERVICE_NAMES.has(serviceKey(itemDisplayName(item)));
}

export function isRealProcedureLine(item: { name?: unknown; batchNumber?: unknown; expiryDate?: unknown; generic?: unknown } | null | undefined): boolean {
  if (!item || isStockedMedicine(item)) return false;
  return serviceKey(itemDisplayName(item)) === "procedure";
}

/**
 * Therapy or procedure for the pharmacy billing page.
 * A session note counts only with a non-medicine line. A medicine whose name
 * or the bill note merely contains therapy, massage, treatment, or procedure
 * is not a service. When both a real service and a medicine are present, the
 * service wins: therapy first, then procedure.
 */
export function pharmacyServiceKind(bill: {
  note?: string;
  items?: { name?: unknown; batchNumber?: unknown; expiryDate?: unknown; generic?: unknown }[];
} | null | undefined): "therapy" | "procedure" | null {
  if (!bill) return null;
  const items = Array.isArray(bill.items) ? bill.items : [];
  const session = sessionServiceKind(bill.note);
  const therapyLine = items.some((item) => isRealTherapyLine(item));
  const procedureLine = items.some((item) => isRealProcedureLine(item));
  const sessionLine = items.some(
    (item) => itemDisplayName(item) && !isStockedMedicine(item),
  );

  if (therapyLine || (session === "therapy" && sessionLine)) return "therapy";
  if (procedureLine || (session === "procedure" && sessionLine)) return "procedure";
  return null;
}

export function itemDisplayName(item: { name?: unknown } | null | undefined): string {
  if (!item || item.name == null) return "";
  if (typeof item.name === "string") return item.name;
  if (typeof item.name === "object" && item.name && "name" in item.name) {
    return String((item.name as { name?: unknown }).name ?? "");
  }
  return String(item.name);
}

/**
 * Procedure and therapy charges use the bill line amount.
 * A stocked medicine is never a service line. A session bill stores
 * "Therapy Session #n" or "Procedure Session #n" and puts the amount on the
 * non-medicine line. A product name that merely contains therapy, massage,
 * treatment, or procedure is not a service.
 */
export function isProcedureOrTherapyLine(
  bill: { note?: string; items?: { name?: unknown }[] } | null | undefined,
  item: { name?: unknown; batchNumber?: unknown; expiryDate?: unknown; generic?: unknown } | null | undefined,
): boolean {
  if (!item || isStockedMedicine(item)) return false;
  if (!pharmacyServiceKind(bill)) return false;
  if (isRealTherapyLine(item) || isRealProcedureLine(item)) return true;
  if (!sessionServiceKind(bill?.note)) return false;
  return Boolean(itemDisplayName(item));
}

/**
 * Reception fee content: consultation, registration, NCF, and the same
 * item-name markers getBillType uses. Refund/Return alone is not enough —
 * a medicine return is a pharmacy bill that getBillType still calls reception.
 */
export function isReceptionFeeBill(bill: {
  note?: string;
  items?: { name?: unknown }[];
} | null | undefined): boolean {
  if (!bill) return false;
  const noteStr = String(bill.note || "").toLowerCase();
  const itemNames = (bill.items || []).map((item) => itemDisplayName(item).toLowerCase());
  if (
    noteStr.includes("consultation") ||
    noteStr.includes("reception") ||
    noteStr.includes("registration") ||
    noteStr.includes("ncf") ||
    noteStr.includes("refund")
  ) {
    return true;
  }
  if (itemNames.length === 0) return true;
  return itemNames.some(
    (name) =>
      name.includes("consultation") ||
      name.includes("registration") ||
      name.includes("ncf") ||
      name.includes("refund") ||
      name.includes("fee") ||
      name.includes("opd") ||
      name.includes("doctor") ||
      name.includes("token"),
  );
}

export type PharmacyPageBillKind = "pharmacy" | "procedure" | "hidden";

function hasNamedProduct(bill: { items?: { name?: unknown }[] } | null | undefined): boolean {
  return (bill?.items || []).some((item) => {
    const name = itemDisplayName(item);
    if (!name) return false;
    if (isRealTherapyLine(item) || isRealProcedureLine(item)) return false;
    return true;
  });
}

/**
 * Pharmacy billing page only.
 * Procedure = a real therapy or procedure (session note or exact service line).
 * Pharmacy = a medicine sale, including a product whose name contains
 * therapy, massage, treatment, or procedure.
 * A bill with both a medicine and a real service stays therapy or procedure.
 * Reception fees, empty bills, and unrelated non-medicine bills are hidden.
 */
export function pharmacyPageBillKind(bill: any | null | undefined): PharmacyPageBillKind {
  if (!bill) return "hidden";
  if (pharmacyServiceKind(bill)) return "procedure";
  if ((bill.items || []).some((item: { name?: unknown }) => isStockedMedicine(item))) {
    return "pharmacy";
  }
  if (isReceptionFeeBill(bill)) return "hidden";
  const type = getBillType(bill);
  if (type === "reception" && !hasMedicineItems(bill.items) && !hasNamedProduct(bill)) {
    return "hidden";
  }
  if (hasMedicineItems(bill.items) || hasNamedProduct(bill)) return "pharmacy";
  const role = String(bill.user?.role || bill.creator?.role || "").toLowerCase();
  if (role.includes("pharmacy")) return "pharmacy";
  return "hidden";
}

/** Pharmacy billing pills: All Type, Pharmacy, Procedure. Reception never matches. */
export function matchesPharmacyBillingTypeFilter(
  bill: {
    note?: string;
    items?: { name?: string }[];
    transactionType?: string;
    user?: { role?: string };
    creator?: { role?: string };
  },
  billType: string | null | undefined,
): boolean {
  const kind = pharmacyPageBillKind(bill);
  if (kind === "hidden") return false;
  const filter = billType || "all";
  if (filter === "all") return true;
  if (filter === "pharmacy") return kind === "pharmacy";
  if (filter === "procedure") return kind === "procedure";
  return false;
}

/**
 * Query value understood by the billing API.
 * All Type is pharmacy sales plus procedure/therapy, with reception omitted.
 * Procedure on this page is therapy + procedure.
 */
export function pharmacyBillingTypeQueryParam(
  billType: string | null | undefined,
): string | null {
  const filter = billType || "all";
  if (filter === "all") return "counter";
  if (filter === "pharmacy") return "pharmacy";
  if (filter === "procedure") return "treatment";
  return filter;
}

export function pharmacyBillingBadge(bill: any): { label: string; className: string } {
  const service = pharmacyServiceKind(bill);
  if (service === "therapy" || service === "procedure") {
    return getBillTypeBadgeProps(service);
  }
  if (pharmacyPageBillKind(bill) === "pharmacy") {
    return {
      label: "Pharmacy",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    };
  }
  return getBillTypeBadgeProps("other");
}

export function getBillTypeBadgeProps(type: "therapy" | "procedure" | "reception" | "other") {
  switch (type) {
    case "therapy":
      return {
        label: "Therapy Bill",
        className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      };
    case "procedure":
      return {
        label: "Procedure Bill",
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      };
    case "reception":
      return {
        label: "Reception Bill",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "other":
    default:
      return {
        label: "Other Bill",
        className: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
  }
}

export function isMedicineItem(item: any): boolean {
  if (!item) return false;

  if (typeof item.name === "object" && item.name !== null && (item.name._id || item.name.name)) {
    return true;
  }

  const nameStr = String(
    typeof item.name === "string"
      ? item.name
      : (item.name?.name || item.medicineName || "")
  ).toLowerCase().trim();

  if (!nameStr) return false;

  const nonMedicineKeywords = [
    // Consultation & Fees
    "consultation",
    "consulting",
    "doctor fee",
    "opd",
    "ipd",
    "registration",
    "token",
    "ncf",

    // Lab & Diagnostics
    "lab",
    "laboratory",
    "investigation",
    "test",
    "blood",
    "ecg",
    "x-ray",
    "xray",
    "ct scan",
    "mri",
    "scan",
    "ultrasound",
    "usg",

    // Therapies & Procedures
    "therapy",
    "therapies",
    "procedure",
    "procedures",
    "procedural",
    "treatment",
    "fasad",
    "agni karma",
    "agnikarma",
    "steam bath",
    "swedana",
    "swedanam",
    "kizhi",
    "elakizhi",
    "podikizhi",
    "njavarakizhi",
    "abhyangam",
    "abhyanga",
    "shirodhara",
    "takradhara",
    "ksheeradhara",
    "dhara",
    "vasti",
    "basti",
    "kativasti",
    "januvasti",
    "greevavasti",
    "matravasti",
    "nasya",
    "nasyam",
    "raktamokshana",
    "udvarthanam",
    "udvartana",
    "pizhichil",
    "thalam",
    "talam",
    "lepanam",
    "lepa",
    "tarpanam",
    "tarpana",
    "pichu",
    "karna poorana",
    "karnapooranam",
    "acupuncture",
    "panchakarma",
    "cupping",
    "hijama",
    "moxibustion",
    "varmam",
    "varma",
    "physio",
    "physiotherapy",
    "massage",

    // Refunds & Returns
    "refund",
    "return",
  ];

  return !nonMedicineKeywords.some((kw) => nameStr.includes(kw));
}

export function hasMedicineItems(items?: any[]): boolean {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  return items.some(isMedicineItem);
}

export function isPharmacyBill(bill: any): boolean {
  if (!bill) return false;

  const billType = getBillType(bill);
  if (billType === "therapy" || billType === "procedure") {
    return true;
  }

  // 1. If user/creator role is populated
  const userRole = String(
    bill.user?.role || bill.creator?.role || ""
  ).toLowerCase();

  if (userRole.includes("pharmacy")) {
    return true;
  }

  // 2. Explicit other roles
  if (
    userRole === "doctor" ||
    userRole === "lab" ||
    userRole === "reception"
  ) {
    return false;
  }

  // 3. Exclude lab report bills or reception token bills
  if (bill.reportId || bill.tokenNumber || bill.token) {
    return false;
  }

  // 4. Consultation and registration bills stay on reception.
  if (billType === "reception") {
    return false;
  }

  // 5. Must have medicine items
  return hasMedicineItems(bill.items);
}

