import jsPDF from "jspdf";
import { formatINR } from "@/lib/fNumber";
import configuration from "@/config/configuration";

export interface ReportCategoryItem {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface ReportTransactionItem {
  transactionId?: string;
  transactionDate: string;
  type: "INCOME" | "EXPENSE" | string;
  category: string;
  description: string;
  amount: number;
  paymentMethod?: string;
  createdBy?: { name?: string };
}

export interface ReportPdfData {
  summary?: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    profitMargin: number;
    avgTransactionValue: number;
    totalTransactions: number;
    incomeCount: number;
    expenseCount: number;
  };
  categoryBreakdown?: {
    incomeCategories: ReportCategoryItem[];
    expenseCategories: ReportCategoryItem[];
  };
  transactions: ReportTransactionItem[];
  datePresetLabel: string;
  startDate?: string;
  endDate?: string;
  selectedType: string;
  selectedCategory: string;
}

const formatPdfCurrency = (val: number) => {
  const formatted = formatINR(val);
  return formatted.replace(/₹/g, "Rs. ");
};

const loadLogoBase64 = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        // Render at 3x HD resolution for ultra crisp print/screen quality
        const scale = 3;
        const canvas = document.createElement("canvas");
        canvas.width = (img.width || 300) * scale;
        canvas.height = (img.height || 300) * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png", 1.0));
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

const getLogoDataUrl = async (): Promise<string | null> => {
  const logoConfig = configuration().logo;
  const candidates = [logoConfig, "/logo.png", "/print/logo.png"].filter(Boolean) as string[];
  const uniqueCandidates = Array.from(new Set(candidates));

  for (const src of uniqueCandidates) {
    const res = await loadLogoBase64(src);
    if (res) return res;
  }
  return null;
};

