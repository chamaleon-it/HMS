"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ItemTable from "@/app/dashboard/pharmacy/inventory/ItemTable";
import ItemFilter from "@/app/dashboard/pharmacy/inventory/ItemFilter";
import { ViewItem } from "@/app/dashboard/pharmacy/inventory/ViewItem";
import { EditItem } from "@/app/dashboard/pharmacy/inventory/EditItem";
import { AddNewItem } from "@/app/dashboard/pharmacy/inventory/AddNewItem";
import Header from "@/app/dashboard/pharmacy/inventory/Header";
import { FilterType, ItemType } from "@/app/dashboard/pharmacy/inventory/interface";
import useItems from "@/app/dashboard/pharmacy/inventory/useItems";
import InventoryStatsCards, { InventoryStats } from "@/app/dashboard/pharmacy/inventory/InventoryStatsCards";
import { TableSkeleton } from "@/app/dashboard/pharmacy/components/PharmacySkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import useSWR from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminInventoryPage() {
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

  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useSWR<{
    message: string;
    data: InventoryStats;
  }>(
    `/pharmacy/items/stats?lowStockThreshold=${pharmacyInventory.lowStockThreshold}`
  );

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
    sortBy: "createdAt",
    orderBy: "desc",
  });

  const { items, total, isLoading, isValidating, mutate, lowStockCount } = useItems({
    filter,
  });

  const refreshAll = () => {
    mutate();
    mutateStats();
  };

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
            className={`flex flex-col gap-6 ${
              openView || openEdit || openAdd ? "blur-sm pointer-events-none" : ""
            }`}
          >
            <Header
              handleAdd={handleAdd}
              items={items}
              lowStockCount={lowStockCount}
              setFilter={setFilter}
              lowStockItemsView={filter.lowStockItemsView}
            />

            <InventoryStatsCards
              stats={statsResponse?.data}
              isLoading={isStatsLoading}
              lowStockThreshold={pharmacyInventory.lowStockThreshold}
              filter={filter}
              setFilter={setFilter}
            />

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
                mutate={refreshAll}
                pharmacyInventory={pharmacyInventory}
              />
            )}
          </div>

          <Dialog open={openView || openEdit || openAdd} onOpenChange={closeAll}>
            <DialogContent
              className={
                openView
                  ? "max-w-3xl! w-full"
                  : "max-w-2xl! max-h-[90vh] overflow-y-auto p-0! gap-1"
              }
            >
              <DialogHeader className="flex justify-between items-center border-b p-0!" />

              <div>
                {openView && selectedItem && (
                  <ViewItem
                    item={selectedItem}
                    editItem={() => {
                      setOpenView(false);
                      setOpenEdit(true);
                    }}
                    mutate={refreshAll}
                    onClose={() => {
                      closeAll();
                      refreshAll();
                    }}
                  />
                )}

                {openEdit && selectedItem && (
                  <EditItem
                    item={selectedItem}
                    onClose={() => {
                      closeAll();
                      refreshAll();
                    }}
                  />
                )}

                {openAdd && (
                  <AddNewItem
                    onClose={() => {
                      closeAll();
                      refreshAll();
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
