import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import useGetTest from "@/data/useGetTest";
import configuration from "@/config/configuration";

interface LabBillReceiptProps {
    report?: any | null;
    bill?: any | null;
    panels?: { name: string; price: number; tests?: any[] }[];
    /** Kept for call-site compat; layout always prints both slit halves. */
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

const formatRateOrQty = (num: number) => {
    const val = Number(num) || 0;
    return Number.isInteger(val) ? String(val) : val.toFixed(2);
};

export default function LabBillReceipt({ report, bill, panels }: LabBillReceiptProps) {
    const [mounted, setMounted] = useState(false);
    const { tests } = useGetTest();

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

    // Determine patient and doctor values
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

    const doctorVal = bill?.doctor || report?.doctor;
    let doctorName = typeof doctorVal === "object" ? doctorVal?.name : doctorVal;
    if (typeof doctorVal === "object" && doctorVal?.qualification) {
        doctorName = `${doctorName} ,${doctorVal.qualification}`;
    }
    if (!doctorName || doctorName.toLowerCase() === "null") {
        doctorName = "Self";
    }

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
    const hospitalAddress = config.hospitalAddress || "NILAMBUR ROAD, MAMPAD";
    const hospitalPhone = config.hospitalPhone ? `PH: ${config.hospitalPhone.trim()}` : "PH: 9279100700";

    // Calculate items
    let items: BillItemRow[] = [];

    if (bill && Array.isArray(bill.items)) {
        items = bill.items.map((it: any) => {
            const qty = it.quantity ?? 1;
            const rate = it.unitPrice ?? (it.total ? it.total / qty : 0);
            const disAmt = it.discount ?? 0;
            const baseTotal = rate * qty;
            const discPercent = baseTotal > 0 && disAmt > 0 ? Math.round((disAmt / baseTotal) * 100) : 0;
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
        // Group tests by panels if they belong to a panel
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

        // Standalone tests
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

    const content = (
        <div className="print-receipt hidden print:flex bg-white text-black font-sans leading-tight overflow-hidden relative flex-row gap-2">
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
            gap: 4mm !important;
            z-index: 999999999 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          .no-print, aside, header, footer, nav, button {
            display: none !important;
          }
        }
      `,
                }}
            />

            {/* LEFT CONTAINER: "CASH BILL" (Patient/Customer Copy) */}
            <div className="w-[63%] border border-black p-2 flex flex-col bg-white box-border">
                {/* 1. Header Layout */}
                <div className="text-center pb-1">
                    <h1 className="text-[14px] font-bold text-black uppercase tracking-wider leading-snug">
                        {hospitalName}
                    </h1>
                    <p className="text-[9.5px] font-medium text-black uppercase tracking-wide leading-snug">
                        {hospitalAddress}
                    </p>
                    <p className="text-[9.5px] font-medium text-black tracking-wide leading-snug">
                        {hospitalPhone}
                    </p>
                </div>

                {/* Divider Line */}
                <div className="border-b border-black w-full my-0.5"></div>

                {/* 2. Bill Title */}
                <div className="text-center py-1">
                    <span className="text-[12.5px] font-bold text-black uppercase tracking-wider">
                        CASH BILL
                    </span>
                </div>

                {/* 3. Patient & Bill Metadata Grid */}
                <div className="grid grid-cols-[1fr_auto] gap-2 pb-1.5 px-0.5 text-[10px] leading-tight text-black">
                    {/* Left Column */}
                    <div className="space-y-0.5">
                        <div className="grid grid-cols-[60px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Bill No</span>
                            <span>:</span>
                            <span className="font-bold text-black">{invoiceNo}</span>
                        </div>
                        <div className="grid grid-cols-[60px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Name</span>
                            <span>:</span>
                            <span className="font-bold text-black uppercase">{patientName}</span>
                        </div>
                        <div className="grid grid-cols-[60px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Age/Sex</span>
                            <span>:</span>
                            <span className="font-medium text-black">{ageSex || "—"}</span>
                        </div>
                        <div className="grid grid-cols-[60px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Ref. by Dr</span>
                            <span>:</span>
                            <span className="font-bold text-black uppercase">{doctorName}</span>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-0.5">
                        <div className="grid grid-cols-[35px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Date</span>
                            <span>:</span>
                            <span className="font-medium text-black">{formatBillDate(billDate)}</span>
                        </div>
                        <div className="grid grid-cols-[35px_10px_1fr] items-center">
                            <span className="font-semibold text-black">Time</span>
                            <span>:</span>
                            <span className="font-medium text-black">{formatBillTime(billDate)}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Test Items Table */}
                <div className="w-full border border-black">
                    <table className="w-full border-collapse text-[10px] table-fixed">
                        <thead>
                            <tr className="border-b border-black font-semibold text-black">
                                <th style={{ width: "7%" }} className="py-0.5 px-1 text-center border-r border-black">S.No</th>
                                <th style={{ width: "43%" }} className="py-0.5 px-1.5 text-left border-r border-black">Test Name</th>
                                <th style={{ width: "13%" }} className="py-0.5 px-1 text-right border-r border-black">Rate</th>
                                <th style={{ width: "8%" }} className="py-0.5 px-1 text-center border-r border-black">Qty</th>
                                <th style={{ width: "9%" }} className="py-0.5 px-1 text-center border-r border-black">Disc %</th>
                                <th style={{ width: "9%" }} className="py-0.5 px-1 text-right border-r border-black">Dis Amt</th>
                                <th style={{ width: "11%" }} className="py-0.5 px-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="text-black">
                                    <td className="py-0.5 px-1 text-center border-r border-black">{idx + 1}</td>
                                    <td className="py-0.5 px-1.5 text-left font-medium border-r border-black uppercase truncate">{item.name}</td>
                                    <td className="py-0.5 px-1 text-right border-r border-black">{formatRateOrQty(item.rate)}</td>
                                    <td className="py-0.5 px-1 text-center border-r border-black">{item.qty}</td>
                                    <td className="py-0.5 px-1 text-center border-r border-black">{item.discPercent}</td>
                                    <td className="py-0.5 px-1 text-right border-r border-black">{formatRateOrQty(item.disAmt)}</td>
                                    <td className="py-0.5 px-1 text-right font-medium">{formatRateOrQty(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. Financial Summary */}
                <div className="pt-1 text-[10px] text-black">
                    <div className="flex justify-between items-start">
                        {/* Rate sum aligned under Rate column */}
                        <div className="w-[50%] flex justify-end pr-1.5 pt-0.5">
                            {/* <span className="font-bold text-black text-[10px]">{formatAmount(totalRate)}</span> */}
                        </div>

                        {/* Summary totals */}
                        <div className="w-[50%] space-y-0.5">
                            <div className="grid grid-cols-[80px_8px_1fr] items-center text-right">
                                <span className="font-semibold text-black text-left">Total Amount</span>
                                <span className="text-center">:</span>
                                <span className="font-bold text-black">{formatAmount(totalAmount)}</span>
                            </div>
                            <div className="grid grid-cols-[80px_8px_1fr] items-center text-right">
                                <span className="font-semibold text-black text-left">Discount</span>
                                <span className="text-center">:</span>
                                <span className="font-bold text-black">{formatAmount(billDiscount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider Line */}
                    <div className="border-t border-black my-1"></div>

                    {/* Net Amount */}
                    <div className="flex justify-end gap-8 items-center font-bold text-[12.5px] pr-0.5">
                        <span>Net Amount :</span>
                        <span className="min-w-[55px] text-right">{formatAmount(netAmount)}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT CONTAINER: Lab Counter Slip (Duplicate / Token) */}
            <div className="w-[37%] border border-black p-2 flex flex-col bg-white box-border">
                {/* 1. Header Layout */}
                <div className="text-center pb-1">
                    <h2 className="text-[14px] font-bold text-black uppercase tracking-wider leading-tight">
                        {hospitalName.split(" ").length > 1 ? (
                            <>
                                <div>{hospitalName.split(" ").slice(0, -1).join(" ")}</div>
                                <div>{hospitalName.split(" ").slice(-1).join(" ")}</div>
                            </>
                        ) : (
                            <div>{hospitalName}</div>
                        )}
                    </h2>
                </div>

                {/* Divider Line */}
                <div className="border-b border-black w-full mb-1"></div>

                {/* 2. Metadata */}
                <div className="space-y-0.5 text-[10px] text-black pb-1.5 px-0.5 leading-tight">
                    <div className="grid grid-cols-[50px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Bill No</span>
                        <span>:</span>
                        <span className="font-bold text-black">{invoiceNo}</span>
                    </div>
                    <div className="grid grid-cols-[50px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Date</span>
                        <span>:</span>
                        <span className="font-medium text-black">{formatBillDate(billDate)}</span>
                    </div>
                    <div className="grid grid-cols-[50px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Time</span>
                        <span>:</span>
                        <span className="font-medium text-black">{formatBillTime(billDate)}</span>
                    </div>
                    <div className="grid grid-cols-[50px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Name</span>
                        <span>:</span>
                        <span className="font-bold text-black uppercase">{patientName}</span>
                    </div>
                    <div className="grid grid-cols-[50px_8px_1fr] items-center">
                        <span className="font-semibold text-black">Age/Sex</span>
                        <span>:</span>
                        <span className="font-medium text-black">{ageSex || ""}</span>
                    </div>
                </div>

                {/* 3. Test List Table */}
                <div className="w-full border border-black">
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

                {/* 4. Financial Summary */}
                <div className="pt-1 text-[10px] text-black">
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

                    {/* Divider Line */}
                    <div className="border-t border-black my-1"></div>

                    {/* Net Amount */}
                    <div className="flex justify-between items-center font-bold text-[12.5px] px-0.5">
                        <span>Net Amount :</span>
                        <span className="text-right">{formatAmount(netAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
