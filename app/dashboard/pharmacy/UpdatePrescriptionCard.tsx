import React, { useState } from "react";

import { Item, OrderType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import UpdateMedicine from "./UpdateMedicine";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ------------------ Types ------------------
interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

export default function UpdatePrescriptionCard({
  data,
  setData,
  onTogglePacked,
}: {
  data: OrderType;
  setData: React.Dispatch<React.SetStateAction<OrderType>>;
  onTogglePacked: (item: any) => void;
}) {
  const updateField = (
    idx: number,
    key: keyof Medicine,
    val: string | number
  ) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const addMedicineRow = (m: Item) => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        m,
      ],
    }));
  };

  const removeMedicineRow = (idx: number) => {
    setData((prev) => ({
      ...prev,
      items:
        prev.items.length === 1 ? [] : prev.items.filter((_, i) => i !== idx),
    }));
  };

  const subTotal = data.items.reduce((a, b) => a + (b.quantity || 0) * (b.name.unitPrice || 0), 0);


  return (
    <div className="rounded-lg border">
      <div className="overflow-hidden rounded-t-lg">
        <table className="w-full text-[15px]">
          <thead className="bg-slate-700 hover:bg-slate-700 text-white">
            <tr className="w-full">
              <th className="w-[5%] p-2 text-left">Sl</th>
              <th className="w-[25%] p-2 text-left">Drug</th>
              <th className="w-[10%] p-2 text-left">Exp</th>
              <th className="w-[10%] p-2 text-center">Available</th>
              <th className="w-[10%] p-2 text-right">Qty</th>
              <th className="w-[10%] p-2 text-right">MRP</th>
              <th className="w-[10%] p-2 text-right">Amount</th>
              <th className="w-[10%] p-2 text-center">Packed</th>
              <th className="w-[10%] p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((m, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50/80 transition-all duration-200 group">
                <td className="p-4 align-middle text-slate-500 font-medium text-sm">{i + 1}</td>
                <td className="p-4 align-middle">
                  <div className="relative w-full">
                    <input
                      placeholder="Drug Name"
                      type="text"
                      disabled
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
                      value={m.name.name}
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1 pl-0.5">
                    {m.name.generic ? <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Gen: {m.name.generic}</span> : null}
                  </div>
                </td>
                <td className="p-4 align-middle text-sm text-slate-600">
                  {fDate(m.name.expiryDate)}
                </td>
                <td className="p-4 align-middle text-center font-medium text-slate-700">
                  {m.name.quantity}
                </td>
                <td className="p-4 align-middle">
                  <QuantityInput i={i} m={m} updateField={updateField} />
                </td>
                <td className="p-4 align-middle text-right text-sm font-medium text-slate-600 whitespace-nowrap">
                  {formatINR(m.name.unitPrice)}
                </td>
                <td className="p-4 align-middle text-right text-sm font-semibold text-slate-800 whitespace-nowrap">
                  {formatINR((m.quantity || 0) * (m.name.unitPrice || 0))}
                </td>
                <td className="p-4 align-middle text-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-emerald-600 cursor-pointer"
                    checked={m.isPacked}
                    onChange={() => onTogglePacked(m)}
                  />
                </td>
                <td className="p-4 align-middle text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => removeMedicineRow(i)}
                    title="Remove medicine"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-slate-50 flex flex-col gap-3 rounded-b-lg">
        <UpdateMedicine addMedicineRow={addMedicineRow} />

        <div className="flex flex-col gap-2 mt-2 w-full max-w-xs ml-auto border-t pt-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Sub Total</span>
            <span>{formatINR(subTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Discount %</span>
            <input
              type="number"
              min="0"
              className="w-24 text-right bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500"
              placeholder="0"
              onChange={(e) => {
                const pct = parseFloat(e.target.value) || 0;
                const amt = (pct / 100) * subTotal;
                setData(prev => ({ ...prev, discount: amt }));
              }}
              value={
                subTotal && data.discount
                  ? parseFloat(((data.discount / subTotal) * 100).toFixed(2))
                  : ""
              }
            />
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Discount ₹</span>
            <input
              type="number"
              min="0"
              value={data.discount ? parseFloat(data.discount.toFixed(2)) : ""}
              onChange={(e) => setData(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))}
              className="w-24 text-right bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between text-md font-semibold text-slate-800 border-t pt-2">
            <span>Grand Total</span>
            <span>{formatINR(subTotal - (data.discount || 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const QuantityInput = ({
  updateField,
  i,
  m,
}: {
  updateField: (idx: number, key: any, val: string | number) => void;
  i: number;
  m: Item;
}) => {
  const [openWarning, setOpenWarning] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <input
          placeholder="0"
          type="number"
          min="0"
          onChange={(e) =>
            updateField(i, "quantity", parseInt(e.target.value) || 0)
          }
          onBlur={(e) => {
            const value = parseInt(e.target.value) || 0;
            if (value > m.name.quantity) {
              setOpenWarning(true);
            }
          }}
          inputMode="numeric"
          className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          value={m.quantity ? (m?.quantity === 0 ? "" : m?.quantity) : ""}
        />
      </div>
      <AlertDialog open={openWarning} onOpenChange={setOpenWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Available quantity: {m.name.quantity} <br />
              Entered quantity: {m.quantity}
              <br />
              <br />
              <span className="text-destructive">
                The quantity you entered exceeds the available stock.
              </span>{" "}
              Do you want to continue anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                updateField(i, "quantity", 0);
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
