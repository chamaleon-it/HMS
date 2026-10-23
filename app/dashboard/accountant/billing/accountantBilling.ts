import {
  getBillType,
  hasMedicineItems,
  isProcedureOrTherapyLine,
  isReceptionFeeBill,
  itemDisplayName,
} from "../../../../lib/billTypeUtils.ts";
import { getDecimal } from "../../../../lib/fNumber.ts";

export type AccountantBillKind = "pharmacy" | "procedure" | "reception" | "other";
export type AccountantPaymentStatus = "Paid" | "Partial" | "Unpaid" | "Refund" | "Return";

type BillLike = {
  billingCategory?: string;
  note?: string;
  items?: { name?: string; total?: number }[];
  transactionType?: string;
  user?: { role?: string };
  creator?: { role?: string };
  therapistName?: string;
  roundOff?: boolean;
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
};

/** Procedure is therapy plus procedure. Pharmacy is a medicine sale. Reception is the front desk. */
export function accountantBillKind(bill: any | null | undefined): AccountantBillKind {
  if (!bill) return "other";
  if (bill.billingCategory === "Procedure" || String(bill.therapistName || "").trim()) return "procedure";
  if (bill.billingCategory === "Pharmacy") return "pharmacy";
  if (bill.billingCategory === "Reception") return "reception";
  if (bill.billingCategory === "Other") return "other";
  const type = getBillType(bill);
  if (type === "therapy" || type === "procedure") return "procedure";

  const role = String(bill.user?.role || bill.creator?.role || "").toLowerCase();
  if (role.includes("pharmacy")) return "pharmacy";
  if (role.includes("reception")) return "reception";
  if (bill.transactionType === "Refund" || bill.transactionType === "Return") return "pharmacy";

  const reception = isReceptionFeeBill(bill);
  const medicine = hasMedicineItems(bill.items);
  if (medicine && !reception) return "pharmacy";
  if (reception || type === "reception") return "reception";
  if (medicine) return "pharmacy";

  return "other";
}

export function matchesAccountantType(
  bill: BillLike | null | undefined,
  billType: string | null | undefined,
): boolean {
  const filter = billType || "all";
  if (filter === "all") return true;
  return accountantBillKind(bill) === filter;
}

export function accountantPaymentStatus(bill: BillLike | null | undefined): AccountantPaymentStatus {
  if (!bill) return "Unpaid";
  const names = (bill.items || []).map((item) => itemDisplayName(item).toLowerCase());
  if (bill.transactionType === "Refund" || names.some((name) => name.includes("refund"))) {
    return "Refund";
  }
  if (bill.transactionType === "Return") return "Return";

  const itemsTotal = (bill.items || []).reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const roundOffAmount = bill.roundOff ? getDecimal(itemsTotal) : 0;
  const netTotal = itemsTotal - roundOffAmount;
  const totalPaid = (bill.cash || 0) + (bill.card || 0) + (bill.upi || 0) + (bill.discount || 0);

  if (netTotal - totalPaid <= 0.01) return "Paid";
  if (totalPaid <= 0.01) return "Unpaid";
  return "Partial";
}

export function matchesAccountantStatus(
  bill: BillLike | null | undefined,
  status: string | null | undefined,
): boolean {
  const filter = status || "all";
  if (filter === "all") return true;
  return accountantPaymentStatus(bill) === filter;
}

export function billTherapistName(bill: { therapistName?: string } | null | undefined): string {
  const name = String(bill?.therapistName || "").trim();
  if (!name || name === "-") return "";
  return name;
}

export function matchesAccountantTherapist(
  bill: { therapistName?: string } | null | undefined,
  therapist: string | null | undefined,
): boolean {
  const wanted = String(therapist || "").trim().toLowerCase();
  if (!wanted) return true;
  return billTherapistName(bill).toLowerCase() === wanted;
}

export type AccountantFeeBucket = "consulting" | "procedure" | "reception" | "pharmacy";

/** Keep every line of a reception bill in Reception Fees, including consultation charges. */
export function accountantLineBucket(
  bill: {
    billingCategory?: string;
    note?: string;
    items?: { name?: unknown }[];
    transactionType?: string;
    therapistName?: string;
    user?: { role?: string };
    creator?: { role?: string };
  } | null | undefined,
  item: { name?: unknown } | null | undefined,
): AccountantFeeBucket {
  if (isProcedureOrTherapyLine(bill, item)) return "procedure";
  if (accountantBillKind(bill) === "reception") return "reception";
  if (bill?.billingCategory === "Pharmacy") return "pharmacy";
  const name = itemDisplayName(item).toLowerCase();
  if (name.includes("consultation") || name.includes("consulting")) return "consulting";
  if (
    name.includes("registration") ||
    name.includes("reception") ||
    name.includes("ncf") ||
    name.includes("refund") ||
    name.includes("fee") ||
    name.includes("opd") ||
    name.includes("doctor") ||
    name.includes("token")
  ) {
    return "reception";
  }
  return "pharmacy";
}
