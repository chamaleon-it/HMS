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

/** Summary cards: sum each invoice's own tax. GST is 5% of each total. */
export function sumInvoiceAuditTax(totals: number[]): InvoiceAuditTax {
  let sgst = 0;
  let cgst = 0;
  let gst = 0;
  for (const total of totals) {
    const amount = Number.isFinite(total) ? total : 0;
    sgst += (amount * 2.5) / 100;
    cgst += (amount * 2.5) / 100;
    gst += (amount * 5) / 100;
  }
  return { sgst, cgst, gst };
}
