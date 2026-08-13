export type BillTypeCategory = "all" | "therapy" | "reception" | "other";

export function getBillType(b: {
  note?: string;
  items?: { name: string }[];
  transactionType?: string;
}): "therapy" | "reception" | "other" {
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

  // 2. Reception Bills (consultation fees, registration fees, refunds, NCF bills, etc.)
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

export function getBillTypeBadgeProps(type: "therapy" | "reception" | "other") {
  switch (type) {
    case "therapy":
      return {
        label: "Therapy Bill",
        className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
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
