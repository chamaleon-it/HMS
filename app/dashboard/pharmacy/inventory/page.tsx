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
import { formatINR } from "@/lib/fNumber";
import useSWR from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function InventoryPage() {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  const { data } = useSWR<{
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

  const pharmacyInventory = data?.data.pharmacy.inventory ?? {
    lowStockThreshold: 20,
    expiryAlert: 90,
    allowNegativeStock: false,
  };

  const [filter, setFilter] = useState<FilterType>({
    page: 1,
    limit: 10,
    q: undefined,
    category: undefined,
    stock: undefined,
    expiry: undefined,
    lowStockThreshold: pharmacyInventory.lowStockThreshold,
    sortBy: "createdAt",
    order: "desc",
  });

  const { items, total, isLoading, isValidating, mutate, lowStockCount } = useItems({
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
        <div className="p-5 min-h-[calc(100vh-80px)] w-full">
          <div
            className={`flex flex-col gap-6 ${openView || openEdit || openAdd ? "blur-sm pointer-events-none" : ""
              }`}
          >
            <Header handleAdd={handleAdd} items={items} lowStockCount={lowStockCount} />

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
                isBusy={isLoading || isValidating}
                mutate={mutate}
                pharmacyInventory={pharmacyInventory}
              />
            )}

            {/* Footer */}
            {/* <div className="flex justify-between text-sm text-gray-600">
            <p>Total Items: {items.length}</p>
            <p>
              Total Value:{" "}
              {formatINR(
                items?.reduce((a, b) => a + b.unitPrice * b.quantity, 0)
              )}
            </p>
          </div> */}
          </div>

          <Dialog open={openView || openEdit || openAdd} onOpenChange={closeAll}>
            <DialogContent className={openView ? "max-w-3xl! w-full" : "max-w-2xl!" + " max-h-[90vh] overflow-y-auto p-0 gap-1"}>
              <DialogHeader className="flex justify-between items-center border-b p-4">
                <DialogTitle>
                  {openView
                    ? "View Item"
                    : openEdit
                      ? "Edit Item"
                      : openAdd
                        ? "Add New Item"
                        : ""}
                </DialogTitle>
              </DialogHeader>

              <div className="p-2">
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
