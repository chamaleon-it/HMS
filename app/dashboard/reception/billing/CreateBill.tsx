import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import api from "@/lib/axios";

import usePrint from "./usePrint";
import PrintReceipt from "./PrintReceipt";
import { useBillCalculations } from "./hooks/useBillCalculations";
import { getDecimal } from "@/lib/fNumber";

// Sub-components
import { BillHeader } from "./components/BillHeader";
import { LineItemsTable } from "./components/LineItemsTable";
import { PaymentSection } from "./components/PaymentSection";
import { BillSummary } from "./components/BillSummary";
import { InvoiceNotes } from "./components/InvoiceNotes";

const theme = {
  from: "var(--color-synapse-light)",
  to: "var(--color-synapse-purple)",
  accent: "#06b6d4",
};



export default function CreateBill({
  billingMutate,
  pharmacyBilling
}: {
  billingMutate: () => void;
  pharmacyBilling: {
    autoPrintAfterSave: boolean;
    defaultGst?: number | undefined;
    roundOff: boolean;
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
    upi: 0,
    card: 0,
    discount: 0,
    roundOff: pharmacyBilling.roundOff
  }), [pharmacyBilling.roundOff])


  const [item, setItem] = useState<null | string>(null);
  const itemRef = useRef<null | HTMLInputElement>(null);
  const [payload, setPayload] = useState<{
    roundOff: boolean,
    patient: string;
    doctor: string;
    department: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      gst: number;
      total: number;
    }[];
    cash: number;
    card: number;
    upi: number;
    discount: number;
    payer?: string;
    policyNo?: string;
    tpa?: string;
    preAuthNo?: string;
    note?: string;
    rxId?: string;
  }>(defaultPayload);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [printBillData, setPrintBillData] = useState<any | null>(null);

  const {
    subtotal,
    totalGst,
    roundOffAmount,
    finalTotal,
    totalPaid,
    dueAmount
  } = useBillCalculations({
    items: payload.items,
    discount: payload.discount,
    roundOff: pharmacyBilling.roundOff,
    payments: {
      cash: payload.cash,
      card: payload.card,
      upi: payload.upi
    }
  });



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
            gst: pharmacyBilling.defaultGst ?? 0,
            quantity: 1,
            unitPrice: priceToAdd,
            total: calcTotal(priceToAdd, 1, pharmacyBilling.defaultGst ?? 0),
          },
        ],
      }));

      // itemRef.current?.focus();
      setItem(null);
    },
    [item, payload.items, pharmacyBilling.defaultGst]
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
          const gst = "gst" in patch ? patch.gst ?? 0 : it.gst ?? 0;
          const total = calcTotal(unitPrice, quantity, gst);
          return {
            ...it,
            ...patch,
            unitPrice,
            quantity,
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

  const generateBill = useCallback(async () => {
    if (!payload.patient) {
      toast.error("Please select patient.");
      return;
    }
    if (payload.items.length === 0) {
      toast.error("Please add atleast one item.");
      return;
    }
    try {
      const response = await toast.promise(api.post("/billing", { ...payload, cash: payload.cash - (Math.max(0, totalPaid - finalTotal)), doctor: payload.doctor || "Self" }), {
        loading: "We are generating this bill.",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      if (response?.data?.data) {
        setPrintBillData({
          ...response.data.data,
          patient: selectedPatient
        });
      }
      setPayload(defaultPayload);
      billingMutate();
    } catch (error) {
      // Handle error
    }
  }, [payload, billingMutate, defaultPayload, selectedPatient, totalPaid, finalTotal]);

  const saveBill = useCallback(async () => {
    if (!payload.patient) {
      toast.error("Please select patient.");
      return;
    }
    if (payload.items.length === 0) {
      toast.error("Please add atleast one item.");
      return;
    }
    try {
      await toast.promise(api.post("/billing", { ...payload, cash: payload.cash - (Math.max(0, totalPaid - finalTotal)), doctor: payload.doctor || "Self" }), {
        loading: "Saving bill...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      setPayload(defaultPayload);
      billingMutate();
      router.push("/dashboard/reception/billing");
    } catch (error) {
      // Handle error
    }
  }, [payload, billingMutate, defaultPayload, router]);


  const [orderPatient, setOrderPatient] = useState<{ _id: string, mrn: string, name: string } | undefined>(undefined)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderMrn = urlParams.get("mrn");


    if (!orderMrn) return;

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
        const order = data.data as any;

        const itemsFromApi: {
          name: string;
          quantity: number;
          unitPrice: number;
          discount: number;
          gst: number;
          total: number;
        }[] = order.items.map((item: any) => ({
          name: item.name.name,
          quantity: item.quantity,
          unitPrice: item.name.unitPrice,
          discount: 0,
          gst: 0,
          total: item.quantity * item.name.unitPrice,
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
          upi: 0,
          card: 0,
          patient: order.patient._id || "",
          // Use stored doctorName first; fall back to populated doctor name; null/empty → "-"
          doctor: order.doctorName && order.doctorName !== "-" && order.doctorName !== ""
            ? order.doctorName
            : (order.doctor?.name || ""),
          department: order.doctor?.specialization || "",
        }));
        setOrderPatient(order.patient)
        setSelectedPatient(order.patient)
      });
  }, []);



  const { onClick, downloadPdf } = usePrint({
    onAfterPrint: () => router.push("/dashboard/reception/billing")
  })

  useEffect(() => {
    if (printBillData) {
      const timer = setTimeout(() => {
        onClick();
        setPrintBillData(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printBillData, onClick]);



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
            updateGST={updateGST}
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
              totalPaid={totalPaid}
              dueAmount={dueAmount}
              payload={payload}
              saveBill={saveBill}
              generateBill={generateBill}
              onPrint={onClick}
              downloadPdf={downloadPdf}
              PrimaryButton={PrimaryButton}
            />
          </div>
        </div>
      </div>

      {/* Printable Receipt Component */}
      <PrintReceipt
        payload={printBillData ? {
          patient: printBillData.patient?.name || "",
          items: printBillData.items,
          cash: printBillData.cash,
          card: printBillData.card,
          upi: printBillData.upi,
          discount: printBillData.discount,
          doctor: typeof printBillData.doctor === "object" ? printBillData.doctor?.name : (printBillData.doctor === "Self" ? "" : printBillData.doctor),
          department: typeof printBillData.doctor === "object" ? printBillData.doctor?.specialization : printBillData.department,
        } : payload}
        patient={printBillData ? printBillData.patient : selectedPatient}
        invoiceDetails={{
          prefix: pharmacyBilling.prefix,
          roundOffAmount: printBillData
            ? (printBillData.roundOff ? getDecimal(printBillData.items.reduce((a: any, b: any) => a + b.total, 0)) : 0)
            : roundOffAmount,
          subtotal: printBillData
            ? printBillData.items.reduce((a: any, b: any) => a + b.unitPrice * b.quantity, 0)
            : subtotal,
          totalGst: printBillData
            ? printBillData.items.reduce((a: any, b: any) => a + (b.total - b.unitPrice * b.quantity), 0)
            : totalGst,
          grandTotal: printBillData
            ? printBillData.items.reduce((a: any, b: any) => a + b.total, 0)
            : finalTotal,
          invoiceNo: printBillData?.mrn,
        }}
        invoiceNo={printBillData?.mrn}
      />
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
  gstPct: number = 0
) => {
  const base = unitPrice * quantity;
  const gstAmount = base * (gstPct / 100);
  return Math.round((base + gstAmount) * 100) / 100;
};
