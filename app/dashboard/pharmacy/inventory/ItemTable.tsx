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
import { PaginationBar } from "./PaginationBar";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const getQtyColor = (qty: number) => {
  if (qty === 0) return "bg-red-100 text-red-600 font-bold";
  if (qty < 20) return "bg-orange-100 text-orange-600 font-bold";
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
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700 hover:bg-slate-700 text-white">
                <TableHead className="text-white">Sl. No</TableHead>
                <TableHead className="text-white">Item Name</TableHead>
                <TableHead className="text-white">Generic / HSN</TableHead>
                <TableHead className="text-white">SKU / Barcode</TableHead>
                <TableHead className="text-white">Category</TableHead>
                <TableHead className="text-white">Quantity</TableHead>
                <TableHead className="text-white">P.Price</TableHead>
                <TableHead className="text-white">Unit Price (₹)</TableHead>
                <TableHead className="text-white">Total Value (₹)</TableHead>
                <TableHead className="text-white">Expiry Date</TableHead>
                <TableHead className="text-white">Supplier</TableHead>
                <TableHead className="text-white">Manufacturer</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, i) => (
                <TableRow
                  key={item._id}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <TableCell>{(page - 1) * limit + i + 1}</TableCell>

                  <TableCell className="font-medium text-gray-900">
                    {item.name}
                    <div className="text-xs text-gray-500">
                      (Gen: {item.generic})
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-gray-600">
                    <div className="text-gray-800 text-sm font-medium">
                      HSN: {item.hsnCode}
                    </div>
                  </TableCell>

                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className={getQtyColor(item.quantity)}>
                    {item.quantity}
                  </TableCell>
                  <TableCell>₹ {item.purchasePrice}</TableCell>
                  <TableCell>₹ {item.unitPrice}</TableCell>
                  <TableCell>₹ {item.quantity * item.unitPrice}</TableCell>
                  <TableCell>{fDate(item.expiryDate)}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.manufacturer}</TableCell>
                  <TableCell>{item.status}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
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
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItem(item._id)}
                      >
                        Delete
                      </Button>
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
      </CardContent>
    </Card>
  );
}
