import React from 'react'
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function usePrint({ onAfterPrint }: { onAfterPrint?: () => void } = {}) {
    const onClick = () => {
        window.print();
    };

    React.useEffect(() => {
        if (!onAfterPrint) return;
        const handleAfterPrint = () => {
            onAfterPrint();
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, [onAfterPrint]);

    const downloadPdf = async () => {
        const printElement = document.querySelector('.print-receipt') as HTMLElement;

        if (!printElement) {
            toast.error('Receipt not found. Please try again.');
            return;
        }

        try {
            // Show loading toast
            const loadingToast = toast.loading('Generating PDF...');

            // Temporarily make the element visible and position absolute to avoid layout shifts
            // and ensure it captures correctly regardless of parent container
            const originalDisplay = printElement.style.display;
            const originalPosition = printElement.style.position;
            const originalWidth = printElement.style.width;

            printElement.style.display = 'block';
            printElement.style.position = 'absolute';
            printElement.style.left = '-9999px'; // Move off-screen
            printElement.style.top = '0';
            printElement.style.width = '794px'; // Force A4 width in pixels (96 DPI)

            // Wait for a microtask to ensure styles apply
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(printElement, {
                quality: 1.0,
                pixelRatio: 2, // 2x resolution is sufficient for good print quality without massive file size
                backgroundColor: '#ffffff',
                width: 794, // Canvas width in pixels matches A4
                style: {
                    visibility: 'visible',
                    position: 'static', // Reset in clone
                    display: 'block',
                    width: '794px',
                    height: 'auto',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    margin: '0',
                    padding: '0',
                    transform: 'none',
                    overflow: 'visible'
                }
            });

            // Restore original styles
            printElement.style.display = originalDisplay;
            printElement.style.position = originalPosition;
            printElement.style.left = '';
            printElement.style.top = '';
            printElement.style.width = originalWidth;

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add image to PDF
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Generate filename with timestamp
            const timestamp = new Date().getTime();
            const filename = `pharmacy-receipt-${timestamp}.pdf`;

            // Download the PDF
            pdf.save(filename);

            // Success toast
            toast.success('PDF downloaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF. Please try again.');
        }
    };

    return { onClick, downloadPdf };
}
