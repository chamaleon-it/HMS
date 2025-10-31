import { Button } from "@/components/ui/button";
import React from "react";
import { ItemType } from "./interface";

interface Props {
  handleAdd: () => void;
  items?: ItemType[];
}

export default function Header({ handleAdd, items }: Props) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-purple-700">
        Inventory Management
      </h1>
      <div className="flex gap-2">
        <Button className="bg-purple-600 text-white" onClick={handleAdd}>
          + Add New Item
        </Button>
        <Button variant="outline">Export CSV</Button>
        <LowStockButton items={items} />
      </div>
    </div>
  );
}

function LowStockButton({ items }: { items?: ItemType[] }) {
  const lowCount = items?.filter(
    (it) => it.quantity === 0 || it.quantity < 20
  ).length;
  return (
    <Button variant="destructive" className="relative">
      Low Stock Alert
      <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none font-semibold bg-white text-red-600 rounded-full h-5 min-w-[20px] px-1 border border-red-300">
        {lowCount}
      </span>
    </Button>
  );
}
