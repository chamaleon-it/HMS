import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ItemType } from "./interface";
import { fDate } from "@/lib/fDateAndTime";

export function EditItem({ item }: { item: ItemType }) {
  return (
    <div className="max-w-xl bg-white rounded-2xl shadow-xl border p-6 space-y-6">
      <div>
        <div className="text-xl font-semibold text-gray-900">Edit Item</div>
        <div className="text-xs text-gray-500">
          Last updated: 28 Oct 2025 by Admin
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="col-span-2">
          <label className="text-[12px] text-gray-600 font-medium">
            Brand Name
          </label>
          <Input defaultValue={item.name} className="mt-1" />
          <p className="text-[11px] text-gray-400">Shown to doctor / bill</p>
        </div>

        <div className="col-span-2">
          <label className="text-[12px] text-gray-600 font-medium">
            Generic (for reference)
          </label>
          <Input defaultValue={item.generic} className="mt-1" />
          <p className="text-[11px] text-gray-400">
            (Gen: …) will show under brand
          </p>
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            HSN Code
          </label>
          <Input defaultValue={item.hsnCode} className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            SKU / Internal Code
          </label>
          <Input defaultValue={item.sku} className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category
          </label>
          <Select defaultValue={item.category.toLowerCase()}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="consumables">Consumables</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Supplier
          </label>
          <Input defaultValue={item.supplier} className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Unit Price (₹)
          </label>
          <Input
            type="number"
            step="0.01"
            defaultValue={item.unitPrice}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Available Qty
          </label>
          <Input type="number" defaultValue={item.quantity} className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Expiry Date
          </label>
          <Input
            type="date"
            defaultValue={fDate(item.expiryDate)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Status
          </label>
          <Select
            defaultValue={
              item.status.toLowerCase() === "active" ? "active" : "inactive"
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-gray-50 p-3 text-[12px] leading-relaxed text-gray-600">
        <div className="font-medium text-gray-800 text-[12px] mb-1">
          Stock Note
        </div>
        Batch #A551 • Received 28 Oct 2025 • +40 units from {item.supplier} at ₹
        2.30 each
      </div>

      <div className="flex gap-2">
        <Button className="bg-purple-600 text-white flex-1">
          Save Changes
        </Button>
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
