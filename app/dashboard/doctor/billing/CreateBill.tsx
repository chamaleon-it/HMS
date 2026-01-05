import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Download,
  FilePlus2,
  FileText,
  IndianRupee,
  Plus,
  Printer,
  Share2,
  Trash2,
  User2,
  UserPlus,
  Wallet2,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import PatientSelection from "./PatientSelection";
import ItemSelected from "./ItemSelected";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};

const defaultPayload = {
  patient: "",
  items: [],
  cash: 0,
  insurance: 0,
  online: 0,
};

export default function CreateBill({
  billingMutate,
}: {
  billingMutate: () => void;
}) {
  const router = useRouter();

  const [item, setItem] = useState<null | string>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const itemRef = useRef<null | HTMLInputElement>(null);
  const [payload, setPayload] = useState<{
    patient: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      gst: number;
      discount: number;
      total: number;
    }[];
    cash: number;
    online: number;
    insurance: number;
    payer?: string;
    policyNo?: string;
    tpa?: string;
    preAuthNo?: string;
    note?: string;
  }>(defaultPayload);

  const registerPatient = useCallback(async () => {
    router.push("/dashboard/doctor/patients#register");
  }, [router]);

  const addItem = useCallback(
    (i?: string) => {
      if (i) {
        if (!payload.items.find((e) => e.name === i)) {
          setPayload((prev) => ({
            ...prev,
            items: [
              ...prev.items,
              {
                name: i,
                discount: 0,
                gst: 0,
                quantity: 0,
                total: 0,
                unitPrice: 0,
              },
            ],
          }));
        }
        itemRef.current?.focus();
        setItem(null);
      } else if (item) {
        if (!payload.items.find((e) => e.name === item)) {
          setPayload((prev) => ({
            ...prev,
            items: [
              ...prev.items,
              {
                name: item,
                discount: 0,
                gst: 0,
                quantity: 0,
                total: 0,
                unitPrice: 0,
              },
            ],
          }));
        } else {
          toast.error("Item already exist.");
        }

        itemRef.current?.focus();
        setItem(null);
      } else {
        itemRef.current?.focus();
      }
    },
    [item, payload.items]
  );

  const removeItem = useCallback(
    (name: string) => {
      setPayload((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.name !== name),
      }));
    },
    [setPayload]
  );

  const updateItem = useCallback(
    (
      itemName: string,
      patch: Partial<{
        unitPrice: number;
        quantity: number;
        discount: number;
        gst: number;
      }>
    ) => {
      setPayload((prev) => {
        const items = prev.items.map((it) => {
          if (it.name !== itemName) return it;
          const unitPrice =
            "unitPrice" in patch ? patch.unitPrice ?? 0 : it.unitPrice ?? 0;
          const quantity =
            "quantity" in patch ? patch.quantity ?? 0 : it.quantity ?? 0;
          const discount =
            "discount" in patch ? patch.discount ?? 0 : it.discount ?? 0;
          const gst = "gst" in patch ? patch.gst ?? 0 : it.gst ?? 0;
          const total = calcTotal(unitPrice, quantity, discount, gst);
          return {
            ...it,
            ...patch,
            unitPrice,
            quantity,
            discount,
            gst,
            total,
          };
        });

        return { ...prev, items };
      });
    },
    [setPayload]
  );

  const updateQty = useCallback(
    (itemName: string, quantity: number) => {
      updateItem(itemName, { quantity });
    },
    [updateItem]
  );

  const updatePrice = useCallback(
    (itemName: string, unitPrice: number) => {
      updateItem(itemName, { unitPrice });
    },
    [updateItem]
  );

  const updateGST = useCallback(
    (itemName: string, gst: number) => {
      updateItem(itemName, { gst });
    },
    [updateItem]
  );

  const updateDiscount = useCallback(
    (itemName: string, discount: number) => {
      updateItem(itemName, { discount });
    },
    [updateItem]
  );

  const generateBill = useCallback(async () => {
    if (!payload.patient) {
      toast.error("Please select patient.");
      return;
    }
    if (payload.items.length === 0) {
      toast.error("Please add atleast one item.");
      return;
    }

    const itemWithZeroQty = payload.items.find((item) => item.quantity <= 0);
    if (itemWithZeroQty) {
      toast.error(`Item "${itemWithZeroQty.name}" has a quantity of zero or less.`);
      return;
    }
    const itemWithZeroPrice = payload.items.find((item) => item.unitPrice <= 0);
    if (itemWithZeroPrice) {
      toast.error(`Item "${itemWithZeroPrice.name}" has a unit price of zero or less.`);
      return;
    }

    const itemWithNegativeGst = payload.items.find((item) => item.gst < 0);
    if (itemWithNegativeGst) {
      toast.error(`Item "${itemWithNegativeGst.name}" has a negative GST value.`);
      return;
    }

    const itemWithNegativeDiscount = payload.items.find((item) => item.discount < 0);
    if (itemWithNegativeDiscount) {
      toast.error(`Item "${itemWithNegativeDiscount.name}" has a negative discount value.`);
      return;
    }

    const totalAmount = payload.items.reduce((acc, item) => acc + item.total, 0);
    if (totalAmount <= 0) {
      toast.error("Total amount should be greater than zero.");
      return;
    }


    try {
      await toast.promise(api.post("/billing", payload), {
        loading: "We are generating this bill.",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      setPayload(defaultPayload);
      billingMutate();
    } catch (error) {
      console.log(error);
    }
  }, [payload, billingMutate]);

  return (
    <div className="space-y-4">
      <div
        className={
          "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900 relative z-10"
        }
      >
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
            <div className="flex items-center justify-between gap-5">
              <PatientSelection
                value={payload.patient}
                setValue={(value) =>
                  setPayload((prev) => ({ ...prev, patient: value }))
                }
              />

              <button
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 shrink-0"
                onClick={registerPatient}
              >
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
                <div className="text-xs text-slate-500">Date</div>
                <div className="flex items-center gap-1 font-medium">
                  <CalendarDays className="h-4 w-4" />
                  {fDate(new Date())}
                </div>
              </div>
            </div>
          </div>
          <ItemSelected
            addItem={addItem}
            item={item}
            itemRef={itemRef}
            setItem={setItem}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 relative z-0">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div
            className={
              "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
            }
          >
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
                    {payload.items.map((it) => {
                      const isOpen = !!expanded[it.name];
                      return (
                        <React.Fragment key={it.name}>
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
                                readOnly
                                disabled
                                className={
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                                }
                              />
                            </td>


                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                min={1}
                                value={
                                  it.quantity === 0
                                    ? ""
                                    : it.quantity.toString()
                                }
                                placeholder="0"
                                onFocus={e => e.target.placeholder = ""}
                                onBlur={e => e.target.placeholder = "0"}
                                onChange={(e) =>
                                  updateQty(it.name, Number(e.target.value))
                                }
                                className={
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                                  " text-right"
                                }
                              />
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                min={0}
                                value={
                                  it.unitPrice === 0
                                    ? ""
                                    : it.unitPrice.toString()
                                }
                                placeholder="0"
                                onFocus={e => e.target.placeholder = ""}
                                onBlur={e => e.target.placeholder = "0"}
                                onChange={(e) =>
                                  updatePrice(it.name, Number(e.target.value))
                                }
                                className={
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                                  " text-right"
                                }
                              />
                            </td>

                            <td className="py-2 pr-2 text-right">
                              <input
                                type="number"
                                min={0}
                                max={28}
                                value={it.gst === 0 ? "" : it.gst.toString()}
                                placeholder="0"
                                onFocus={e => e.target.placeholder = ""}
                                onBlur={e => e.target.placeholder = "0"}
                                onChange={(e) =>
                                  updateGST(it.name, Number(e.target.value))
                                }
                                className={
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                                  " text-right w-20"
                                }
                              />
                            </td>
                            <td className="py-2 pr-2 text-right font-medium tabular-nums">
                              {formatINR(it.total)}
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() =>
                                  setExpanded((s) => ({
                                    ...s,
                                    [it.name]: !isOpen,
                                  }))
                                }
                                className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition ${isOpen ? "rotate-180" : "rotate-0"
                                    }`}
                                />
                              </button>
                              <button
                                onClick={() => removeItem(it.name)}
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
                                        Discount
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <IndianRupee className="h-4 w-4 text-slate-500" />
                                        <input
                                          type="number"
                                          min={0}
                                          value={it.discount || 0}
                                          onChange={(e) =>
                                            updateDiscount(
                                              it.name,
                                              Number(e.target.value)
                                            )
                                          }
                                          className={
                                            "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                                            " text-right"
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

            <div className="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-slate-500">Line Items Total</span>
                <span className="ml-3 font-semibold tabular-nums">
                  {formatINR(
                    payload.items.reduce((acc, i) => acc + i.total, 0)
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <PrimaryButton
                  onClick={() => {
                    if (item) {
                      addItem();
                    } else {
                      itemRef.current?.focus();
                    }
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Item
                </PrimaryButton>
              </div>
            </div>
          </div>

          <div
            className={
              "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
            }
          >
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
              ].map(({ key, label, icon: Icon, tint }) => (
                <div key={key} className="col-span-12 md:col-span-4">
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
                        onFocus={e => e.target.placeholder = ""}
                        onBlur={e => e.target.placeholder = "0"}
                        value={
                          payload[key as "cash" | "online" | "insurance"] === 0
                            ? ""
                            : payload[
                              key as "cash" | "online" | "insurance"
                            ].toString()
                        }
                        onChange={(e) =>
                          setPayload((prev) => ({
                            ...prev,
                            [key as "cash" | "online" | "insurance"]: Number(
                              e.target.value
                            ),
                          }))
                        }
                        className={
                          "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                          " text-right"
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="col-span-12 h-px bg-slate-200" />
              <div className="col-span-12 md:col-span-3">
                <label className="mb-1 block text-xs text-slate-500">
                  Payer / Insurer
                </label>
                <input
                  value={payload.payer}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, payer: e.target.value }))
                  }
                  placeholder="e.g., Star Health"
                  className={
                    "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                  }
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="mb-1 block text-xs text-slate-500">
                  Policy No.
                </label>
                <input
                  value={payload.policyNo}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      policyNo: e.target.value,
                    }))
                  }
                  placeholder="Policy #"
                  className={
                    "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                  }
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="mb-1 block text-xs text-slate-500">TPA</label>
                <input
                  value={payload.tpa}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, tpa: e.target.value }))
                  }
                  placeholder="TPA name"
                  className={
                    "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                  }
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="mb-1 block text-xs text-slate-500">
                  Pre-Auth No.
                </label>
                <input
                  value={payload.preAuthNo}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      preAuthNo: e.target.value,
                    }))
                  }
                  placeholder="Pre-auth"
                  className={
                    "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                  }
                />
              </div>
            </div>
          </div>

          <div
            className={
              "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
            }
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Notes
            </div>
            <textarea
              value={payload.note}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Add invoice note… (optional)"
              className={
                "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50" +
                " h-28"
              }
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div
            className={
              "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900" +
              " sticky top-4"
            }
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
                  {formatINR(
                    payload.items.reduce(
                      (a, b) => a + b.quantity * b.unitPrice,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium tabular-nums">
                  -
                  {formatINR(payload.items.reduce((a, b) => a + b.discount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">GST</span>
                <span className="font-medium tabular-nums">
                  {formatINR(
                    payload.items.reduce(
                      (a, b) =>
                        a +
                        ((b.quantity * b.unitPrice - b.discount) * b.gst) / 100,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="my-2 h-px bg-slate-200" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatINR(payload.items.reduce((a, b) => a + b.total, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Paid</span>
                <span className="font-medium tabular-nums">
                  {formatINR(payload.cash + payload.online + payload.insurance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="font-semibold">Due</span>
                <span className="font-semibold tabular-nums">
                  {formatINR(
                    payload.items.reduce((a, b) => a + b.total, 0) -
                    (payload.cash + payload.online + payload.insurance)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <PrimaryButton
                className="col-span-full cursor-pointer"
                onClick={generateBill}
              >
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


          </motion.div>
        </div>
      </div>
    </div>
  );
}

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

const calcTotal = (
  unitPrice: number = 0,
  quantity: number = 0,
  discountPct: number = 0,
  gstPct: number = 0
) => {
  const base = unitPrice * quantity;
  const discountAmount = discountPct;
  const taxable = base - discountAmount;
  const gstAmount = taxable * (gstPct / 100);
  return Math.round((taxable + gstAmount) * 100) / 100;
};
