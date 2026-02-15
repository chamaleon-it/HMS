import React from "react";
import { Wallet2, Banknote, CreditCard, Building2, IndianRupee, BadgePercent, Percent } from "lucide-react";

interface PaymentSectionProps {
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
    payload,
    setPayload,
}) => {
    const paymentModes = [
        {
            key: "cash",
            label: "Cash",
            icon: Banknote,
            tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
            key: "online",
            label: "Card / UPI",
            icon: CreditCard,
            tint: "bg-indigo-50 text-indigo-700 border-indigo-200",
        },
        {
            key: "insurance",
            label: "Insurance",
            icon: Building2,
            tint: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
        },
    ];

    const itemsTotal = payload.items.reduce((a: number, b: any) => a + b.total, 0);

    return (
        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Wallet2 className="h-4 w-4" />
                Payments & Insurance
            </div>
            <div className="grid grid-cols-5 gap-4">
                {paymentModes.map(({ key, label, icon: Icon, tint }) => (
                    <div key={key} className="col-span-12 md:col-span-1">
                        <div className={`rounded-xl border px-3 py-3 ${tint}`}>
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                                <Icon className="h-4 w-4" />
                                {label}
                            </div>
                            <div className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    onFocus={(e) => (e.target.placeholder = "")}
                                    onBlur={(e) => (e.target.placeholder = "0")}
                                    value={
                                        payload[key] === 0 ? "" : payload[key].toString()
                                    }
                                    onChange={(e) =>
                                        setPayload((prev: any) => ({
                                            ...prev,
                                            [key]: Number(e.target.value),
                                        }))
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="col-span-12 md:col-span-1">
                    <div className="rounded-xl border px-3 py-3 bg-red-50 text-red-700 border-red-200">
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                            <BadgePercent className="h-4 w-4" />
                            Discount (₹)
                        </div>
                        <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                onFocus={(e) => (e.target.placeholder = "")}
                                onBlur={(e) => (e.target.placeholder = "0")}
                                value={payload.discount === 0 ? "" : parseFloat(payload.discount.toFixed(2))}
                                onChange={(e) =>
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        discount: Number(e.target.value),
                                    }))
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-1">
                    <div className="rounded-xl border px-3 py-3 bg-red-50 text-red-700 border-red-200">
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                            <BadgePercent className="h-4 w-4" />
                            Discount (%)
                        </div>
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                onFocus={(e) => (e.target.placeholder = "")}
                                onBlur={(e) => (e.target.placeholder = "0")}
                                value={parseFloat(((payload.discount / (itemsTotal || 1)) * 100).toFixed(2)) || ""}
                                onChange={(e) =>
                                    setPayload((prev: any) => ({
                                        ...prev,
                                        discount: (Number(e.target.value) * itemsTotal) / 100,
                                    }))
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50 text-right"
                            />
                        </div>
                    </div>
                </div>

                {/* <div className="col-span-12 h-px bg-slate-200" /> */}
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-1 block text-xs text-slate-500">Payer / Insurer</label>
                    <input
                        value={payload.payer || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({ ...prev, payer: e.target.value }))
                        }
                        placeholder="e.g., Star Health"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-1 block text-xs text-slate-500">Policy No.</label>
                    <input
                        value={payload.policyNo || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                policyNo: e.target.value,
                            }))
                        }
                        placeholder="Policy #"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-1 block text-xs text-slate-500">TPA</label>
                    <input
                        value={payload.tpa || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({ ...prev, tpa: e.target.value }))
                        }
                        placeholder="TPA name"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-1 block text-xs text-slate-500">Pre-Auth No.</label>
                    <input
                        value={payload.preAuthNo || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                preAuthNo: e.target.value,
                            }))
                        }
                        placeholder="Pre-auth"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                    />
                </div>
            </div>
        </div>
    );
};
