import jsPDF from "jspdf";
import { formatINR } from "@/lib/fNumber";
import configuration from "@/config/configuration";

export interface PurchaseReportPdfItem {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  supplier?: {
    name?: string;
    phone?: string;
  };
  items?: any[];
  total: number;
  paidAmount: number;
  paymentStatus: string;
  createdAt?: string | Date;
}

export interface PurchaseReportPdfData {
  entries: PurchaseReportPdfItem[];
  datePresetLabel: string;
  startDate?: string;
  endDate?: string;
  statusFilter?: string;
  searchQuery?: string | null;
}

const formatPdfCurrency = (val: number) => {
  const formatted = formatINR(val || 0);
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

export const generatePurchaseReportPdf = async (data: PurchaseReportPdfData) => {
  const logoData = await getLogoDataUrl();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
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

  const departmentTitle = "PHARMACY PURCHASE REPORT";

  const drawPageHeader = () => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 14, "F");

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
  doc.setFontSize(11);
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
  doc.text("STATUS FILTER", margin + 80, currentY + 5.5);
  doc.text("SEARCH QUERY", margin + 130, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

  let periodText = data.datePresetLabel;
  if (data.startDate || data.endDate) {
    const s = data.startDate
      ? new Date(data.startDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Earliest";
    const e = data.endDate
      ? new Date(data.endDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Latest";
    periodText += ` (${s} to ${e})`;
  }

  const truncatedPeriod =
    periodText.length > 36 ? periodText.substring(0, 34) + "..." : periodText;
  doc.text(truncatedPeriod, margin + 4, currentY + 12.5);
  doc.text(data.statusFilter || "ALL", margin + 80, currentY + 12.5);

  const searchDisplay =
    data.searchQuery && data.searchQuery.trim() ? data.searchQuery.trim() : "None";
  const truncatedSearch =
    searchDisplay.length > 24 ? searchDisplay.substring(0, 22) + ".." : searchDisplay;
  doc.text(truncatedSearch, margin + 130, currentY + 12.5);

  currentY += 24;

  // --- AGGREGATE FINANCIAL METRICS ---
  let totalValue = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;

  data.entries.forEach((e) => {
    const entryTotal = e.total || 0;
    const entryPaid = e.paidAmount || 0;
    const entryDue = Math.max(0, entryTotal - entryPaid);

    totalValue += entryTotal;
    totalPaid += entryPaid;
    totalDue += entryDue;

    if (e.paymentStatus === "Paid" || (entryDue === 0 && entryTotal > 0)) {
      paidCount++;
    } else if (e.paymentStatus === "Partially Paid" || (entryPaid > 0 && entryDue > 0)) {
      partialCount++;
    } else {
      pendingCount++;
    }
  });

  const totalCount = data.entries.length;

  // --- 4 SUMMARY CARDS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("PURCHASE & INVOICE SUMMARY", margin, currentY);
  currentY += 4;

  const cards = [
    {
      label: "Total Invoices",
      value: `${totalCount}`,
      sub: "Recorded purchase bills",
      color: [2, 132, 199], // Blue
    },
    {
      label: "Total Purchase Value",
      value: formatPdfCurrency(totalValue),
      sub: "Gross supplier expenditure",
      color: COLOR_PRIMARY,
    },
    {
      label: "Total Amount Settled",
      value: formatPdfCurrency(totalPaid),
      sub: `${paidCount} paid, ${partialCount} partial`,
      color: COLOR_EMERALD,
    },
    {
      label: "Outstanding Due",
      value: formatPdfCurrency(totalDue),
      sub: `${pendingCount} unpaid / pending`,
      color: totalDue > 0 ? COLOR_ROSE : COLOR_EMERALD,
    },
  ];

  const cardW = (contentWidth - 9) / 4; // ~43.25mm
  const cardH = 16.5;

  cards.forEach((card, index) => {
    const cx = margin + index * (cardW + 3);
    const cy = currentY;

    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "FD");

    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(cx, cy, cardW, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(card.label.toUpperCase(), cx + 2.5, cy + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, cx + 2.5, cy + 10.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(card.sub, cx + 2.5, cy + 14.5);
  });

  currentY += cardH + 7;

  // --- PURCHASE INVOICES TABLE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("DETAILED PURCHASE ENTRIES AUDIT LOG", margin, currentY);
  currentY += 5;

  // Column widths (Total 182mm):
  // Sl: 7, Inv: 22, Date: 20, Supplier: 40, Items: 12, Total: 22, Paid: 21, Due: 21, Status: 17
  const drawTableHeader = (y: number) => {
    doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    let curX = margin + 2;
    doc.text("#", curX, y + 4.8);
    curX += 7;
    doc.text("Invoice No", curX, y + 4.8);
    curX += 22;
    doc.text("Date", curX, y + 4.8);
    curX += 20;
    doc.text("Supplier", curX, y + 4.8);
    curX += 40;
    doc.text("Items", curX + 6, y + 4.8, { align: "center" });
    curX += 12;
    doc.text("Total", curX + 20, y + 4.8, { align: "right" });
    curX += 22;
    doc.text("Paid", curX + 19, y + 4.8, { align: "right" });
    curX += 21;
    doc.text("Due", curX + 19, y + 4.8, { align: "right" });
    curX += 21;
    doc.text("Status", curX + 8.5, y + 4.8, { align: "center" });
  };

  drawTableHeader(currentY);
  currentY += 7;

  if (!data.entries || data.entries.length === 0) {
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(
      "No purchase entries found matching the active date range and filter criteria.",
      margin + contentWidth / 2,
      currentY + 7,
      { align: "center" }
    );
    currentY += 12;
  } else {
    data.entries.forEach((entry, idx) => {
      if (currentY > 270) {
        doc.addPage();
        drawPageHeader();
        currentY = 20;
        drawTableHeader(currentY);
        currentY += 7;
      }

      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
      }
      doc.rect(margin, currentY, contentWidth, 7, "F");

      doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
      doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

      let curX = margin + 2;

      // Sl
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      doc.text(`${idx + 1}`, curX, currentY + 4.8);
      curX += 7;

      // Invoice No
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const invNo = entry.invoiceNumber || "—";
      const truncInv = invNo.length > 14 ? invNo.substring(0, 12) + ".." : invNo;
      doc.text(truncInv, curX, currentY + 4.8);
      curX += 22;

      // Date
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      const dateVal = entry.invoiceDate
        ? new Date(entry.invoiceDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";
      doc.text(dateVal, curX, currentY + 4.8);
      curX += 20;

      // Supplier
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const supName = entry.supplier?.name || "Unknown";
      const truncSup = supName.length > 24 ? supName.substring(0, 22) + ".." : supName;
      doc.text(truncSup, curX, currentY + 4.8);
      curX += 40;

      // Items Count
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      const itemsCount = entry.items?.length || 0;
      doc.text(`${itemsCount}`, curX + 6, currentY + 4.8, { align: "center" });
      curX += 12;

      // Total
      const dueVal = Math.max(0, (entry.total || 0) - (entry.paidAmount || 0));
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      doc.text(formatPdfCurrency(entry.total || 0), curX + 20, currentY + 4.8, {
        align: "right",
      });
      curX += 22;

      // Paid
      doc.setTextColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
      doc.text(formatPdfCurrency(entry.paidAmount || 0), curX + 19, currentY + 4.8, {
        align: "right",
      });
      curX += 21;

      // Due
      if (dueVal > 0) {
        doc.setTextColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
      } else {
        doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      }
      doc.text(formatPdfCurrency(dueVal), curX + 19, currentY + 4.8, {
        align: "right",
      });
      curX += 21;

      // Status
      let statusStr = entry.paymentStatus || "Pending";
      let statusColor = COLOR_ROSE;
      if (statusStr === "Paid") statusColor = COLOR_EMERALD;
      else if (statusStr === "Partially Paid") statusColor = COLOR_AMBER;

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(statusStr, curX + 8.5, currentY + 4.8, { align: "center" });

      currentY += 7;
    });

    // Total Summary Row
    if (currentY > 268) {
      doc.addPage();
      drawPageHeader();
      currentY = 20;
    }

    doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.rect(margin, currentY, contentWidth, 7.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`TOTAL SUMMARY (${totalCount} INVOICES)`, margin + 4, currentY + 5);

    // Total Sum
    let sumX = margin + 2 + 7 + 22 + 20 + 40 + 12; // 103mm
    doc.text(formatPdfCurrency(totalValue), sumX + 20, currentY + 5, { align: "right" });
    sumX += 22;

    // Paid Sum
    doc.text(formatPdfCurrency(totalPaid), sumX + 19, currentY + 5, { align: "right" });
    sumX += 21;

    // Due Sum
    doc.text(formatPdfCurrency(totalDue), sumX + 19, currentY + 5, { align: "right" });

    currentY += 12;
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
      "Synapse HMS — Confidential Pharmacy Purchase & Supplier Invoices Audit Report",
      margin,
      289
    );
    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, 289, {
      align: "right",
    });
  }

  // Save PDF
  const cleanPreset = data.datePresetLabel.replace(/\s+/g, "_");
  const dateTag = now.toISOString().split("T")[0];
  const filename = `Pharmacy_Purchase_Report_${cleanPreset}_${dateTag}.pdf`;

  doc.save(filename);
};
