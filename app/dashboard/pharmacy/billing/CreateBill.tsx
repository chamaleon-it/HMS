import { Banknote, Building2, CalendarDays, ChevronDown, CreditCard, Download, FilePlus2, FileText, IndianRupee, Plus, Printer, Search, Share2, Trash2, User2, UserPlus, Wallet2 } from 'lucide-react';
import React from 'react'
import { motion, AnimatePresence } from "framer-motion";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

export default function CreateBill() {

    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

      const [patient] = React.useState<{
        name: string;
        id: string;
        phone?: string;
      } | null>({
        name: "John Mathew",
        id: "PT-002134",
        phone: "+91 98xxxxxx34",
      });

      const [invoiceNo] = React.useState("INV-2025-00921");

      const [items, setItems] = React.useState<Item[]>(demoItems);

      const [cash, setCash] = React.useState(0);
        const [card, setCard] = React.useState(0); // payment method state
        const [insurancePay, setInsurancePay] = React.useState(0);
        const [note, setNote] = React.useState("");

          const [insurance, setInsurance] = React.useState({
            payer: "",
            policy: "",
            tpa: "",
            preauth: "",
          });

          const [date] = React.useState(new Date());


          const addItem = () =>
    setItems((p) => [
      ...p,
      {
        id: (crypto as Crypto).randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + Math.random()),
        name: "New Item",
        qty: 1,
        price: 0,
        gstPct: 0,
      },
    ]);

      const totals = React.useMemo(
          () => computeTotals(items, { cash, card, insurance: insurancePay }),
          [items, cash, card, insurancePay]
        );

         const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id: string) =>
    setItems((p) => p.filter((it) => it.id !== id));
  return (
    <div className="space-y-4">
              {/* Bill Info (merged card) */}
              <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                <div className="mb-4 grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                        }}
                      >
                        <User2 className="h-4 w-4" />
                      </span>
                      Patient
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {patient?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {patient?.id} • {patient?.phone}
                        </div>
                      </div>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                        <UserPlus className="mr-2 inline h-4 w-4" />
                        New
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </span>
                      Invoice
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">
                          Invoice No.
                        </div>
                        <div className="font-medium">{invoiceNo}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date</div>
                        <div className="flex items-center gap-1 font-medium">
                          <CalendarDays className="h-4 w-4" />
                          {date.toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                        }}
                      >
                        <Search className="h-4 w-4" />
                      </span>
                      Quick Add
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        placeholder="Search services / tests / items…"
                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                      />
                      <PrimaryButton onClick={addItem}>
                        <Plus className="h-4 w-4" />
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Summary */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 space-y-4 lg:col-span-8">
                  <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Line Items
                      </div>
                      <span className="text-xs text-slate-500">
                        Simple mode • Advanced fields in each row
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed text-sm">
                        <colgroup>
                          <col className="w-[42%]" />
                          <col className="w-[10%]" />
                          <col className="w-[16%]" />
                          <col className="w-[12%]" />
                          <col className="w-[14%]" />
                          <col className="w-[6%]" />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                            <th className="py-2 text-left">Item</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Unit</th>
                            <th className="py-2 text-right">GST%</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2 text-center">• • •</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence initial={false}>
                            {items.map((it) => {
                              const line = it.qty * it.price;
                              const dPct = Math.max(
                                0,
                                Math.min(100, it.discPct || 0)
                              );
                              const dFlat = Math.max(0, it.discFlat || 0);
                              const discAmt = (line * dPct) / 100 + dFlat;
                              const afterDisc = Math.max(0, line - discAmt);
                              const gstAmt = (afterDisc * it.gstPct) / 100;
                              const amount = afterDisc + gstAmt;
                              const isOpen = !!expanded[it.id];
                              return (
                                <React.Fragment key={it.id}>
                                  <motion.tr
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                                  >
                                    <td className="py-2 pr-2">
                                      <input
                                        value={it.name}
                                        onChange={(e) =>
                                          updateItem(it.id, {
                                            name: e.target.value,
                                          })
                                        }
                                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                                      />
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                      <input
                                        type="number"
                                        min={1}
                                        value={it.qty}
                                        onChange={(e) =>
                                          updateItem(it.id, {
                                            qty: Number(e.target.value),
                                          })
                                        }
                                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " text-right"}
                                      />
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                      <input
                                        type="number"
                                        min={0}
                                        value={it.price}
                                        onChange={(e) =>
                                          updateItem(it.id, {
                                            price: Number(e.target.value),
                                          })
                                        }
                                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " text-right"}
                                      />
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                      <input
                                        type="number"
                                        min={0}
                                        max={28}
                                        value={it.gstPct}
                                        onChange={(e) =>
                                          updateItem(it.id, {
                                            gstPct: Number(e.target.value),
                                          })
                                        }
                                        className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " text-right w-20"}
                                      />
                                    </td>
                                    <td className="py-2 pr-2 text-right font-medium tabular-nums">
                                      {currency(amount)}
                                    </td>
                                    <td className="py-2 text-center">
                                      <button
                                        onClick={() =>
                                          setExpanded((s) => ({
                                            ...s,
                                            [it.id]: !isOpen,
                                          }))
                                        }
                                        className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        <ChevronDown
                                          className={`h-4 w-4 transition ${
                                            isOpen ? "rotate-180" : "rotate-0"
                                          }`}
                                        />
                                      </button>
                                      <button
                                        onClick={() => removeItem(it.id)}
                                        className="ml-1 rounded-md p-2 hover:bg-rose-50 text-rose-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </motion.tr>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.tr
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <td
                                          colSpan={6}
                                          className="bg-slate-50/50 px-2 py-3 text-xs dark:bg-slate-800/40"
                                        >
                                          <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 md:col-span-3">
                                              <label className="mb-1 block text-[11px] text-slate-500">
                                                Code
                                              </label>
                                              <input
                                                value={it.code || ""}
                                                onChange={(e) =>
                                                  updateItem(it.id, {
                                                    code: e.target.value,
                                                  })
                                                }
                                                placeholder="Optional"
                                                className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                                              />
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                              <label className="mb-1 block text-[11px] text-slate-500">
                                                Discount %
                                              </label>
                                              <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={it.discPct || 0}
                                                onChange={(e) =>
                                                  updateItem(it.id, {
                                                    discPct: Number(
                                                      e.target.value
                                                    ),
                                                  })
                                                }
                                                className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                                              />
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                              <label className="mb-1 block text-[11px] text-slate-500">
                                                Discount Flat
                                              </label>
                                              <div className="flex items-center gap-2">
                                                <IndianRupee className="h-4 w-4 text-slate-500" />
                                                <input
                                                  type="number"
                                                  min={0}
                                                  value={it.discFlat || 0}
                                                  onChange={(e) =>
                                                    updateItem(it.id, {
                                                      discFlat: Number(
                                                        e.target.value
                                                      ),
                                                    })
                                                  }
                                                  className={
                                                    "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " text-right"
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    )}
                                  </AnimatePresence>
                                </React.Fragment>
                              );
                            })}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>

                    {/* Footer: total & add item (Catalog removed) */}
                    <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <span className="text-slate-500">Line Items Total</span>
                        <span className="ml-3 font-semibold tabular-nums">
                          {currency(
                            items.reduce((acc, i) => {
                              const line = i.qty * i.price;
                              const d =
                                (line * (i.discPct || 0)) / 100 +
                                (i.discFlat || 0);
                              const after = Math.max(0, line - d);
                              const gst = (after * (i.gstPct || 0)) / 100;
                              return acc + after + gst;
                            }, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <PrimaryButton
                          onClick={addItem}
                          className="flex-1 sm:flex-none"
                        >
                          <Plus className="mr-2 inline h-4 w-4" />
                          Add Item
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>

                  {/* Payments & Insurance (merged) */}
                  <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Wallet2 className="h-4 w-4" />
                      Payments & Insurance
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      {[
                        {
                          key: "cash",
                          label: "Cash",
                          icon: Banknote,
                          value: cash,
                          setter: setCash,
                          tint: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        },
                        {
                          key: "card",
                          label: "Card / UPI",
                          icon: CreditCard,
                          value: card,
                          setter: setCard,
                          tint: "bg-indigo-50 text-indigo-700 border-indigo-200",
                        },
                        {
                          key: "insurance",
                          label: "Insurance",
                          icon: Building2,
                          value: insurancePay,
                          setter: setInsurancePay,
                          tint: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
                        },
                      ].map(
                        ({ key, label, icon: Icon, value, setter, tint }) => (
                          <div key={key} className="col-span-12 md:col-span-4">
                            <div
                              className={`rounded-xl border px-3 py-3 ${tint}`}
                            >
                              <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                                <Icon className="h-4 w-4" />
                                {label}
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                <input
                                  type="number"
                                  min={0}
                                  value={value}
                                  onChange={(e) =>
                                    setter(Number(e.target.value))
                                  }
                                  className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " text-right"}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      <div className="col-span-12 h-px bg-slate-200" />
                      <div className="col-span-12 md:col-span-3">
                        <label className="mb-1 block text-xs text-slate-500">
                          Payer / Insurer
                        </label>
                        <input
                          value={insurance.payer}
                          onChange={(e) =>
                            setInsurance({
                              ...insurance,
                              payer: e.target.value,
                            })
                          }
                          placeholder="e.g., Star Health"
                          className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-3">
                        <label className="mb-1 block text-xs text-slate-500">
                          Policy No.
                        </label>
                        <input
                          value={insurance.policy}
                          onChange={(e) =>
                            setInsurance({
                              ...insurance,
                              policy: e.target.value,
                            })
                          }
                          placeholder="Policy #"
                          className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-3">
                        <label className="mb-1 block text-xs text-slate-500">
                          TPA
                        </label>
                        <input
                          value={insurance.tpa}
                          onChange={(e) =>
                            setInsurance({ ...insurance, tpa: e.target.value })
                          }
                          placeholder="TPA name"
                          className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-3">
                        <label className="mb-1 block text-xs text-slate-500">
                          Pre-Auth No.
                        </label>
                        <input
                          value={insurance.preauth}
                          onChange={(e) =>
                            setInsurance({
                              ...insurance,
                              preauth: e.target.value,
                            })
                          }
                          placeholder="Pre-auth"
                          className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes (optional) */}
                  <div className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"}>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Notes
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add invoice note… (optional)"
                      className={"h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" + " h-28"}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="col-span-12 lg:col-span-4">
                  <motion.div
                    className={"rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900" + " sticky top-4"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Wallet2 className="h-4 w-4" />
                      Invoice Summary
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-medium tabular-nums">
                          {currency(totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-medium tabular-nums">
                          -{currency(totals.totalDisc)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">GST</span>
                        <span className="font-medium tabular-nums">
                          {currency(totals.totalGST)}
                        </span>
                      </div>
                      <div className="my-2 h-px bg-slate-200" />
                      <div className="flex items-center justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {currency(totals.grand)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Paid</span>
                        <span className="font-medium tabular-nums">
                          {currency(totals.paid)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                        <span className="font-semibold">Due</span>
                        <span className="font-semibold tabular-nums">
                          {currency(totals.due)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <PrimaryButton>
                        <FilePlus2 className="mr-2 inline h-4 w-4" />
                        Generate
                      </PrimaryButton>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                        <Share2 className="mr-2 inline h-4 w-4" />
                        Share Link
                      </button>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                        <Printer className="mr-2 inline h-4 w-4" />
                        Print
                      </button>
                      <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                        <Download className="mr-2 inline h-4 w-4" />
                        PDF
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500">
                      Per-line discount → GST. Supports split payments &
                      insurance.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
  )
}


interface Item {
  id: string;
  name: string;
  code?: string;
  qty: number;
  price: number; // unit price
  gstPct: number; // e.g. 18 for 18%
  discPct?: number; // %
  discFlat?: number; // ₹
}

const currency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

  function computeTotals(
  items: Item[],
  payments: { cash: number; card: number; insurance: number }
) {
  let subtotal = 0,
    totalDisc = 0,
    totalGST = 0;
  for (const it of items) {
    const line = it.qty * it.price;
    subtotal += line;
    const dPct = Math.max(0, Math.min(100, it.discPct || 0));
    const dFlat = Math.max(0, it.discFlat || 0);
    const discAmt = (line * dPct) / 100 + dFlat;
    const afterDisc = Math.max(0, line - discAmt);
    totalDisc += discAmt;
    totalGST += (afterDisc * it.gstPct) / 100;
  }
  const grand = subtotal - totalDisc + totalGST;
  const paid =
    (payments.cash || 0) + (payments.card || 0) + (payments.insurance || 0);
  const due = Math.max(0, grand - paid);
  return { subtotal, totalDisc, totalGST, grand, paid, due };
}

const demoItems: Item[] = [
  {
    id: "i1",
    name: "Consultation",
    code: "CONS001",
    qty: 1,
    price: 500,
    gstPct: 0,
  },
  {
    id: "i2",
    name: "CBC Lab Test",
    code: "LAB223",
    qty: 1,
    price: 350,
    gstPct: 5,
  },
  {
    id: "i3",
    name: "X-Ray Chest PA",
    code: "XR101",
    qty: 1,
    price: 800,
    gstPct: 12,
  },
];

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 active:scale-[0.99] ${className}`}
    style={{
      backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    }}
  >
    {children}
  </button>
);
