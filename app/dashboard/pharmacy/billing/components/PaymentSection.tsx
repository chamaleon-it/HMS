import { Wallet2, Banknote, CreditCard, Building2, IndianRupee, BadgePercent, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

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
            label: "Cash Payment",
            icon: Banknote,
            color: "text-emerald-600",
            bg: "group-hover:bg-emerald-50"
        },
        {
            key: "online",
            label: "UPI / Card",
            icon: CreditCard,
            color: "text-indigo-600",
            bg: "group-hover:bg-indigo-50"
        },
        {
            key: "insurance",
            label: "Insurance / TPA",
            icon: Building2,
            color: "text-fuchsia-600",
            bg: "group-hover:bg-fuchsia-50"
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
                {paymentModes.map(({ key, label, icon: Icon, color, bg }) => (
                    <div key={key} className="col-span-12 md:col-span-1">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all">
                            <div className={cn("absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full transition-colors", bg)} />

                            <div className="flex items-center gap-2 relative z-10">
                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100", color)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative">{label}</span>
                            </div>

                            <div className={cn("text-2xl font-bold mt-4 relative z-10 flex items-baseline gap-1", color)}>
                                <span className="text-lg opacity-60">₹</span>
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
                                    className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="col-span-12 md:col-span-1">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all text-rose-600">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full transition-colors group-hover:bg-rose-50" />

                        <div className="flex items-center gap-2 relative z-10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                <BadgePercent className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative">Discount (₹)</span>
                        </div>

                        <div className="text-2xl font-bold mt-4 relative z-10 flex items-baseline gap-1">
                            <span className="text-lg opacity-60">₹</span>
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
                                className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-1">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all text-rose-600">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 -mr-8 -mt-8 rounded-full transition-colors group-hover:bg-rose-50" />

                        <div className="flex items-center gap-2 relative z-10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                <Percent className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative">Discount (%)</span>
                        </div>

                        <div className="text-2xl font-bold mt-4 relative z-10 flex items-baseline gap-1">
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
                                className="bg-transparent border-none outline-none w-full p-0 h-auto font-bold tabular-nums placeholder:text-current/20 focus:ring-0 text-right pr-1"
                            />
                            <span className="text-lg opacity-60">%</span>
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
