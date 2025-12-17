import React from "react";

import { Item, OrderType } from "./interface";
import Medicine from "./Medicine";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import UpdateMedicine from "./UpdateMedicine";
import { fDate } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";

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
                  <div className="flex justify-end">
                    <input
                      placeholder="0"
                      type="number"
                      min="0"
                      onChange={(e) =>
                        updateField(i, "quantity", parseInt(e.target.value) ?? 0)
                      }
                      inputMode="numeric"
                      className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      value={m.quantity ? (m?.quantity === 0 ? "" : m?.quantity) : ""}
                    />
                  </div>
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
      <div className="p-4 border-t bg-slate-50 rounded-b-lg">
        <UpdateMedicine addMedicineRow={addMedicineRow} />
      </div>
    </div>
  );
}
