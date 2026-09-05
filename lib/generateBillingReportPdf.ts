import jsPDF from "jspdf";
import { formatINR, getDecimal } from "@/lib/fNumber";
import configuration from "@/config/configuration";
import { fDateandTime } from "@/lib/fDateAndTime";

export interface BillingReportPdfItem {
  _id: string;
  mrn: string;
  createdAt: Date | string;
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
  roundOff?: boolean;
  note?: string;
  transactionType?: "Sale" | "Return" | "Refund" | string;
  items?: {
    name?: string;
    total?: number;
    quantity?: number;
    unitPrice?: number;
  }[];
  patient?: {
    name?: string;
    mrn?: string;
    phoneNumber?: string;
  };
  doctor?: string | { name?: string };
}

export interface BillingReportPdfData {
  department: "Reception" | "Pharmacy" | "Lab" | string;
  bills: BillingReportPdfItem[];
  datePresetLabel: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  statusFilter?: string;
  searchQuery?: string | null;
  billType?: string;
}

const formatPdfCurrency = (val: number) => {
  const formatted = formatINR(val);
  return formatted.replace(/₹/g, "Rs. ");
};

const loadLogoBase64 = (
  src: string
): Promise<{ dataUrl: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const scale = 3;
        const canvas = document.createElement("canvas");
        const w = img.width || 300;
        const h = img.height || 300;
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({ dataUrl: canvas.toDataURL("image/png", 1.0), width: w, height: h });
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

const getLogoDataUrl = async (): Promise<{ dataUrl: string; width: number; height: number } | null> => {
  const logoConfig = configuration().logo;
  const candidates = [logoConfig, "/logo.png", "/print/logo.png"].filter(Boolean) as string[];
  const uniqueCandidates = Array.from(new Set(candidates));

  for (const src of uniqueCandidates) {
    const res = await loadLogoBase64(src);
    if (res) return res;
  }
  return null;
};

export const generateBillingReportPdf = async (data: BillingReportPdfData) => {
  const logoData = await getLogoDataUrl();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Theme Colors
  const COLOR_PRIMARY = [35, 49, 31]; // Synapse Dark #23311f
  const COLOR_SYNAPSE_LIGHT = [95, 115, 80]; // Synapse Light #5F7350
  const COLOR_TEXT = [30, 41, 59]; // Slate 800
  const COLOR_MUTED = [100, 116, 139]; // Slate 500
  const COLOR_EMERALD = [16, 185, 129]; // Emerald 500
  const COLOR_ROSE = [244, 63, 94]; // Rose 500
  const COLOR_AMBER = [217, 119, 6]; // Amber 600
  const COLOR_CARD_BG = [248, 250, 252]; // Slate 50
  const COLOR_BORDER = [226, 232, 240]; // Slate 200

  const departmentTitle = `${data.department.toUpperCase()} BILLING REPORT`;

  const drawPageHeader = () => {
    // White background header for subsequent pages
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 14, "F");

    // Accent Line below header: Synapse Light
    doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.rect(0, 14, pageWidth, 0.8, "F");

    let subTextX = margin;
    if (logoData) {
      const { dataUrl, width, height } = logoData;
      const targetHeight = 10;
      const targetWidth = (width / height) * targetHeight;
      doc.addImage(dataUrl, "PNG", margin, 2, targetWidth, targetHeight);
      subTextX = margin + targetWidth + 3;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(`SYNAPSE HMS — ${departmentTitle} (CONTINUED)`, subTextX, 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.text(`Period: ${data.datePresetLabel}`, pageWidth - margin, 9, {
      align: "right",
    });
  };

  // --- PAGE 1 BANNER HEADER ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
  doc.rect(0, 28, pageWidth, 1.5, "F");

  if (logoData) {
    const { dataUrl, width, height } = logoData;
    const targetHeight = 18;
    const targetWidth = (width / height) * targetHeight;
    doc.addImage(dataUrl, "PNG", margin, 4, targetWidth, targetHeight);
  }

  // Right Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
  doc.text(departmentTitle, pageWidth - margin, 13, {
    align: "right",
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  doc.text(`Generated: ${dateStr}, ${timeStr}`, pageWidth - margin, 21, {
    align: "right",
  });

  let currentY = 35;

  // --- REPORT METADATA / FILTER CARD ---
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  doc.text("PERIOD / DATE RANGE", margin + 4, currentY + 5.5);
  doc.text("PAYMENT METHOD", margin + 65, currentY + 5.5);
  doc.text("STATUS FILTER", margin + 110, currentY + 5.5);
  doc.text("SEARCH QUERY", margin + 148, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

  let periodText = data.datePresetLabel;
  if (data.startDate || data.endDate) {
    const s = data.startDate ? new Date(data.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Earliest";
    const e = data.endDate ? new Date(data.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Latest";
    periodText += ` (${s} to ${e})`;
  }

  const truncatedPeriod = periodText.length > 32 ? periodText.substring(0, 30) + "..." : periodText;
  doc.text(truncatedPeriod, margin + 4, currentY + 12.5);
  doc.text(data.paymentMethod || "ALL", margin + 65, currentY + 12.5);
  doc.text(data.statusFilter || "ALL", margin + 110, currentY + 12.5);

  const searchDisplay = data.searchQuery && data.searchQuery.trim() ? data.searchQuery.trim() : "None";
  const truncatedSearch = searchDisplay.length > 15 ? searchDisplay.substring(0, 13) + ".." : searchDisplay;
  doc.text(truncatedSearch, margin + 148, currentY + 12.5);

  currentY += 23;

  // --- AGGREGATE FINANCIAL METRICS ---
  let totalGross = 0;
  let totalDiscounts = 0;
  let totalPaid = 0;
  let totalCash = 0;
  let totalCard = 0;
  let totalUpi = 0;
  let totalDue = 0;
  let cashCount = 0;
  let cardCount = 0;
  let upiCount = 0;
  let paidBillsCount = 0;
  let partialBillsCount = 0;
  let unpaidBillsCount = 0;
  let refundBillsCount = 0;

  data.bills.forEach((b) => {
    const itemsTotal = b.items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
    const roundOffVal = b.roundOff ? getDecimal(itemsTotal) : 0;
    const netBill = Math.max(0, itemsTotal - roundOffVal);
    const disc = b.discount || 0;
    const c = b.cash || 0;
    const crd = b.card || 0;
    const u = b.upi || 0;
    const p = c + crd + u;
    const d = Math.max(0, netBill - (p + disc));

    totalGross += netBill;
    totalDiscounts += disc;
    totalPaid += p;
    totalCash += c;
    totalCard += crd;
    totalUpi += u;
    totalDue += d;

    if (c > 0) cashCount++;
    if (crd > 0) cardCount++;
    if (u > 0) upiCount++;

    const isRefund =
      b.transactionType === "Refund" ||
      b.transactionType === "Return" ||
      b.items?.some((i) => i.name?.toLowerCase().includes("refund"));

    if (isRefund) {
      refundBillsCount++;
    } else if (p + disc >= netBill && netBill > 0) {
      paidBillsCount++;
    } else if (p > 0) {
      partialBillsCount++;
    } else {
      unpaidBillsCount++;
    }
  });

  const totalCount = data.bills.length;
  const avgBill = totalCount > 0 ? totalGross / totalCount : 0;
  const cashShare = totalPaid > 0 ? Math.round((totalCash / totalPaid) * 100) : 0;
  const cardShare = totalPaid > 0 ? Math.round((totalCard / totalPaid) * 100) : 0;
  const upiShare = totalPaid > 0 ? Math.round((totalUpi / totalPaid) * 100) : 0;

  // --- FINANCIAL SUMMARY CARDS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("BILLING & FINANCIAL SUMMARY", margin, currentY);
  currentY += 4;

  const cards = [
    {
      label: "Total Billed",
      value: formatPdfCurrency(totalGross),
      sub: `${totalCount} total invoices`,
      color: COLOR_PRIMARY,
    },
    {
      label: "Total Collected",
      value: formatPdfCurrency(totalPaid),
      sub: `${paidBillsCount} paid, ${partialBillsCount} partial`,
      color: COLOR_EMERALD,
    },
    {
      label: "Total Outstanding",
      value: formatPdfCurrency(totalDue),
      sub: `${unpaidBillsCount} unpaid invoices`,
      color: totalDue > 0 ? COLOR_ROSE : COLOR_EMERALD,
    },
    {
      label: "Cash Settlement",
      value: formatPdfCurrency(totalCash),
      sub: `${cashCount} txns (${cashShare}% share)`,
      color: COLOR_EMERALD,
    },
    {
      label: "UPI Settlement",
      value: formatPdfCurrency(totalUpi),
      sub: `${upiCount} txns (${upiShare}% share)`,
      color: [139, 92, 246], // Purple
    },
    {
      label: "Card Settlement",
      value: formatPdfCurrency(totalCard),
      sub: `${cardCount} txns (${cardShare}% share)`,
      color: [2, 132, 199], // Sky Blue
    },
    {
      label: "Discounts Given",
      value: formatPdfCurrency(totalDiscounts),
      sub: "Special concessions applied",
      color: COLOR_AMBER,
    },
    {
      label: "Avg Invoice Value",
      value: formatPdfCurrency(avgBill),
      sub: "Average revenue per invoice",
      color: [13, 148, 136], // Teal
    },
    {
      label: "Refunds / Returns",
      value: `${refundBillsCount}`,
      sub: refundBillsCount > 0 ? "Adjusted transactions" : "No refund entries",
      color: refundBillsCount > 0 ? COLOR_ROSE : COLOR_MUTED,
    },
  ];

  const cardW = (contentWidth - 6) / 3; // ~58.6mm
  const cardH = 16.5;

  cards.forEach((card, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const cx = margin + col * (cardW + 3);
    const cy = currentY + row * (cardH + 3);

    // Background box
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "FD");

    // Top indicator accent
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(cx, cy, cardW, 1, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(card.label.toUpperCase(), cx + 3, cy + 5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, cx + 3, cy + 10.5);

    // Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(card.sub, cx + 3, cy + 14.5);
  });

  currentY += 3 * (cardH + 3) + 6;

  // --- BILLS AUDIT TABLE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("DETAILED INVOICE AUDIT LOG", margin, currentY);
  currentY += 5;

  // Column widths:
  // Sl: 7, Date: 17, Inv: 20, Patient: 34, Doctor: 22, Total: 18, Disc: 13, Paid: 18, Due: 16, Status: 17
  // Total: 182mm
  const drawTableHeader = (y: number) => {
    doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    let curX = margin + 2;
    doc.text("#", curX, y + 4.8);
    curX += 7;
    doc.text("Date", curX, y + 4.8);
    curX += 17;
    doc.text("Invoice No", curX, y + 4.8);
    curX += 20;
    doc.text("Patient & MRN", curX, y + 4.8);
    curX += 34;
    doc.text("Doctor", curX, y + 4.8);
    curX += 22;
    doc.text("Total", curX + 16, y + 4.8, { align: "right" });
    curX += 18;
    doc.text("Disc", curX + 11, y + 4.8, { align: "right" });
    curX += 13;
    doc.text("Paid", curX + 16, y + 4.8, { align: "right" });
    curX += 18;
    doc.text("Due", curX + 14, y + 4.8, { align: "right" });
    curX += 16;
    doc.text("Status", curX + 8.5, y + 4.8, { align: "center" });
  };

  drawTableHeader(currentY);
  currentY += 7;

  if (!data.bills || data.bills.length === 0) {
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(
      "No billing records found matching the active date range and filter criteria.",
      margin + contentWidth / 2,
      currentY + 7,
      { align: "center" }
    );
  } else {
    data.bills.forEach((b, index) => {
      // Check page overflow
      if (currentY > 268) {
        doc.addPage();
        drawPageHeader();
        currentY = 20;
        drawTableHeader(currentY);
        currentY += 7;
      }

      // Row background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, contentWidth, 7, "F");
      }

      // Row separator
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

      let curX = margin + 2;

      // Sl No
      doc.text(`${index + 1}`, curX, currentY + 4.5);
      curX += 7;

      // Date
      const dateVal = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "-";
      doc.text(dateVal, curX, currentY + 4.5);
      curX += 17;

      // Invoice No
      doc.setFont("helvetica", "bold");
      const invNo = b.mrn || "-";
      const truncatedInv = invNo.length > 13 ? invNo.substring(0, 11) + ".." : invNo;
      doc.text(truncatedInv, curX, currentY + 4.5);
      curX += 20;

      // Patient Name & MRN
      doc.setFont("helvetica", "normal");
      const patName = b.patient?.name || "Walk-in";
      const patMrn = b.patient?.mrn ? ` (${b.patient.mrn})` : "";
      const fullPat = patName + patMrn;
      const truncatedPat = fullPat.length > 22 ? fullPat.substring(0, 20) + ".." : fullPat;
      doc.text(truncatedPat, curX, currentY + 4.5);
      curX += 34;

      // Doctor
      const docName = typeof b.doctor === "object" ? b.doctor?.name : (b.doctor || "Self");
      const truncatedDoc = (docName || "-").length > 14 ? (docName || "-").substring(0, 12) + ".." : (docName || "-");
      doc.text(truncatedDoc, curX, currentY + 4.5);
      curX += 22;

      // Math for bill
      const itemsTotal = b.items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
      const roundOffVal = b.roundOff ? getDecimal(itemsTotal) : 0;
      const netBill = Math.max(0, itemsTotal - roundOffVal);
      const discVal = b.discount || 0;
      const cashVal = b.cash || 0;
      const cardVal = b.card || 0;
      const upiVal = b.upi || 0;
      const paidVal = cashVal + cardVal + upiVal;
      const dueVal = Math.max(0, netBill - (paidVal + discVal));

      // Total
      doc.setFont("helvetica", "bold");
      doc.text(formatPdfCurrency(netBill), curX + 16, currentY + 4.5, { align: "right" });
      curX += 18;

      // Discount
      doc.setFont("helvetica", "normal");
      doc.setTextColor(discVal > 0 ? COLOR_AMBER[0] : COLOR_MUTED[0], discVal > 0 ? COLOR_AMBER[1] : COLOR_MUTED[1], discVal > 0 ? COLOR_AMBER[2] : COLOR_MUTED[2]);
      doc.text(discVal > 0 ? formatPdfCurrency(discVal) : "0", curX + 11, currentY + 4.5, { align: "right" });
      curX += 13;

      // Paid
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
      doc.text(formatPdfCurrency(paidVal), curX + 16, currentY + 4.5, { align: "right" });
      curX += 18;

      // Due
      if (dueVal > 0) {
        doc.setTextColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
      } else {
        doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      }
      doc.text(formatPdfCurrency(dueVal), curX + 14, currentY + 4.5, { align: "right" });
      curX += 16;

      // Status
      const isRefund =
        b.transactionType === "Refund" ||
        b.transactionType === "Return" ||
        b.items?.some((i) => i.name?.toLowerCase().includes("refund"));

      let statusStr = "Unpaid";
      let statusColor = COLOR_ROSE;

      if (isRefund) {
        statusStr = b.transactionType === "Return" ? "Return" : "Refund";
        statusColor = COLOR_ROSE;
      } else if (paidVal + discVal >= netBill && netBill > 0) {
        statusStr = "Paid";
        statusColor = COLOR_EMERALD;
      } else if (paidVal > 0) {
        statusStr = "Partial";
        statusColor = COLOR_AMBER;
      }

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(statusStr, curX + 8.5, currentY + 4.5, { align: "center" });

      currentY += 7;
    });
  }

  // --- FOOTERS FOR ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.line(margin, 285, margin + contentWidth, 285);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(
      `Synapse HMS — Confidential ${data.department} Billing & Financial Audit Report`,
      margin,
      289
    );
    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, 289, {
      align: "right",
    });
  }

  // Generate Filename
  const dateTag = data.startDate || now.toISOString().split("T")[0];
  const cleanDept = data.department.replace(/\s+/g, "_");
  const cleanPreset = data.datePresetLabel.replace(/\s+/g, "_");
  const filename = `Billing_Report_${cleanDept}_${cleanPreset}_${dateTag}.pdf`;

  doc.save(filename);
};