export const generateAccountsReportPdf = async (data: ReportPdfData) => {
  const logoDataUrl = await getLogoDataUrl();

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
  const COLOR_ACCENT = [95, 115, 80]; // Synapse Light #5F7350 (replaced light blue)
  const COLOR_TEXT = [30, 41, 59]; // Slate 800
  const COLOR_MUTED = [100, 116, 139]; // Slate 500
  const COLOR_EMERALD = [16, 185, 129]; // Emerald 500
  const COLOR_ROSE = [244, 63, 94]; // Rose 500
  const COLOR_CARD_BG = [248, 250, 252]; // Slate 50
  const COLOR_BORDER = [226, 232, 240]; // Slate 200

  const drawPageHeader = () => {
    // White background header for subsequent pages
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 14, "F");

    // Accent Line below header: Synapse Light
    doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.rect(0, 14, pageWidth, 0.8, "F");

    let subTextX = margin;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", margin, 2, 10, 10);
      subTextX = margin + 13;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text("SYNAPSE HMS — ACCOUNTS REPORT (CONTINUED)", subTextX, 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.text(`Period: ${data.datePresetLabel}`, pageWidth - margin, 9, {
      align: "right",
    });
  };

  // --- PAGE 1 BANNER HEADER ---
  // White Header Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent Line below Header: Synapse Light
  doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
  doc.rect(0, 28, pageWidth, 1.5, "F");

  let textX = margin;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, 4, 20, 20);
    textX = margin + 24;
  }

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text(configuration().hospitalName || "SYNAPSE HOSPITAL MANAGEMENT SYSTEM", textX, 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
  doc.text("ACCOUNTS & FINANCIAL ANALYTICS REPORT", textX, 21);

  // Right Metadata
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
  doc.text(`Generated: ${dateStr}, ${timeStr}`, pageWidth - margin, 13, {
    align: "right",
  });
  doc.text("Scope: Executive Admin Audit", pageWidth - margin, 21, {
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
  doc.text("REPORT PERIOD / RANGE", margin + 4, currentY + 5.5);
  doc.text("TYPE FILTER", margin + 75, currentY + 5.5);
  doc.text("CATEGORY FILTER", margin + 125, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

  let periodText = data.datePresetLabel;
  if (data.startDate || data.endDate) {
    const s = data.startDate || "Earliest";
    const e = data.endDate || "Latest";
    periodText += ` (${s} to ${e})`;
  }
  doc.text(periodText, margin + 4, currentY + 12.5);
  doc.text(data.selectedType || "ALL", margin + 75, currentY + 12.5);
  doc.text(data.selectedCategory || "ALL", margin + 125, currentY + 12.5);

  currentY += 23;

  // --- FINANCIAL SUMMARY CARDS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("FINANCIAL SUMMARY & KEY METRICS", margin, currentY);
  currentY += 4;

  const summary = data.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    profitMargin: 0,
    avgTransactionValue: 0,
    totalTransactions: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  const cards = [
    {
      label: "Total Revenue",
      value: formatPdfCurrency(summary.totalIncome),
      sub: `${summary.incomeCount} income records`,
      color: COLOR_EMERALD,
    },
    {
      label: "Total Expense",
      value: formatPdfCurrency(summary.totalExpense),
      sub: `${summary.expenseCount} expense records`,
      color: COLOR_ROSE,
    },
    {
      label: "Net Balance",
      value: formatPdfCurrency(summary.netBalance),
      sub: summary.netBalance >= 0 ? "Surplus Profit" : "Net Deficit",
      color: summary.netBalance >= 0 ? COLOR_EMERALD : COLOR_ROSE,
    },
    {
      label: "Profit Margin",
      value: `${summary.profitMargin}%`,
      sub: "Net efficiency ratio",
      color: [124, 58, 237],
    },
    {
      label: "Avg Transaction",
      value: formatPdfCurrency(summary.avgTransactionValue),
      sub: "Average per entry",
      color: [13, 148, 136],
    },
    {
      label: "Total Records",
      value: `${summary.totalTransactions}`,
      sub: "Total audited entries",
      color: COLOR_TEXT,
    },
  ];

  const cardW = (contentWidth - 6) / 3; // ~58.6mm
  const cardH = 17;

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
    doc.setFontSize(10);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, cx + 3, cy + 10.5);

    // Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(card.sub, cx + 3, cy + 15);
  });

  currentY += 2 * (cardH + 3) + 6;

  // --- CATEGORY BREAKDOWN SUMMARY (IF AVAILABLE) ---
  const incCats = data.categoryBreakdown?.incomeCategories || [];
  const expCats = data.categoryBreakdown?.expenseCategories || [];

  if (incCats.length > 0 || expCats.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text("CATEGORY BREAKDOWN HIGHLIGHTS", margin, currentY);
    currentY += 4;

    const boxW = (contentWidth - 4) / 2; // 89mm
    const maxRows = Math.max(incCats.length, expCats.length, 1);
    const boxH = Math.min(maxRows * 5.5 + 8, 35);

    // Draw Income Box
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, "FD");

    doc.setFillColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
    doc.rect(margin, currentY, boxW, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
    doc.text("INCOME CATEGORIES", margin + 3, currentY + 5);

    let incY = currentY + 9;
    incCats.slice(0, 4).forEach((cat) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const name = cat.name.length > 18 ? cat.name.substring(0, 16) + ".." : cat.name;
      doc.text(name, margin + 3, incY);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatPdfCurrency(cat.amount)} (${cat.percentage}%)`, margin + boxW - 3, incY, {
        align: "right",
      });
      incY += 5.5;
    });

    // Draw Expense Box
    const expX = margin + boxW + 4;
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(expX, currentY, boxW, boxH, 2, 2, "FD");

    doc.setFillColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
    doc.rect(expX, currentY, boxW, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
    doc.text("EXPENSE CATEGORIES", expX + 3, currentY + 5);

    let expY = currentY + 9;
    expCats.slice(0, 4).forEach((cat) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const name = cat.name.length > 18 ? cat.name.substring(0, 16) + ".." : cat.name;
      doc.text(name, expX + 3, expY);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatPdfCurrency(cat.amount)} (${cat.percentage}%)`, expX + boxW - 3, expY, {
        align: "right",
      });
      expY += 5.5;
    });

    currentY += boxH + 6;
  }

  // --- TRANSACTIONS AUDIT TRAIL TABLE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text("DETAILED TRANSACTIONS AUDIT LOG", margin, currentY);
  currentY += 5;

  const drawTableHeader = (y: number) => {
    doc.setFillColor(COLOR_SYNAPSE_LIGHT[0], COLOR_SYNAPSE_LIGHT[1], COLOR_SYNAPSE_LIGHT[2]);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    let curX = margin + 2;
    doc.text("Date", curX, y + 4.8);
    curX += 22;
    doc.text("Txn ID", curX, y + 4.8);
    curX += 24;
    doc.text("Description", curX, y + 4.8);
    curX += 50;
    doc.text("Category", curX, y + 4.8);
    curX += 32;
    doc.text("Type", curX, y + 4.8);
    curX += 16;
    doc.text("Pay Method", curX, y + 4.8);
    curX += 18;
    doc.text("Amount (INR)", margin + contentWidth - 2, y + 4.8, {
      align: "right",
    });
  };

  drawTableHeader(currentY);
  currentY += 7;

  if (!data.transactions || data.transactions.length === 0) {
    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(
      "No transaction records found matching the active date range and filter criteria.",
      margin + contentWidth / 2,
      currentY + 7,
      { align: "center" }
    );
  } else {
    data.transactions.forEach((txn, index) => {
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
      doc.setFontSize(7);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

      let curX = margin + 2;

      // Date
      const dateVal = txn.transactionDate
        ? new Date(txn.transactionDate).toISOString().split("T")[0]
        : "-";
      doc.text(dateVal, curX, currentY + 4.5);
      curX += 22;

      // Txn ID
      doc.setFont("helvetica", "bold");
      doc.text(txn.transactionId || "-", curX, currentY + 4.5);
      curX += 24;
      doc.setFont("helvetica", "normal");

      // Description
      const desc = txn.description || "-";
      const truncatedDesc =
        desc.length > 30 ? desc.substring(0, 28) + "..." : desc;
      doc.text(truncatedDesc, curX, currentY + 4.5);
      curX += 50;

      // Category
      const cat = txn.category || "-";
      const truncatedCat =
        cat.length > 18 ? cat.substring(0, 16) + "..." : cat;
      doc.text(truncatedCat, curX, currentY + 4.5);
      curX += 32;

      // Type
      const isIncome = String(txn.type || "").toUpperCase() === "INCOME";
      if (isIncome) {
        doc.setTextColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
      } else {
        doc.setTextColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
      }
      doc.setFont("helvetica", "bold");
      doc.text(txn.type, curX, currentY + 4.5);
      curX += 16;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

      // Payment Method
      doc.text(txn.paymentMethod || "Cash", curX, currentY + 4.5);
      curX += 18;

      // Amount
      const amtStr = formatPdfCurrency(txn.amount);
      if (isIncome) {
        doc.setTextColor(COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2]);
      } else {
        doc.setTextColor(COLOR_ROSE[0], COLOR_ROSE[1], COLOR_ROSE[2]);
      }
      doc.setFont("helvetica", "bold");
      doc.text(amtStr, margin + contentWidth - 2, currentY + 4.5, {
        align: "right",
      });

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
      "Synapse HMS — Confidential Accounts & Financial Audit Report",
      margin,
      289
    );
    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, 289, {
      align: "right",
    });
  }

  // Generate Filename
  const dateTag = data.startDate || now.toISOString().split("T")[0];
  const filename = `Accounts_Report_${data.datePresetLabel.replace(/\s+/g, "_")}_${dateTag}.pdf`;

  doc.save(filename);
};
