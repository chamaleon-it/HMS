"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ItemTable from "./ItemTable";
import ItemFilter from "./ItemFilter";
import { ViewItem } from "./ViewItem";
import { EditItem } from "./EditItem";
import { AddNewItem } from "./AddNewItem";
import Header from "./Header";
import { FilterType, ItemType } from "./interface";
import useItems from "./useItems";
import { TableSkeleton } from "../components/PharmacySkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useSWR from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function InventoryPage() {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  const { data: profileData } = useSWR<{
    message: string;
    data: {
      pharmacy: {
        inventory: {
          lowStockThreshold: number;
          expiryAlert: number;
          allowNegativeStock: boolean;
        };
      };
    };
  }>("/users/profile");

  const pharmacyInventory = profileData?.data?.pharmacy?.inventory ?? {
    lowStockThreshold: 20,
    expiryAlert: 90,
    allowNegativeStock: false,
  };

  const { data: statsData, isLoading: isLoadingStats } = useSWR<{
    message: string;
    data: {
      totalInventoryValue: number;
      lowStockCount: number;
      outOfStockCount: number;
      topMoving: Array<{
        _id: string;
        name: string;
        totalQuantity: number;
        itemValue: number;
        soldQuantity: number;
      }>;
      lowestMoving: Array<{
        _id: string;
        name: string;
        totalQuantity: number;
        itemValue: number;
        soldQuantity: number;
      }>;
    };
  }>(`/pharmacy/items/statistics/dashboard?lowStockThreshold=${pharmacyInventory.lowStockThreshold}`);

  const stats = statsData?.data ?? {
    totalInventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    topMoving: [],
    lowestMoving: [],
  };

  const [filter, setFilter] = useState<FilterType>({
    page: 1,
    limit: 10,
    q: undefined,
    category: undefined,
    stock: undefined,
    expiry: undefined,
    lowStockThreshold: pharmacyInventory.lowStockThreshold,
    supplier: undefined,
    lowStockItemsView: false,
    slowMovingItemsView: false,
    sortBy: "createdAt",
    orderBy: "desc",
  });

  const { items, total, isLoading, isValidating, mutate, lowStockCount, slowMovingCount } = useItems({
    filter,
  });

  // open overlays
  const handleView = (item: ItemType) => {
    setSelectedItem(item);
    setOpenView(true);
    setOpenEdit(false);
    setOpenAdd(false);
  };

  const handleEdit = (item: ItemType) => {
    setSelectedItem(item);
    setOpenEdit(true);
    setOpenView(false);
    setOpenAdd(false);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setOpenAdd(true);
    setOpenView(false);
    setOpenEdit(false);
  };

  const closeAll = () => {
    setOpenView(false);
    setOpenEdit(false);
    setOpenAdd(false);
  };



  return (
    <AppShell>
      <TooltipProvider>
        <div className="p-5 min-h-[calc(100vh-67px)] w-full">
          <div
            className={`flex flex-col gap-6 ${openView || openEdit || openAdd ? "blur-sm pointer-events-none" : ""
              }`}
          >
            <Header handleAdd={handleAdd} items={items} lowStockCount={lowStockCount} slowMovingCount={slowMovingCount} setFilter={setFilter} lowStockItemsView={filter.lowStockItemsView} slowMovingItemsView={filter.slowMovingItemsView} />

            {/* Inventory Dashboard Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Inventory Value Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Total Inventory Value</p>
                    <p className="text-xs text-slate-400 mt-1">All items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">
                      ₹{(stats.totalInventoryValue ?? 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert Card - Clickable */}
              <div
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    lowStockItemsView: !prev.lowStockItemsView,
                    slowMovingItemsView: false,
                    page: 1,
                  }))
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  filter.lowStockItemsView
                    ? "bg-red-50 border-red-400 shadow-md"
                    : "bg-white border-red-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Low Stock Alert</p>
                    <p className="text-xs text-slate-400 mt-1">Below threshold</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${filter.lowStockItemsView ? "text-red-700" : "text-red-600"}`}>
                      {stats.lowStockCount ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Out of Stock Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Out of Stock</p>
                    <p className="text-xs text-slate-400 mt-1">Quantity = 0</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.outOfStockCount ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Moving Items Card - Clickable */}
              <div
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    topMovingItemsView: !prev.topMovingItemsView,
                    slowMovingItemsView: false,
                    lowStockItemsView: false,
                    page: 1,
                  }))
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  filter.topMovingItemsView
                    ? "bg-green-50 border-green-400 shadow-md"
                    : "bg-white border-green-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Top Moving</p>
                    <p className="text-xs text-slate-400 mt-1">Highest sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {stats.topMoving?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lowest Moving Items Card - Clickable */}
              <div
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    slowMovingItemsView: !prev.slowMovingItemsView,
                    topMovingItemsView: false,
                    lowStockItemsView: false,
                    page: 1,
                  }))
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  filter.slowMovingItemsView
                    ? "bg-amber-50 border-amber-400 shadow-md"
                    : "bg-white border-amber-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Slow Moving</p>
                    <p className="text-xs text-slate-400 mt-1">Lowest sales</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${filter.slowMovingItemsView ? "text-amber-700" : "text-amber-600"}`}>
                      {stats.lowestMoving?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ItemFilter filter={filter} setFilter={setFilter} />

            {isLoading ? (
              <TableSkeleton rows={10} columns={10} />
            ) : (
              <ItemTable
                items={items}
                handleEdit={handleEdit}
                handleView={handleView}
                total={total}
                page={filter.page}
                limit={filter.limit}
                setFilter={setFilter}
                sortBy={filter.sortBy}
                orderBy={filter.orderBy}
                isBusy={isLoading || isValidating}
                mutate={mutate}
                pharmacyInventory={pharmacyInventory}
              />
            )}

          </div>

          <Dialog open={openView || openEdit || openAdd} onOpenChange={closeAll}>
            <DialogContent className={openView ? "max-w-5xl! w-full p-0! max-h-[92vh] overflow-hidden flex flex-col rounded-2xl" : "max-w-2xl! max-h-[90vh] overflow-y-auto p-0! gap-1"}>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  {openView
                    ? "View Item"
                    : openEdit
                      ? "Edit Item"
                      : openAdd
                        ? "New Item"
                        : "Inventory Item"}
                </DialogTitle>
              </DialogHeader>

              <div className="w-full flex-1 overflow-hidden flex flex-col">
                {openView && selectedItem && (
                  <ViewItem
                    item={selectedItem}
                    editItem={() => {
                      setOpenView(false);
                      setOpenEdit(true);
                    }}
                    mutate={mutate}
                    onClose={() => {
                      closeAll();
                      mutate();
                    }}
                  />
                )}

                {openEdit && selectedItem && (
                  <EditItem
                    item={selectedItem}
                    onClose={() => {
                      closeAll();
                      mutate();
                    }}
                  />
                )}

                {openAdd && (
                  <AddNewItem
                    onClose={() => {
                      closeAll();
                      mutate();
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
