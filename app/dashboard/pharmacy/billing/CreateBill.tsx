import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import api from "@/lib/axios";

import PrintReceipt from "./PrintReceipt";
import { useBillCalculations } from "./hooks/useBillCalculations";

// Sub-components
import { BillHeader } from "./components/BillHeader";
import { LineItemsTable } from "./components/LineItemsTable";
import { PaymentSection } from "./components/PaymentSection";
import { BillSummary } from "./components/BillSummary";
import { InvoiceNotes } from "./components/InvoiceNotes";

const theme = {
  from: "#4f46e5",
  to: "#ec4899",
  accent: "#06b6d4",
};



export default function CreateBill({
  billingMutate,
  pharmacyBilling
}: {
  billingMutate: () => void;
  pharmacyBilling: {
    autoPrintAfterSave: boolean;
    printDualCopies?: boolean;
    prefix: string;
  }
}) {
  const router = useRouter();


  const defaultPayload = useMemo(() => ({
    patient: "",
    doctor: "",
    department: "",
    items: [],
    cash: 0,
    online: 0,
    discount: 0,
  }), [])


  const [item, setItem] = useState<null | string>(null);
  const itemRef = useRef<null | HTMLInputElement>(null);
  const [payload, setPayload] = useState<{
    patient: string;
    doctor: string;
    department: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      gst?: number;
      total: number;
    }[];
    cash: number;
    online: number;
    discount: number;
    note?: string;
    rxId?: string;
  }>(defaultPayload);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [orderPatient, setOrderPatient] = useState<{ _id: string, mrn: string, name: string } | undefined>(undefined)
  const [savedReceipt, setSavedReceipt] = useState<{ bill: any; patient: any } | null>(null);
  const [printPending, setPrintPending] = useState(false);
  const submittingRef = useRef(false);
  const invoiceRequestId = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderLoadState, setOrderLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");



  // ... inside component ...
  const [openCreate, setOpenCreate] = useState(false);

  const addItem = useCallback(
    (selectedName?: string, selectedPrice?: number) => {
      const nameToAdd = selectedName || item;
      const priceToAdd = selectedPrice ?? 0;

      if (!nameToAdd) {
        itemRef.current?.focus();
        return;
      }

      const existingItem = payload.items.find((it) => it.name === nameToAdd);
      if (existingItem) {
        toast.error("Item already exists.");
        // itemRef.current?.focus();
        return;
      }

      setPayload((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            name: nameToAdd,
            quantity: 1,
            unitPrice: priceToAdd,
            total: calcTotal(priceToAdd, 1),
          },
        ],
      }));

      // itemRef.current?.focus();
      setItem(null);
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
      }>
    ) => {
      setPayload((prev) => {
        const items = prev.items.map((it) => {
          if (it.name !== itemName) return it;
          const unitPrice =
            "unitPrice" in patch ? patch.unitPrice ?? 0 : it.unitPrice ?? 0;
          const quantity =
            "quantity" in patch ? patch.quantity ?? 0 : it.quantity ?? 0;
          const total = calcTotal(unitPrice, quantity);
          return {
            ...it,
            ...patch,
            unitPrice,
            quantity,
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

  const {
    subtotal,
    totalGst,
    roundOffAmount,
    finalTotal,
    totalPaid
  } = useBillCalculations({
    items: payload.items,
    discount: payload.discount,
    payments: {
      cash: payload.cash,
      online: payload.online,
    }
  });

  const saveBill = useCallback(async () => {
    if (submittingRef.current || savedReceipt || orderLoadState === "loading" || orderLoadState === "error") return;
    if (!payload.patient) {
      toast.error("Please select patient.");
      return;
    }
    if (payload.items.length === 0) {
      toast.error("Please add atleast one item.");
      return;
    }
    if (totalPaid > finalTotal + 0.001) {
      toast.error("Payment cannot exceed the bill total.");
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      invoiceRequestId.current ??= window.crypto.randomUUID();
      const response = await toast.promise(api.post("/billing", { ...payload, clientRequestId: invoiceRequestId.current, doctor: payload.doctor || "Self" }), {
        loading: "Saving bill...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      billingMutate();
      if (pharmacyBilling.autoPrintAfterSave) {
        setSavedReceipt({ bill: response.data.data, patient: selectedPatient || orderPatient });
        setPrintPending(true);
      } else {
        setPayload(defaultPayload);
        router.push("/dashboard/pharmacy");
      }
    } catch (error) {
      // The toast displays the server error.
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [payload, billingMutate, defaultPayload, router, pharmacyBilling.autoPrintAfterSave,
    savedReceipt, selectedPatient, orderPatient, totalPaid, finalTotal, orderLoadState]);



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderMrn = urlParams.get("mrn");


    if (!orderMrn) return;
    let cancelled = false;
    setOrderLoadState("loading");

    setPayload((prev) => ({
      ...prev,
      rxId: orderMrn,
    }))

    api
      .get<{
        data: {
          items: any[], discount: number, patient: { _id: string, mrn: string, name: string }, doctor: {
            _id: string,
            name: string,
            specialization: string,
          }
        }
      }>(`/pharmacy/orders/single?q=${orderMrn}`)
      .then(({ data }) => {
        if (cancelled) return;
        const order = data.data as any;

        const itemsFromApi: {
          name: string;
          quantity: number;
          unitPrice: number;
          discount: number;
          gst: number;
          total: number;
          itemId?: string;
          batchId?: string | null;
          batchNumber?: string | null;
          expiryDate?: string | Date | null;
          mrp?: number | null;
          purchasePrice?: number | null;
          supplier?: string | null;
          packing?: number | null;
        }[] = order.items.map((item: any) => ({
          name: item.name.name,
          quantity: item.quantity,
          unitPrice: item.batchSellingPrice ?? item.name.unitPrice,
          discount: 0,
          gst: item.batchGst ?? 0,
          total: item.quantity * (item.batchSellingPrice ?? item.name.unitPrice),
          itemId: item.name._id,
          batchId: item.batchId || null,
          batchNumber: item.batchNumber || null,
          expiryDate: item.batchExpiryDate || null,
          mrp: item.batchMrp ?? item.name.mrp,
          purchasePrice: item.batchPurchasePrice ?? item.name.purchasePrice,
          supplier: item.batchSupplier || item.name.supplier || null,
          packing: item.batchPacking ?? item.name.packing ?? 1,
        }));

        // 🔹 Remove duplicates by `name`
        const uniqueItems = Array.from(
          new Map<string, {
            name: string;
            quantity: number;
            unitPrice: number;
            discount: number;
            gst: number;
            total: number;
          }>(
            itemsFromApi.map(item => [item.name, { ...item }])
          ).values()
        );

        setPayload((prev) => ({
          ...prev,
          items: uniqueItems,
          discount: (order.discount ?? 0),
          cash: 0,
          online: 0,
          patient: order.patient._id || "",
          // Use stored doctorName first; fall back to populated doctor name; null/empty → "-"
          doctor: order.doctorName && order.doctorName !== "-" && order.doctorName !== ""
            ? order.doctorName
            : (order.doctor?.name || ""),
          department: order.doctor?.specialization || "",
        }));
        setOrderPatient(order.patient)
        setSelectedPatient(order.patient)
        setOrderLoadState("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setOrderLoadState("error");
        toast.error("Could not load the order. Please reload before creating its bill.");
      });
    return () => { cancelled = true; };
  }, []);



  useEffect(() => {
    const handleAfterPrint = () => router.push("/dashboard/pharmacy");
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [router]);

  useEffect(() => {
    if (!printPending || !savedReceipt) return;
    const timer = window.setTimeout(() => {
      window.print();
      setPrintPending(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [printPending, savedReceipt]);

  if (orderLoadState === "loading") {
    return <div className="p-6 text-sm text-slate-600">Loading order items before billing…</div>;
  }

  if (orderLoadState === "error") {
    return <div className="p-6 text-sm text-red-700">The order could not be loaded. Reload this page before creating its bill.</div>;
  }


  return (
    <div className="space-y-4">
      <BillHeader
        theme={theme}
        payload={payload}
        setPayload={setPayload}
        orderPatient={orderPatient}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
      />


      <div className="flex flex-col gap-4 relative z-0 print:hidden">

        <div className="w-full space-y-4">
          <LineItemsTable
            payload={payload}
            updateQty={updateQty}
            updatePrice={updatePrice}
            removeItem={removeItem}
            addItem={addItem}
            item={item}
            setItem={setItem}
            itemRef={itemRef}
            PrimaryButton={PrimaryButton}
          />

          <PaymentSection payload={payload} setPayload={setPayload} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col h-full">
            <InvoiceNotes payload={payload} setPayload={setPayload} />
          </div>

          <div className="lg:col-span-4 h-full">
            <BillSummary
              subtotal={subtotal}
              totalGst={totalGst}
              roundOffAmount={roundOffAmount}
              finalTotal={finalTotal}
              payload={payload}
              saveBill={saveBill}
              saving={isSubmitting}
              PrimaryButton={PrimaryButton}
            />
          </div>
        </div>
      </div>

      {/* Printable Receipt Component — Rx page only when dual-copy setting is on */}
      {savedReceipt && <PrintReceipt
        payload={{
          ...savedReceipt.bill,
          patient: savedReceipt.patient?.name || "",
        }}
        patient={savedReceipt.patient}
        withPrescription={!!pharmacyBilling.printDualCopies}
        invoiceDetails={{
          invoiceNo: savedReceipt.bill.mrn,
          invoiceDate: savedReceipt.bill.createdAt,
        }}
      />}
    </div >
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
) => {
  return Math.round(unitPrice * quantity * 100) / 100;
};
