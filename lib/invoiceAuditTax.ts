export interface InvoiceAuditTax {
  sgst: number;
  cgst: number;
  gst: number;
}

/** SGST and CGST are each 2.5% of the invoice total. GST equals their sum (5%). */
export function splitInvoiceGst(total: number): InvoiceAuditTax {
  const amount = Number.isFinite(total) ? total : 0;
  const sgst = (amount * 2.5) / 100;
  const cgst = (amount * 2.5) / 100;
  return { sgst, cgst, gst: sgst + cgst };
}
