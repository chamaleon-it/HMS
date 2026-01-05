import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FilterType } from "./interface";

interface Props {
  setFilter: Dispatch<SetStateAction<FilterType>>;
  filter: FilterType;
}

export default function ItemFilter({ filter, setFilter }: Props) {
  const [search, setSearch] = useState(filter.q || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilter((prev) => ({ ...prev, q: search, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [search, setFilter]);

  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by Item Name, SKU, or Barcode"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({ ...prev, category: v === "all" ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Medicine">Medicine</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({ ...prev, stock: v === "all" ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Instock">In Stock</SelectItem>
            <SelectItem value="Low">Low Stock</SelectItem>
            <SelectItem value="Out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({
              ...prev,
              expiry: v === "all" ? undefined : Number(v),
              page: 1,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Expiry Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="30">Expiring in 30 days</SelectItem>
            <SelectItem value="60">Expiring in 60 days</SelectItem>
            <SelectItem value="90">Expiring in 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
