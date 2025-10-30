"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppShell from "@/components/layout/app-shell";

interface ItemType {
  id: number;
  brand: string;
  generic: string;
  hsn: string;
  sku: string;
  category: string;
  qty: number;
  price: number;
  expiry: string;
  supplier: string;
  status: string;
}

// ============================================
// MAIN INVENTORY PAGE WITH MODALS
// ============================================
export default function InventoryPage() {
  // UI state for modals/drawers
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  // test data set
  const [items] = useState([
    {
      id: 1,
      brand: "T Dolo 650 mg",
      generic: "Paracetamol / Acetaminophen",
      hsn: "30045010",
      sku: "MED001",
      category: "Medicine",
      qty: 120,
      price: 2.5,
      expiry: "2026-05-12",
      supplier: "ABC Pharma",
      status: "Active",
    },
    {
      id: 2,
      brand: "T Xtan 40 mg",
      generic: "Telmisartan",
      hsn: "30049099",
      sku: "MED002",
      category: "Medicine",
      qty: 15,
      price: 7.0,
      expiry: "2025-10-01",
      supplier: "MedEquip Ltd",
      status: "Active",
    },
    {
      id: 3,
      brand: "Disposable Syringe 5ml",
      generic: "Sterile Single-use Syringe",
      hsn: "90183100",
      sku: "EQ003",
      category: "Equipment",
      qty: 0,
      price: 4.2,
      expiry: "2024-12-01",
      supplier: "Wellness Pharma",
      status: "Inactive",
    },
  ]);

  // helper: qty color class
  const getQtyColor = (qty: number) => {
    if (qty === 0) return "bg-red-100 text-red-600 font-bold";
    if (qty < 20) return "bg-orange-100 text-orange-600 font-bold";
    return "";
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
      <div className="p-5 min-h-[calc(100vh-80px)]">
        {/* MAIN PAGE CONTENT */}
        <div
          className={`space-y-6 ${
            openView || openEdit || openAdd ? "blur-sm pointer-events-none" : ""
          }`}
        >
          {/* Header */}
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

          {/* Filters */}
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Search by Item Name, SKU, or Barcode" />

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select>
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

          {/* Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-700 hover:bg-slate-700 text-white">
                    <TableHead className="text-white">Sl. No</TableHead>
                    <TableHead className="text-white">Item Name</TableHead>
                    <TableHead className="text-white">Generic / HSN</TableHead>
                    <TableHead className="text-white">SKU / Barcode</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Unit Price (₹)</TableHead>
                    <TableHead className="text-white">
                      Total Value (₹)
                    </TableHead>
                    <TableHead className="text-white">Expiry Date</TableHead>
                    <TableHead className="text-white">Supplier</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow
                      key={item.id}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <TableCell>{i + 1}</TableCell>

                      <TableCell className="font-medium text-gray-900">
                        {item.brand}
                        <div className="text-xs text-gray-500">
                          (Gen: {item.generic})
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-gray-600">
                        <div className="text-gray-800 text-sm font-medium">
                          HSN: {item.hsn}
                        </div>
                      </TableCell>

                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>

                      <TableCell className={getQtyColor(item.qty)}>
                        {item.qty}
                      </TableCell>

                      <TableCell>₹ {item.price}</TableCell>
                      <TableCell>₹ {item.qty * item.price}</TableCell>

                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
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
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-between text-sm text-gray-600">
            <p>Total Items: {items.length}</p>
            <p>
              Total Value: ₹
              {items.reduce((acc, item) => acc + item.qty * item.price, 0)}
            </p>
          </div>
        </div>

        {/* OVERLAY / MODAL */}
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

              {openView && selectedItem && (
                <ViewItemDrawerContent item={selectedItem} />
              )}

              {openEdit && selectedItem && (
                <EditItemFormContent item={selectedItem} />
              )}

              {openAdd && <AddNewItemFormContent />}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ============================================
// SMALL BADGED LOW STOCK BUTTON (extra test)
// ============================================
function LowStockButton({ items }: { items: ItemType[] }) {
  const lowCount = items.filter((it) => it.qty === 0 || it.qty < 20).length;
  return (
    <Button variant="destructive" className="relative">
      Low Stock Alert
      <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none font-semibold bg-white text-red-600 rounded-full h-5 min-w-[20px] px-1 border border-red-300">
        {lowCount}
      </span>
    </Button>
  );
}

// ============================================
// VIEW ITEM CONTENT (used in modal)
// ============================================
function ViewItemDrawerContent({ item }: { item: ItemType }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-gray-900">
            {item.brand}
          </div>
          <div className="text-xs text-gray-500">(Gen: {item.generic})</div>
          <div className="text-[11px] text-gray-400">HSN: {item.hsn}</div>
        </div>
        <Button variant="ghost" className="text-xs text-purple-600">
          Print Label
        </Button>
      </div>

      {/* Stock / Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 bg-gray-50">
          <div className="text-[11px] text-gray-500">Current Stock</div>
          <div className="text-lg font-bold text-gray-900">
            {item.qty} units
          </div>
        </div>
        <div className="rounded-lg border p-3 bg-gray-50">
          <div className="text-[11px] text-gray-500">Status</div>
          <div
            className={`inline-flex items-center gap-1 text-[13px] font-medium ${
              item.status === "Active" ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.status === "Active" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {item.status}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-600">
          <div className="font-medium text-gray-800">SKU</div>
          <div>{item.sku}</div>

          <div className="font-medium text-gray-800">Category</div>
          <div>{item.category}</div>

          <div className="font-medium text-gray-800">Supplier</div>
          <div>{item.supplier}</div>

          <div className="font-medium text-gray-800">Expiry</div>
          <div>{item.expiry}</div>

          <div className="font-medium text-gray-800">Unit Price</div>
          <div>₹ {item.price}</div>
        </div>
      </div>

      {/* Barcode mock */}
      <div className="rounded-lg border p-3 flex flex-col items-center gap-2">
        <div className="text-[11px] text-gray-500">Barcode / Label</div>
        <div className="w-40 h-10 bg-[repeating-linear-gradient(90deg,black_0px,black_2px,white_2px,white_4px)] rounded" />
        <div className="text-[11px] tracking-wider text-gray-700">
          {item.sku}
        </div>
      </div>

      {/* Movement History */}
      <div className="rounded-lg border p-3">
        <div className="text-xs font-semibold text-gray-800 mb-2">
          Stock Movements
        </div>
        <div className="space-y-2 text-[12px] text-gray-600">
          {/* test cases / examples */}
          <div className="flex justify-between">
            <span className="text-green-600 font-medium">+40 received</span>
            <span className="text-gray-400">28 Oct 2025 • by Admin</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">-3 dispensed</span>
            <span className="text-gray-400">27 Oct 2025 • Rx #5521</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">
              -2 wastage (expired)
            </span>
            <span className="text-gray-400">10 Oct 2025</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button className="bg-purple-600 text-white flex-1">Edit Item</Button>
        <Button variant="destructive" className="flex-1">
          Delete
        </Button>
      </div>
    </div>
  );
}

// ============================================
// EDIT ITEM FORM CONTENT (used in modal)
// ============================================
function EditItemFormContent({ item }: { item: ItemType }) {
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
          <Input defaultValue={item.brand} className="mt-1" />
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
          <Input defaultValue={item.hsn} className="mt-1" />
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
            defaultValue={item.price}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Available Qty
          </label>
          <Input type="number" defaultValue={item.qty} className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Expiry Date
          </label>
          <Input type="date" defaultValue={item.expiry} className="mt-1" />
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

// ============================================
// ADD NEW ITEM CONTENT (used in modal)
// ============================================
function AddNewItemFormContent() {
  return (
    <div className="max-w-xl bg-white rounded-2xl shadow-xl border p-6 space-y-6">
      <div>
        <div className="text-xl font-semibold text-gray-900">Add New Item</div>
        <div className="text-xs text-gray-500">
          Add a new medicine / consumable / equipment to inventory
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="col-span-2">
          <label className="text-[12px] text-gray-600 font-medium">
            Brand Name *
          </label>
          <Input placeholder="e.g. T Dolo 650 mg" className="mt-1" />
          <p className="text-[11px] text-gray-400">
            This is what doctors see / gets billed
          </p>
        </div>

        <div className="col-span-2">
          <label className="text-[12px] text-gray-600 font-medium">
            Generic *
          </label>
          <Input
            placeholder="e.g. Paracetamol / Acetaminophen"
            className="mt-1"
          />
          <p className="text-[11px] text-gray-400">
            Will display as (Gen: ...)
          </p>
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            HSN Code *
          </label>
          <Input placeholder="e.g. 30045010" className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            SKU / Internal Code *
          </label>
          <Input placeholder="e.g. MED001" className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category *
          </label>
          <Select>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
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
            Supplier *
          </label>
          <Input placeholder="e.g. ABC Pharma" className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Unit Price (₹) *
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 2.50"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Opening Stock Qty *
          </label>
          <Input type="number" placeholder="e.g. 100" className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Expiry Date
          </label>
          <Input type="date" className="mt-1" />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Status
          </label>
          <Select defaultValue="active">
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
          Initial Stock Batch
        </div>
        Add where you got this first stock, batch number, notes etc so audit is
        clean.
      </div>

      <div className="flex gap-2">
        <Button className="bg-purple-600 text-white flex-1">Save Item</Button>
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
