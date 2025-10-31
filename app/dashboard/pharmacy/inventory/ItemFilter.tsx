import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { Dispatch, SetStateAction } from "react";
import { FilterType } from "./interface";

interface Props {
  setFilter: Dispatch<SetStateAction<FilterType>>;
  filter: FilterType;
}

export default function ItemFilter({ filter, setFilter }: Props) {
  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by Item Name, SKU, or Barcode"
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, q: e.target.value, page: 1 }))
          }
          value={filter.q}
        />

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({ ...prev, category: v, page: 1 }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Medicine">Medicine</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Consumables">Consumables</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({ ...prev, stock: v, page: 1 }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Instock">In Stock</SelectItem>
            <SelectItem value="Low">Low Stock</SelectItem>
            <SelectItem value="Out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilter((prev) => ({
              ...prev,
              expiry: v ? Number(v) : undefined,
              page: 1,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Expiry Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Expiring in 30 days</SelectItem>
            <SelectItem value="60">Expiring in 60 days</SelectItem>
            <SelectItem value="90">Expiring in 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
