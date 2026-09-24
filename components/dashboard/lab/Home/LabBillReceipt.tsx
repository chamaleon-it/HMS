import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";
import configuration from "@/config/configuration";
import usePrintBranding from "@/hooks/usePrintBranding";
import BrandingFooter from "@/components/print/BrandingFooter";

interface LabBillReceiptProps {
    report?: any | null;
    bill?: any | null;
    panels?: { name: string; price: number; tests?: any[] }[];
    /** "both"/undefined → two identical narrow halves on one page; single copy → one half. */
    copy?: "patient" | "lab" | "both";
}

interface BillItemRow {
    name: string;
    rate: number;
    qty: number;
    discPercent: number;
    disAmt: number;
    amount: number;
}

const formatBillDate = (d: Date) => {
    if (!d || isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatBillTime = (d: Date) => {
    if (!d || isNaN(d.getTime())) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes}:${seconds} ${ampm}`;
};

const formatAmount = (num: number) => {
    return (Number(num) || 0).toFixed(2);
};

export default function LabBillReceipt({ report, bill, panels, copy }: LabBillReceiptProps) {
    const [mounted, setMounted] = useState(false);
    const { tests } = useGetTest();
    const { slogan, advertisement, services } = usePrintBranding("lab");

    useEffect(() => {
        setMounted(true);
        const name = bill?.patient?.name || report?.patient?.name;
        const mrn = bill?.patient?.mrn || report?.patient?.mrn;
        if (name && mrn) {
            const originalTitle = document.title;
            const pid = mrn.replace("MRN", "P-");
            const timestamp = fDateandTime(new Date());
            document.title = `${name}_${pid}_${timestamp}_Bill`;
            return () => {
                document.title = originalTitle;
            };
        }
    }, [report, bill]);

    if ((!report && !bill) || !mounted) return null;

    const patient = bill?.patient || report?.patient;
    const patientName = patient?.name || "—";

    let ageStr = "";
    if (patient?.dateOfBirth) {
        const { years } = fAge(new Date(patient.dateOfBirth));
        if (years !== undefined && !isNaN(years)) {
            ageStr = `${years} Years`;
        }
    } else if (patient?.age) {
        ageStr = `${patient.age} Years`;
    }
    const genderStr = patient?.gender ? String(patient.gender) : "";
    const ageSex = [ageStr, genderStr].filter(Boolean).join(" / ");

    const invoiceNo =
        bill?.mrn ||
        (report?.mrn !== undefined
            ? String(report.mrn)
            : report?.sampleId
                ? `LAB-${report.sampleId}`
                : `LAB-${report?._id?.substring(0, 6)?.toUpperCase()}`);

    const billDate = bill?.createdAt
        ? new Date(bill.createdAt)
        : report?.date
            ? new Date(report.date)
            : new Date();

    const config = configuration();
    const hospitalName = config.hospitalName || "RAHMATH HOSPITAL";
    const hospitalAddress = config.hospitalAddress || "";
    const hospitalPhone = config.hospitalPhone
        ? `PH: ${config.hospitalPhone.trim()}`
        : "";

    let items: BillItemRow[] = [];

    if (bill && Array.isArray(bill.items)) {
        items = bill.items.map((it: any) => {
            const qty = it.quantity ?? 1;
            const rate = it.unitPrice ?? (it.total ? it.total / qty : 0);
            const disAmt = it.discount ?? 0;
            const baseTotal = rate * qty;
            const discPercent =
                baseTotal > 0 && disAmt > 0 ? Math.round((disAmt / baseTotal) * 100) : 0;
            const amount = it.total !== undefined ? it.total : baseTotal - disAmt;
            return {
                name: it.name || "Test",
                rate,
                qty,
                discPercent,
                disAmt,
                amount,
            };
        });
    } else if (report) {
        const selectedPanels = panels?.filter((p) => report.panels?.includes(p.name)) || [];
        selectedPanels.forEach((p) => {
            items.push({
                name: p.name,
                rate: p.price || 0,
                qty: 1,
                discPercent: 0,
                disAmt: 0,
                amount: p.price || 0,
            });
        });

        const panelTests = selectedPanels.flatMap((e: any) => e.tests || []).map((e: any) => e._id);

        report.test
            ?.filter((t: any) => !panelTests.includes(t.name?._id))
            .forEach((t: any) => {
                const testDetails = tests.find((test) => test._id === t.name?._id);
                const price = testDetails?.price || 0;
                items.push({
                    name: t.name?.name || "Test",
                    rate: price,
                    qty: 1,
                    discPercent: 0,
                    disAmt: 0,
                    amount: price,
                });
            });
    }

    const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);
    const billDiscount = bill?.discount || 0;
    const netAmount = Math.max(0, totalAmount - billDiscount);

    // Dual by default when copy is "both" or omitted (billing pages pass "both").
    const dual = copy === "both" || copy == null;

    const renderNarrowBill = (key: string, showBranding: boolean) => (
        <div
            key={key}
            className={`${dual ? "w-1/2" : "w-full max-w-[95mm]"} border border-black p-2 flex flex-col bg-white box-border min-w-0 print-receipt-half`}
        >
            <div className="text-center pb-1">
                <h2 className="text-[13px] font-bold text-black uppercase tracking-wider leading-tight">
                    {hospitalName.split(" ").length > 1 ? (
                        <>
                            <div>{hospitalName.split(" ").slice(0, -1).join(" ")}</div>
                            <div>{hospitalName.split(" ").slice(-1).join(" ")}</div>
                        </>
                    ) : (
                        <div>{hospitalName}</div>
                    )}
                </h2>
                {slogan && (
                    <p className="text-[8px] font-medium italic text-black leading-snug">{slogan}</p>
                )}
                {hospitalAddress && (
                    <p className="text-[8.5px] font-medium text-black uppercase tracking-wide leading-snug">
                        {hospitalAddress}
                    </p>
                )}
                {hospitalPhone && (
                    <p className="text-[8.5px] font-medium text-black tracking-wide leading-snug">
                        {hospitalPhone}
                    </p>
                )}
            </div>

            <div className="border-b border-black w-full mb-1"></div>

            <div className="text-center py-0.5 mb-0.5">
                <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    CASH BILL
                </span>
            </div>

            <div className="space-y-0.5 text-[10px] text-black pb-1.5 px-0.5 leading-tight">
                <div className="grid grid-cols-[52px_8px_1fr] items-center">
                    <span className="font-semibold text-black">Bill No</span>
                    <span>:</span>
                    <span className="font-bold text-black">{invoiceNo}</span>
                </div>
                <div className="grid grid-cols-[52px_8px_1fr] items-center">
                    <span className="font-semibold text-black">Date</span>
                    <span>:</span>
                    <span className="font-medium text-black">{formatBillDate(billDate)}</span>
                </div>
                <div className="grid grid-cols-[52px_8px_1fr] items-center">
                    <span className="font-semibold text-black">Time</span>
                    <span>:</span>
                    <span className="font-medium text-black">{formatBillTime(billDate)}</span>
                </div>
                <div className="grid grid-cols-[52px_8px_1fr] items-center">
                    <span className="font-semibold text-black">Name</span>
                    <span>:</span>
                    <span className="font-bold text-black uppercase">{patientName}</span>
                </div>
                <div className="grid grid-cols-[52px_8px_1fr] items-center">
                    <span className="font-semibold text-black">Age/Sex</span>
                    <span>:</span>
                    <span className="font-medium text-black">{ageSex || ""}</span>
                </div>
            </div>

            <div className="w-full border border-black flex-1">
                <div className="py-0.5 px-1 font-semibold text-[10px] text-black border-b border-black">
                    Test Name
                </div>
                <div className="py-1 px-1 text-[10px] space-y-0.5">
                    {items.map((item, idx) => (
                        <div key={idx} className="font-medium text-black uppercase truncate">
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-1 text-[10px] text-black mt-auto">
                <div className="space-y-0.5 px-0.5">
                    <div className="grid grid-cols-[75px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Total Amount</span>
                        <span>:</span>
                        <span className="font-bold text-black text-right">{formatAmount(totalAmount)}</span>
                    </div>
                    <div className="grid grid-cols-[75px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Discount</span>
                        <span>:</span>
                        <span className="font-bold text-black text-right">{formatAmount(billDiscount)}</span>
                    </div>
                </div>

                <div className="border-t border-black my-1"></div>

                <div className="flex justify-between items-center font-bold text-[12px] px-0.5">
                    <span>Net Amount :</span>
                    <span className="text-right">{formatAmount(netAmount)}</span>
                </div>

                {showBranding && (services || advertisement) && (
                    <div className="mt-1">
                        <BrandingFooter services={services} advertisement={advertisement} />
                    </div>
                )}
            </div>
        </div>
    );

    const content = (
        <div
            className={`print-receipt hidden print:flex bg-white text-black font-sans leading-tight overflow-hidden relative flex-row gap-2 justify-center${dual ? " print-receipt-dual" : " print-receipt-single"}`}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @media print {
          @page {
            size: A5 landscape;
            margin: 4mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
            height: auto !important;
          }
          body > *:not(.print-receipt) {
            display: none !important;
          }
          #__next, #root, [data-radix-portal] {
            display: none !important;
          }
          .print-receipt {
            visibility: visible !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 202mm !important;
            max-height: 140mm !important;
            padding: 0 !important;
            margin: 0 auto !important;
            background: white !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            justify-content: center !important;
            gap: 3mm !important;
            z-index: 999999999 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          .print-receipt-dual .print-receipt-half {
            width: 50% !important;
            max-width: none !important;
            flex: 1 1 0 !important;
            box-sizing: border-box !important;
          }
          .print-receipt-single .print-receipt-half {
            width: 95mm !important;
            max-width: 95mm !important;
            flex: 0 0 95mm !important;
            box-sizing: border-box !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `,
                }}
            />
            {dual ? (
                <>
                    {renderNarrowBill("copy-a", true)}
                    {renderNarrowBill("copy-b", false)}
                </>
            ) : (
                renderNarrowBill(copy === "lab" ? "lab" : "patient", true)
            )}
        </div>
    );

    return createPortal(content, document.body);
}
