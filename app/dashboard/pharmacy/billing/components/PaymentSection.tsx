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
            tint: "bg-white text-emerald-600 border-slate-200 hover:border-emerald-300",
        },
        {
            key: "online",
            label: "Card / UPI",
            icon: CreditCard,
            tint: "bg-white text-indigo-600 border-slate-200 hover:border-indigo-300",
        },
        {
            key: "insurance",
            label: "Insurance",
            icon: Building2,
            tint: "bg-white text-fuchsia-600 border-slate-200 hover:border-fuchsia-300",
        },
    ];

    const itemsTotal = payload.items.reduce((a: number, b: any) => a + b.total, 0);

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <Wallet2 className="h-4 w-4" />
                Payments & Insurance
            </div>
            <div className="grid grid-cols-5 gap-4">
                {paymentModes.map(({ key, label, icon: Icon, tint }) => (
                    <div key={key} className="col-span-12 md:col-span-1">
                        <div className={`rounded-xl border px-4 py-4 ${tint} transition-all hover:shadow-sm`}>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </div>
                            <div className="flex items-center gap-1 relative">
                                <IndianRupee className="h-4 w-4 absolute left-0 text-current opacity-60" />
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
                                    className="h-9 w-full bg-transparent text-lg font-bold outline-none text-right placeholder:text-current/30 pl-5"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="col-span-12 md:col-span-1">
                    <div className="rounded-xl border px-4 py-4 bg-white text-rose-500 border-slate-200 hover:border-rose-300 transition-all hover:shadow-sm group">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                            <BadgePercent className="h-3.5 w-3.5" />
                            Discount (₹)
                        </div>
                        <div className="flex items-center gap-1 relative">
                            <IndianRupee className="h-4 w-4 absolute left-0 text-current opacity-60" />
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
                                className="h-9 w-full bg-transparent text-lg font-bold outline-none text-right placeholder:text-current/30 pl-5"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-1">
                    <div className="rounded-xl border px-4 py-4 bg-white text-rose-500 border-slate-200 hover:border-rose-300 transition-all hover:shadow-sm group">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                            <BadgePercent className="h-3.5 w-3.5" />
                            Discount (%)
                        </div>
                        <div className="flex items-center gap-1 relative">
                            <Percent className="h-4 w-4 absolute left-0 text-current opacity-60" />
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
                                className="h-9 w-full bg-transparent text-lg font-bold outline-none text-right placeholder:text-current/30 pl-5"
                            />
                        </div>
                    </div>
                </div>

                {/* <div className="col-span-12 h-px bg-slate-200" /> */}
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-2 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Payer / Insurer</label>
                    <input
                        value={payload.payer || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({ ...prev, payer: e.target.value }))
                        }
                        placeholder="e.g., Star Health"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-2 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Policy No.</label>
                    <input
                        value={payload.policyNo || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                policyNo: e.target.value,
                            }))
                        }
                        placeholder="Policy #"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-2 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">TPA</label>
                    <input
                        value={payload.tpa || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({ ...prev, tpa: e.target.value }))
                        }
                        placeholder="TPA name"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="col-span-12 md:col-span-1">
                    <label className="mb-2 block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Pre-Auth No.</label>
                    <input
                        value={payload.preAuthNo || ""}
                        onChange={(e) =>
                            setPayload((prev: any) => ({
                                ...prev,
                                preAuthNo: e.target.value,
                            }))
                        }
                        placeholder="Pre-auth"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>
        </div>
    );
};
