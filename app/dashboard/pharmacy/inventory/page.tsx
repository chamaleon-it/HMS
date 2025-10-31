"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ItemTable from "./ItemTable";
import ItemFilter from "./ItemFilter";
import { ViewItem } from "./ViewItem";
import { EditItem } from "./EditItem";
import { AddNewItem } from "./AddNewItem";
import Header from "./Header";
import { FilterType, ItemType } from "./interface";
import useItems from "./useItems";

export default function InventoryPage() {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [filter, setFilter] = useState<FilterType>({
    page: 1,
    limit: 10,
    q: undefined,
    category: undefined,
    stock: undefined,
    expiry: undefined,
  });

  const { items, total, isLoading, isValidating, mutate } = useItems({
    filter,
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

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
      <div className="p-5 min-h-[calc(100vh-80px)]">
        <div
          className={`space-y-6 ${
            openView || openEdit || openAdd ? "blur-sm pointer-events-none" : ""
          }`}
        >
          <Header handleAdd={handleAdd} items={items} />

          <ItemFilter filter={filter} setFilter={setFilter} />

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
          />

          {/* Footer */}
          <div className="flex justify-between text-sm text-gray-600">
            <p>Total Items: {items.length}</p>
            <p>Total Value: ₹{0}</p>
          </div>
        </div>

        {(openView || openEdit || openAdd) && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={closeAll}
                className="absolute -top-3 -right-3 bg-white shadow-lg rounded-full h-8 w-8 flex items-center justify-center text-gray-700 text-sm border hover:bg-gray-50"
              >
                ✕
              </button>

              {openView && selectedItem && <ViewItem item={selectedItem} />}

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
          </div>
        )}
      </div>
    </AppShell>
  );
}
