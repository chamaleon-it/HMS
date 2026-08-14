import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";

/**
 * Generates an exact multi-page A4 PDF from the rendered prescription DOM using jsPDF and html-to-image.
 */
export async function generateConsultationPdf(): Promise<jsPDF | null> {
  const pageElements = document.querySelectorAll(".a4-print-page");
  if (!pageElements || pageElements.length === 0) {
    return null;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i] as HTMLElement;

    // Ensure element is visible during capture
    const originalDisplay = pageEl.style.display;
    const originalVisibility = pageEl.style.visibility;
    const originalPosition = pageEl.style.position;

    pageEl.style.display = "flex";
    pageEl.style.visibility = "visible";

    const dataUrl = await toPng(pageEl, {
      quality: 1.0,
      pixelRatio: 2, // 2x high resolution for crisp print
      backgroundColor: "#ffffff",
      width: 794,
      height: 1123,
    });

    pageEl.style.display = originalDisplay;
    pageEl.style.visibility = originalVisibility;
    pageEl.style.position = originalPosition;

    if (i > 0) {
      pdf.addPage("a4", "portrait");
    }

    pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  }

  return pdf;
}

/**
 * Triggers native print dialog directly from the generated jsPDF blob.
 */
export async function printConsultationWithJsPdf(): Promise<void> {
  const pageElements = document.querySelectorAll(".a4-print-page");
  if (!pageElements || pageElements.length === 0) {
    window.print();
    return;
  }

  const loadingToast = toast.loading("Preparing PDF with jsPDF...");

  try {
    const pdf = await generateConsultationPdf();
    if (!pdf) {
      toast.dismiss(loadingToast);
      window.print();
      return;
    }

    // Auto-print using an invisible iframe to print the exact PDF
    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.src = blobUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow?.print();
        toast.dismiss(loadingToast);
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }, 300);
    };
  } catch (error) {
    console.error("jsPDF print error:", error);
    toast.error("Failed to generate PDF. Opening standard print...", { id: loadingToast });
    window.print();
  }
}

/**
 * Downloads the prescription as a PDF file using jsPDF.
 */
export async function downloadConsultationPdf(filename = "Prescription.pdf"): Promise<void> {
  const loadingToast = toast.loading("Generating PDF with jsPDF...");
  try {
    const pdf = await generateConsultationPdf();
    if (!pdf) {
      toast.error("Prescription not found.", { id: loadingToast });
      return;
    }
    pdf.save(filename);
    toast.success("Prescription downloaded!", { id: loadingToast });
  } catch (error) {
    console.error("jsPDF download error:", error);
    toast.error("Failed to download PDF.", { id: loadingToast });
  }
}
