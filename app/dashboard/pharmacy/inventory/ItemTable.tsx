// ItemTable.tsx
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { FilterType, ItemType, itemDisplayUnitPrice, itemActiveQuantity, batchPurchaseRate } from "./interface";
import { fDate } from "@/lib/fDateAndTime";
import { PaginationBar } from "../components/PaginationBar";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ArrowUpDown, AlertCircle, AlertTriangle, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useAuth } from "@/auth/context/auth-context";


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
  };
  sortBy?: "createdAt" | "quantity";
  orderBy?: "desc" | "asc";
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
  pharmacyInventory,
  sortBy,
  orderBy
}: Props) {
  const { user } = useAuth();

  // Pharmacy staff get a read-only master: stock arrives via Purchase Entry and
  // Update Batch, and only administrators may edit or delete an item.
  const canManageItems =
    user?.role === "Admin" || user?.role === "Super Admin";

  const handleSort = (field: "createdAt" | "quantity") => {
    setFilter((prev: FilterType): FilterType => ({
      ...prev,
      sortBy: field,
      orderBy: prev.sortBy === field && prev.orderBy === "desc" ? "asc" : "desc",
    }));
  };

  const getItemStock = (item: ItemType) => itemActiveQuantity(item);

  const getItemTotalValue = (item: ItemType) => {
    const itemStock = getItemStock(item);
    return (itemStock > 0 ? itemStock : 0) * itemDisplayUnitPrice(item);
  };

  const latestActiveBatch = (item: ItemType) => {
    const batches = (item.batches || []).filter(
      (b) => String(b.status || "active").toLowerCase() !== "inactive",
    );
    if (!batches.length) return undefined;
    return [...batches].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    )[0];
  };

  const getItemPurchase = (item: ItemType) => {
    const b = latestActiveBatch(item);
    return b ? batchPurchaseRate(b) : Number(item.purchasePrice) || 0;
  };

  const getItemMrp = (item: ItemType) => {
    const b = latestActiveBatch(item);
    return b ? Number(b.mrp) || 0 : Number(item.mrp) || 0;
  };

  const getItemSupplier = (item: ItemType) => {
    const b = latestActiveBatch(item);
    return b?.supplier || item.supplier || "-";
  };

  const totalPageStock = items.reduce((sum, item) => sum + getItemStock(item), 0);
  const totalPageSold = items.reduce((sum, item) => sum + (Number(item.soldQuantity) || 0), 0);
  const totalPageValue = items.reduce((sum, item) => sum + getItemTotalValue(item), 0);

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
          <Table className="whitespace-nowrap min-w-[1350px]">
            <TableHeader className="bg-slate-700 hover:bg-slate-700">
              <TableRow className="bg-slate-700 hover:bg-slate-800 border-b-0">

                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Sl No</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Item Name</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Rack</TableHead>
                <SortableHeader
                  label="Quantity"
                  field="quantity"
                  currentSortBy={sortBy}
                  currentSortOrder={orderBy}
                  onSort={handleSort}
                />
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Purchase Rate</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Unit Price (₹)</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">MRP (₹)</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Total Value (₹)</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Expiry Date</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Supplier</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Status</TableHead>
                <TableHead className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5">Item Sold</TableHead>
                <TableHead className="text-white text-right font-bold text-[11px] uppercase tracking-wider py-2.5 pr-4" >Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, i) => {
                const itemStock = getItemStock(item);
                const itemTotalValue = getItemTotalValue(item);

                return (
                  <TableRow
                    key={item._id}
                    className={
                      i % 2 === 0
                        ? "bg-white hover:bg-white/60"
                        : "bg-slate-100 hover:bg-slate-100/60"
                    }
                  >
                    <TableCell className="py-3 text-slate-500">{(page - 1) * limit + i + 1}</TableCell>

                    <TableCell className="font-medium text-gray-900">
                      {item.name}
                      <div className="text-xs text-gray-500">
                        (Gen: {item.generic})
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-slate-700">
                      {item.rackLocation || "-"}
                    </TableCell>

                    <TableCell className="py-3">
                      {(() => {
                        if (itemStock <= 0) {
                          return (
                            <div className="flex items-center gap-1.5 text-red-600 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Out of Stock</span>
                            </div>
                          );
                        }
                        if (itemStock <= pharmacyInventory.lowStockThreshold) {
                          return (
                            <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{itemStock}</span>
                            </div>
                          );
                        }
                        return (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium pl-2">
                            {itemStock}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-3">{formatINR(getItemPurchase(item))}</TableCell>
                    <TableCell className="py-3">{formatINR(itemDisplayUnitPrice(item))}</TableCell>
                    <TableCell className="py-3">{formatINR(getItemMrp(item))}</TableCell>
                    <TableCell className="py-3 font-semibold text-slate-800 tabular-nums">
                      {formatINR(itemTotalValue)}
                    </TableCell>
                    <TableCell className="py-3">
                      {item.expiryDate && new Date(item.expiryDate) < new Date() ? (
                        <div className="flex items-center gap-1.5 text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>{fDate(item.expiryDate)}</span>
                        </div>
                      ) : item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + pharmacyInventory.expiryAlert * 24 * 60 * 60 * 1000) ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{fDate(item.expiryDate)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-700">{item.expiryDate ? fDate(item.expiryDate) : "—"}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">{getItemSupplier(item)}</TableCell>
                    <TableCell className="py-3">
                      <Chip
                        label={item.status}
                        tone={item.status as "Inactive" | "Active"}
                      />
                    </TableCell>

                    <TableCell className="py-3 font-medium text-slate-700">
                      {item.soldQuantity ?? 0}
                      
                    </TableCell>

                    <TableCell className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        {canManageItems && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Item</TooltipContent>
                          </Tooltip>
                        )}

                        <UpdateBatch item={item} mutate={mutate} />

                        {canManageItems && (
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Delete Item</TooltipContent>
                          </Tooltip>

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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {items.length > 0 && (
              <TableFooter className="sticky bottom-0 z-10 bg-slate-100 font-extrabold text-[12px] text-slate-900 border-t-2 border-slate-300">
                <TableRow className="hover:bg-slate-100 bg-slate-100">
                  <TableCell colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider font-bold text-slate-700">
                    Page Total
                  </TableCell>
                  <TableCell className="py-3 text-slate-900 font-bold tabular-nums pl-2">
                    {totalPageStock}
                  </TableCell>
                  <TableCell className="py-3" />
                  <TableCell className="py-3" />
                  <TableCell className="py-3" />
                  <TableCell className="py-3 font-bold text-slate-900 tabular-nums">
                    {formatINR(totalPageValue)}
                  </TableCell>
                  <TableCell className="py-3" />
                  <TableCell className="py-3" />
                  <TableCell className="py-3" />
                  <TableCell className="py-3 font-bold text-slate-900 tabular-nums">
                    {totalPageSold}
                  </TableCell>
                  <TableCell className="py-3 pr-4" />
                </TableRow>
              </TableFooter>
            )}
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
  | "Consulted"
  | "Not show"
  | "Active"
  | "Inactive"
  | "LowStock"
  | "OutOfStock";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Inactive: "bg-rose-50 text-rose-700 ring-rose-200",
    Upcoming: "bg-slate-100 text-slate-700 ring-slate-700",
    Consulted: "bg-emerald-100  text-emerald-700 ring-emerald-700",
    "Not show": "bg-red-100 text-red-700 ring-red-700",
    LowStock: "bg-orange-100 text-orange-800 ring-orange-200", // Darker text on lighter bg
    OutOfStock: "bg-red-100 text-red-800 ring-red-200", // Darker text on lighter bg
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
};

const SortableHeader = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
}: {
  label: string;
  field: "createdAt" | "quantity";
  currentSortBy?: string;
  currentSortOrder?: "desc" | "asc";
  onSort: (field: "createdAt" | "quantity") => void;
}) => {
  const isActive = currentSortBy === field;

  return (
    <TableHead
      className="text-white font-bold text-[11px] uppercase tracking-wider py-2.5 cursor-pointer hover:bg-slate-600 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 group">
        {label}
        <div className={`transition-opacity ${isActive ? "opacity-100" : "opacity-30 group-hover:opacity-100"}`}>
          {isActive && currentSortOrder === "asc" ? (
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
          ) : isActive && currentSortOrder === "desc" ? (
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </TableHead>
  );
};
