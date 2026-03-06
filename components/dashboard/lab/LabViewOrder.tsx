import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Banknote, QrCode, AlertCircle, IndianRupee, Printer, CheckCircle, TestTube2, FlaskConical, ClipboardCheck } from "lucide-react";
import { fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";



function Barcode({ value }: { value: string }) {
    const bars = Array.from(value || "").map(
        (ch, i) => ((ch.charCodeAt(0) + i) % 7) + 2
    );
    const totalW = bars.reduce((a, b) => a + b + 1, 0);
    let x = 0;
    return (
        <svg width={totalW} height={48} className="bg-white">
            {bars.map((w, i) => {
                const rect = (
                    <rect key={i} x={x} y={0} width={w} height={48} fill="#000" />
                );
                x += w + 1;
                return rect;
            })}
        </svg>
    );
}

export default function LabViewOrder({ open, setOpen, sample, onUpdateStatus }: { open: boolean, setOpen: (open: boolean) => void, sample: any, onUpdateStatus: (status: string) => void }) {
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Underpaid">("Cash");
    const [amountPaid, setAmountPaid] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdatingStatus(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        onUpdateStatus(newStatus);
        setUpdatingStatus(false);
    };

    if (!sample) return null;

    // Mock calculations
    const testPrice = 500; // Mock price per test
    const discount = 0;
    const totalAmount = testPrice - discount;
    const balance = Math.max(0, Number(amountPaid) - totalAmount);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[98vw]! max-w-7xl! h-[90vh] flex flex-col print:hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center justify-between pr-8">
                        <span>Order — {sample.mrn}</span>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-2 py-1 rounded-full border",
                                sample.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    sample.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                        "bg-blue-50 text-blue-700 border-blue-200"
                            )}>
                                {sample.status}
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto flex flex-col gap-4 p-1">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start mb-4">
                        {/* Patient Order Info */}
                        <div className="border rounded-lg p-3 md:col-span-2">
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                                Patient
                            </div>
                            <div className="font-semibold text-lg flex items-center gap-1">
                                <p>{sample.patient}</p> -{" "}
                                <span className="text-sm">({sample.mrn})</span>
                            </div>
                            <div className="text-sm text-slate-700">
                                Age/Gender: 25 / Male • Ph: +91 9876543210
                            </div>
                            <div className="text-sm text-slate-700">
                                Address: 123, Main Street, City
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                Doctor: Dr. Smith • Specialization: General Medicine
                            </div>
                        </div>

                        {/* Bill Info */}
                        <div className="border rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-600">
                                    Date:{" "}
                                    <span className="font-medium">
                                        {fDateandTime(sample.time)}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-600">
                                    Sample ID: <span className="font-medium">{sample.id}</span>
                                </div>
                            </div>
                            <div className="ml-3 bg-white p-1 rounded border">
                                <Barcode value={sample.id} />
                            </div>
                        </div>
                    </div>

                    {/* Test List Section (Mocked Items) */}
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-[15px]">
                            <thead className="bg-slate-700 text-white">
                                <tr>
                                    <th className="p-3 text-left w-[5%]">Sl</th>
                                    <th className="p-3 text-left w-[40%]">Test Name</th>
                                    <th className="p-3 text-left w-[20%]">Type</th>
                                    <th className="p-3 text-right w-[15%]">Price</th>
                                    <th className="p-3 text-right w-[20%]">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b last:border-b-0 hover:bg-slate-50">
                                    <td className="p-3 text-slate-500">1</td>
                                    <td className="p-3 font-medium">{sample.test}</td>
                                    <td className="p-3 text-slate-600">{sample.sampleType}</td>
                                    <td className="p-3 text-right">{formatINR(testPrice)}</td>
                                    <td className="p-3 text-right font-semibold">{formatINR(testPrice)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="p-4 bg-slate-50 flex flex-col gap-2 items-end">
                            <div className="w-64 flex justify-between text-sm">
                                <span className="text-slate-600">Sub Total</span>
                                <span>{formatINR(testPrice)}</span>
                            </div>
                            <div className="w-64 flex justify-between text-sm">
                                <span className="text-slate-600">Discount</span>
                                <span>{formatINR(discount)}</span>
                            </div>
                            <div className="w-64 flex justify-between text-lg font-bold border-t pt-2 mt-1">
                                <span>Grand Total</span>
                                <span>{formatINR(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details Section */}
                    {sample.status !== "Completed" && (
                        <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Payment Details</h3>
                                <div className="flex flex-col items-end justify-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm min-w-[140px]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Amount</span>
                                    <div className="flex items-center text-slate-900">
                                        <IndianRupee className="w-5 h-5 stroke-[2.5] mr-0.5 text-slate-400" />
                                        <span className="text-xl font-extrabold leading-none tracking-tight">
                                            {formatINR(totalAmount).replace("₹", "")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { id: "Cash", label: "Cash Payment", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50", shortcut: "C" },
                                    { id: "UPI", label: "UPI / Scanner", icon: QrCode, color: "text-indigo-600", bg: "bg-indigo-50", shortcut: "U" },
                                    { id: "Underpaid", label: "Partial / Due", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", shortcut: "P" },
                                ].map((method) => {
                                    const active = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className={cn(
                                                "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left group",
                                                active
                                                    ? `border-${method.id === "Cash" ? "emerald" : method.id === "UPI" ? "indigo" : "rose"}-500 ${method.bg} shadow-md`
                                                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", active ? "bg-white" : "bg-slate-50 group-hover:bg-white")}>
                                                <method.icon className={cn("h-5 w-5", active ? method.color : "text-slate-400")} />
                                            </div>
                                            <div>
                                                <div className={cn("text-sm font-bold", active ? "text-slate-900" : "text-slate-600")}>{method.label}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Click to select</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {paymentMethod === "Cash" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Collected (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                            className="h-11 bg-white border-slate-200 rounded-lg focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Balance to Return (₹)</Label>
                                        <div className={cn(
                                            "h-11 flex items-center px-4 rounded-lg border-2 font-bold text-lg transition-colors",
                                            balance >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                                        )}>
                                            {formatINR(balance)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === "Underpaid" || paymentMethod === "UPI") && (
                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            {paymentMethod === "UPI" ? "Transaction ID / Reference" : "Reference / Bill No."}
                                        </Label>
                                        <Input
                                            placeholder="Enter reference"
                                            value={referenceNumber}
                                            onChange={(e) => setReferenceNumber(e.target.value)}
                                            className="h-11 bg-white border-slate-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Update Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t pt-4 mt-auto flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>

                    {sample.status === "Pending" && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleStatusUpdate("Sample Collected")}
                            disabled={updatingStatus}
                        >
                            <TestTube2 className="w-4 h-4 mr-2" />
                            {updatingStatus ? "Updating..." : "Sample Collected"}
                        </Button>
                    )}

                    {sample.status === "Sample Collected" && (
                        <Button
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => handleStatusUpdate("Waiting for Result")}
                            disabled={updatingStatus}
                        >
                            <FlaskConical className="w-4 h-4 mr-2" />
                            {updatingStatus ? "Updating..." : "Process Sample"}
                        </Button>
                    )}

                    {sample.status === "Waiting for Result" && (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleStatusUpdate("Completed")}
                            disabled={updatingStatus}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {updatingStatus ? "Completing..." : "Complete Order"}
                        </Button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
