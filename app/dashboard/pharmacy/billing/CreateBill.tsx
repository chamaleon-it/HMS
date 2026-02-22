import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";
import api from "@/lib/axios";

import usePrint from "./usePrint";
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
    defaultGst?: number | undefined;
    roundOff: boolean;
    prefix: string;
  }
}) {


  const defaultPayload = useMemo(() => ({
    patient: "",
    doctor: "",
    department: "",
    items: [],
    cash: 0,
    insurance: 0,
    online: 0,
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
    online: number;
    insurance: number;
    discount: number;
    payer?: string;
    policyNo?: string;
    tpa?: string;
    preAuthNo?: string;
    note?: string;
    rxId?: string;
  }>(defaultPayload);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);



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
        itemRef.current?.focus();
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

      itemRef.current?.focus();
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
      await toast.promise(api.post("/billing", payload), {
        loading: "We are generating this bill.",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      onClick();
      setPayload(defaultPayload);
      billingMutate();
    } catch (error) {
      // Handle error
    }
  }, [payload, billingMutate, defaultPayload]);


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

        const itemsFromApi: {
          name: string;
          quantity: number;
          unitPrice: number;
          discount: number;
          gst: number;
          total: number;
        }[] = data.data.items.map(item => ({
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
          discount: (data.data.discount ?? 0),
          cash: 0,
          insurance: 0,
          online: 0,
          patient: data.data.patient._id || "",
          doctor: data.data.doctor.name || "",
          department: data.data.doctor.specialization || "",
        }));
        setOrderPatient(data.data.patient)
        setSelectedPatient(data.data.patient)
      });
  }, []);



  const { onClick, downloadPdf } = usePrint()

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
      online: payload.online,
      insurance: payload.insurance
    }
  });

  return (
    <div className="space-y-4">
      <BillHeader
        theme={theme}
        payload={payload}
        setPayload={setPayload}
        orderPatient={orderPatient}
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
        payload={payload}
        patient={selectedPatient}
        invoiceDetails={{
          prefix: pharmacyBilling.prefix,
          roundOffAmount: roundOffAmount,
          subtotal: subtotal,
          totalGst: totalGst,
          grandTotal: finalTotal
        }}
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
