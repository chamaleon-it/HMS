import { accountantBillKind } from "../app/dashboard/accountant/billing/accountantBilling.ts";

export interface InvoiceAuditTax {
  sgst: number;
  cgst: number;
  gst: number;
}

const ZERO_TAX: InvoiceAuditTax = { sgst: 0, cgst: 0, gst: 0 };

/**
 * A row is pharmacy only when the accountant billing classifier says so.
 * Reception, procedure, therapy, and every other kind are not.
 */
export function isPharmacyAuditInvoice(bill: unknown): boolean {
  return accountantBillKind(bill) === "pharmacy";
}

/** Pharmacy only: SGST and CGST are each 2.5% of the invoice total. GST equals their sum (5%). */
export function splitInvoiceGst(total: number): InvoiceAuditTax {
  const amount = Number.isFinite(total) ? total : 0;
  const sgst = (amount * 2.5) / 100;
  const cgst = (amount * 2.5) / 100;
  return { sgst, cgst, gst: sgst + cgst };
}

/** Per invoice row. Non-pharmacy rows, including reception, procedure, and therapy, are zero. */
export function invoiceAuditRowTax(total: number, bill: unknown): InvoiceAuditTax {
  if (!isPharmacyAuditInvoice(bill)) return { ...ZERO_TAX };
  return splitInvoiceGst(total);
}

/** Summary cards: sum the values already shown on each row. Non-pharmacy rows add nothing. */
export function sumInvoiceAuditTax(rows: InvoiceAuditTax[]): InvoiceAuditTax {
  let sgst = 0;
  let cgst = 0;
  let gst = 0;
  for (const row of rows) {
    sgst += Number.isFinite(row?.sgst) ? row.sgst : 0;
    cgst += Number.isFinite(row?.cgst) ? row.cgst : 0;
    gst += Number.isFinite(row?.gst) ? row.gst : 0;
  }
  return { sgst, cgst, gst };
}
