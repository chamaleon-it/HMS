// ItemTable.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { FilterType, ItemType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { PaginationBar } from "../components/PaginationBar";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatINR } from "@/lib/fNumber";
import UpdateBatch from "./UpdateBatch";

const getQtyColor = (qty: number, lowStockThreshold: number) => {
  if (qty === 0) return "bg-red-100 text-red-600 font-bold";
  if (qty < lowStockThreshold) return "bg-orange-100 text-orange-600 font-bold";
  return "";
};

interface Props {
  items: ItemType[];
  handleView: (item: ItemType) => void;
  handleEdit: (item: ItemType) => void;
  /** pagination */
  total: number;
  page: number;
  limit: number;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  isBusy?: boolean; // to disable controls while loading
  mutate: () => void;
  pharmacyInventory: {
    lowStockThreshold: number;
    expiryAlert: number;
    allowNegativeStock: boolean;
  }
}

export default function ItemTable({
  items,
  handleView,
  handleEdit,
  total,
  page,
  limit,
  setFilter,
  mutate,
  isBusy,
  pharmacyInventory
}: Props) {
  const deleteItem = useCallback(
    async (_id: string) => {
      await toast.promise(api.delete(`/pharmacy/items/${_id}`), {
        loading: "Item is deleting...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      if (mutate) {
        mutate();
      }
    },
    [mutate]
  );

  return (
    <div className="bg-white/90 border rounded-2xl overflow-hidden shadow-md shadow-slate-200">
      <div className="p-0 m-0">
        <div className="overflow-x-auto w-full">
          <Table className="whitespace-nowrap">
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-700 border-b-0">
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 pl-4">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Sl No</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Item Name</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">HSN</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">SKU</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Category</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Quantity</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">P.Price</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Unit Price (₹)</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Total Value (₹)</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Expiry Date</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Supplier</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Manufacturer</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Status</TableHead>
                <TableHead className="text-white text-right font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4" >Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, i) => (
                <TableRow
                  key={item._id}
                  className={
                    i % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60"
                  }
                >
                  <TableCell className="py-3 pl-4">
                    <Checkbox />
                  </TableCell>
                  <TableCell className="py-3 text-slate-500">{(page - 1) * limit + i + 1}</TableCell>

                  <TableCell className="font-medium text-gray-900">
                    {item.name}
                    <div className="text-xs text-gray-500">
                      (Gen: {item.generic})
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-slate-700">
                    <div className="text-gray-800 text-sm font-medium">
                      HSN: {item.hsnCode}
                    </div>
                  </TableCell>

                  <TableCell className="py-3">{item.sku}</TableCell>
                  <TableCell className="py-3">{item.category}</TableCell>
                  <TableCell className={"py-3 " + getQtyColor(item.quantity, pharmacyInventory.lowStockThreshold)}>
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-3">{formatINR(item.purchasePrice)}</TableCell>
                  <TableCell className="py-3">{formatINR(item.unitPrice)}</TableCell>
                  <TableCell className="py-3">{item?.batches?.length ? formatINR(item?.batches?.reduce((a, b) => a + (b.purchasePrice * b.quantity), 0)) : formatINR(item.quantity * item.purchasePrice)}</TableCell>
                  <TableCell className="py-3">{fDate(item.expiryDate)}</TableCell>
                  <TableCell className="py-3">{item.supplier}</TableCell>
                  <TableCell className="py-3">{item.manufacturer}</TableCell>
                  <TableCell className="py-3">
                    <Chip
                      label={item.status}
                      tone={item.status as "Inactive" | "Active"}
                    />
                  </TableCell>

                  <TableCell className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(item)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>

                      <UpdateBatch item={item} mutate={mutate} />
                      <AlertDialog >
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-sm!">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the item{" "}
                              <span className="font-semibold">
                                {item?.name}
                              </span>
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteItem(item._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={14}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-4">
          <PaginationBar
            page={page}
            limit={limit}
            total={total}
            setFilter={setFilter}
            disabled={isBusy}
          />
        </div>
      </div>
    </div>
  );
}

const Chip: React.FC<{
  label: string;
  tone?:
  | "green"
  | "gray"
  | "red"
  | "blue"
  | "amber"
  | "Upcoming"
  | "Test"
  | "Observation"
  | "Admit"
  | "Consulted"
  | "Not show"
  | "Active"
  | "Inactive";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    // gray: "bg-slate-100 text-slate-700 ring-slate-200",
    Inactive: "bg-rose-50 text-rose-700 ring-rose-200",
    // blue: "bg-sky-50 text-sky-700 ring-sky-200",
    // amber: "bg-amber-50 text-amber-700 ring-amber-200",

    Upcoming: "bg-slate-100 text-slate-700 ring-slate-700",
    Test: "bg-sky-100  text-sky-700 ring-sky-700",
    Observation: "bg-amber-100  text-amber-700 ring-amber-700",
    Admit: "bg-rose-100  text-rose-700 ring-rose-700",
    Consulted: "bg-emerald-100  text-emerald-700 ring-emerald-700",
    "Not show": "bg-red-100 text-red-700 ring-red-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
};
