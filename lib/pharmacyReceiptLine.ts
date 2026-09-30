/**
 * Pharmacy receipts and bills must use the selected batch, not the medicine
 * document. Imported stock stores unit price (also saleRate), GST, batch
 * number, and expiry on the batch. Placeholder batch numbers such as "B0"
 * are not printed.
 */

function formatReceiptINR(n: number): string {
  const val = Number.isFinite(n) ? n : 0;
  const isInteger = Number.isInteger(val);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
}

const PLACEHOLDER_BATCH =
  /^(b0|b-0|—|–|-|n\/a|na|none|select drug first)$/i;

export function isPlaceholderBatchNumber(value: unknown): boolean {
  const text = String(value ?? "").trim();
  return !text || PLACEHOLDER_BATCH.test(text);
}

export function positiveMoney(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function roundMoney(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function batchUnitPrice(batch: any): number {
  if (!batch) return 0;
  return positiveMoney(batch.unitPrice ?? batch.saleRate);
}

/** Selling price stored on a batch: unit price, sale rate, or MRP split by pack. */
export function batchSalePrice(batch: any): number {
  if (!batch) return 0;
  const packing = Number(batch.packing);
  const mrp = Number(batch.mrp);
  const perUnit = packing > 0 && mrp > 0 ? mrp / packing : 0;
  return batchUnitPrice(batch) || positiveMoney(perUnit) || positiveMoney(mrp) || 0;
}

export function readBatchNumber(batch: any): string {
  if (!batch) return "";
  const candidates = [
    batch.batchNumber,
    batch.batchNo,
    batch.batch,
    batch.lotNumber,
    batch.lot,
  ];
  for (const candidate of candidates) {
    if (!isPlaceholderBatchNumber(candidate)) return String(candidate).trim();
  }
  return "";
}

export function pickGst(...values: unknown[]): number {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function pickBatch(
  batches: any[] | undefined,
  wanted?: unknown,
  expiry?: unknown,
): any | undefined {
  const list = Array.isArray(batches) ? batches : [];
  const key = String(wanted ?? "").trim().toLowerCase();
  if (key && !isPlaceholderBatchNumber(key)) {
    const hit = list.find((batch) => {
      const number = readBatchNumber(batch).toLowerCase();
      const raw = String(batch?.batchNumber ?? "")
        .trim()
        .toLowerCase();
      return number === key || raw === key;
    });
    if (hit) return hit;
  }

  if (expiry) {
    const exp = new Date(expiry as any).getTime();
    if (!Number.isNaN(exp)) {
      const byExpiry = list.find((batch) => {
        const stamp = new Date(batch?.expiryDate).getTime();
        return (
          !Number.isNaN(stamp) &&
          Math.abs(stamp - exp) < 36 * 60 * 60 * 1000 &&
          readBatchNumber(batch)
        );
      });
      if (byExpiry) return byExpiry;
    }
  }

  const real = list.filter((batch) => readBatchNumber(batch));
  if (real.length === 1) return real[0];
  if (list.length === 1) return list[0];
  return undefined;
}

/**
 * Batch the pharmacist picked in the queue. Empty, placeholder, and
 * unselected rows do not fall back to another batch's stock or price.
 */
export function chosenBatch(
  batches: any[] | undefined,
  wanted?: unknown,
): any | undefined {
  const list = Array.isArray(batches) ? batches : [];
  const key = String(wanted ?? "").trim().toLowerCase();
  if (!key || isPlaceholderBatchNumber(key)) return undefined;
  return list.find((batch) => {
    const number = readBatchNumber(batch).toLowerCase();
    const raw = String(batch?.batchNumber ?? "")
      .trim()
      .toLowerCase();
    return (number && number === key) || raw === key;
  });
}

export interface ResolvedSaleLine {
  name: string;
  generic?: string;
  batchNumber?: string;
  expiryDate?: string | Date;
  quantity: number;
  unitPrice: number;
  gst: number;
  total: number;
  gstAmount: number;
  net: number;
}

export function resolveSaleLine(input: {
  name?: any;
  generic?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  gst?: unknown;
  batchNumber?: unknown;
  expiryDate?: unknown;
  fallbackGst?: unknown;
  item?: any;
}): ResolvedSaleLine {
  const item =
    input.item ?? (input.name && typeof input.name === "object" ? input.name : undefined);
  const displayName =
    typeof input.name === "string"
      ? input.name
      : item?.name || input.name?.name || "";
  const batch = pickBatch(
    item?.batches,
    input.batchNumber,
    input.expiryDate || item?.expiryDate,
  );
  const unitPrice =
    positiveMoney(input.unitPrice) ||
    batchSalePrice(batch) ||
    positiveMoney(item?.unitPrice) ||
    positiveMoney(item?.saleRate) ||
    0;
  const gst = pickGst(input.gst, batch?.gst, item?.gst, input.fallbackGst);
  const quantity = Number(input.quantity) || 0;
  const batchNumber = !isPlaceholderBatchNumber(input.batchNumber)
    ? String(input.batchNumber).trim()
    : readBatchNumber(batch);
  const expiryDate = (input.expiryDate || batch?.expiryDate || item?.expiryDate) as
    | string
    | Date
    | undefined;
  const total = roundMoney(unitPrice * quantity);

  return {
    name: displayName,
    generic: input.generic || item?.generic || item?.genericName,
    batchNumber: batchNumber || undefined,
    expiryDate,
    quantity,
    unitPrice,
    gst,
    total,
    gstAmount: 0,
    net: total,
  };
}

export interface ReceiptLineView {
  name: string;
  generic?: string;
  batchNumber?: string;
  batchLabel: string;
  expiryDate?: string | Date;
  quantity: number;
  unitPrice: number;
  gst: number;
  taxable: number;
  gstAmount: number;
  net: number;
  unitPriceLabel: string;
  amountLabel: string;
  gstLabel: string;
}

/** Values rendered on a cash receipt row. Amount is qty × unit price, tax included. */
export function presentPharmacyReceiptLine(
  item: {
    name?: any;
    generic?: string;
    batchNumber?: string;
    expiryDate?: string | Date;
    quantity?: number;
    unitPrice?: number;
    gst?: number;
    total?: number;
  },
  catalogItem?: any,
  fallbackGst?: number,
): ReceiptLineView {
  const resolved = resolveSaleLine({
    name: typeof item.name === "string" ? item.name : item.name?.name,
    generic: item.generic,
    quantity: item.quantity,
    unitPrice: positiveMoney(item.unitPrice) || positiveMoney(item.total && item.quantity ? Number(item.total) / Number(item.quantity) : 0),
    gst: item.gst,
    batchNumber: item.batchNumber,
    expiryDate: item.expiryDate,
    fallbackGst,
    item: catalogItem || (typeof item.name === "object" ? item.name : undefined),
  });

  const taxable = resolved.total;
  return {
    name: resolved.name,
    generic: resolved.generic,
    batchNumber: resolved.batchNumber,
    batchLabel: resolved.batchNumber || "—",
    expiryDate: resolved.expiryDate,
    quantity: resolved.quantity,
    unitPrice: resolved.unitPrice,
    gst: resolved.gst,
    taxable,
    gstAmount: resolved.gstAmount,
    net: resolved.net,
    unitPriceLabel: formatReceiptINR(resolved.unitPrice),
    amountLabel: formatReceiptINR(taxable),
    gstLabel: `${resolved.gst}%`,
  };
}

/** Bill-list money. Uses qty × unit price when the stored total was saved as 0. */
export function pharmacyLineMoney(item: {
  quantity?: number;
  unitPrice?: number;
  gst?: number;
  total?: number;
  discount?: number;
  batchNumber?: string;
  expiryDate?: string | Date;
  name?: any;
}) {
  const catalog = item.name && typeof item.name === "object" ? item.name : undefined;
  const resolved = resolveSaleLine({
    name: typeof item.name === "string" ? item.name : catalog?.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    gst: item.gst,
    batchNumber: item.batchNumber,
    expiryDate: item.expiryDate,
    item: catalog,
  });
  const stored = Number(item.total);
  const storedOk = Number.isFinite(stored) && stored > 0;
  const taxable = resolved.total || (storedOk ? roundMoney(stored) : 0);
  const gst = resolved.gst || (Number(item.gst) > 0 ? Number(item.gst) : 0);
  const net = taxable;
  return {
    quantity: resolved.quantity || Number(item.quantity) || 0,
    unitPrice: resolved.unitPrice || positiveMoney(item.unitPrice),
    gst,
    taxable,
    gstAmount: 0,
    net,
    batchNumber: resolved.batchNumber,
    expiryDate: resolved.expiryDate,
  };
}
