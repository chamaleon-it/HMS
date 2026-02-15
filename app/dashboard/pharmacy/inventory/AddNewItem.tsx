import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { fDate } from "@/lib/fDateAndTime";
import { pharmacyItemAddSchema } from "@/schemas/pharmacyItemAddSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);

export function AddNewItem({ onClose }: { onClose: () => void }) {
  const {
    register,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
    setValue,
  } = useForm({
    resolver: zodResolver(pharmacyItemAddSchema),
    defaultValues: {
      status: "Active",
      category: "Medicine",
    },
  });

  const values = watch();

  const addItem = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/pharmacy/items", data), {
        loading: "Please wait, Adding item to database...!",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      reset();
      onClose();
    } catch (error) {
      console.log(error);
    }
  });

  useEffect(() => {
    setValue("quantity", values.openingStockQuantity);
  }, [values.openingStockQuantity, setValue]);

  const [openCalendar, setOpenCalendar] = useState(false)

  // Refs for keyboard navigation
  const refs = {
    name: useRef<HTMLInputElement>(null),
    generic: useRef<HTMLInputElement>(null),
    batchNumber: useRef<HTMLInputElement>(null),
    rackLocation: useRef<HTMLInputElement>(null),
    packing: useRef<HTMLInputElement>(null),
    hsnCode: useRef<HTMLInputElement>(null),
    sku: useRef<HTMLInputElement>(null),
    category: useRef<HTMLButtonElement>(null),
    supplier: useRef<HTMLInputElement>(null),
    manufacturer: useRef<HTMLInputElement>(null),
    purchasePrice: useRef<HTMLInputElement>(null),
    unitPrice: useRef<HTMLInputElement>(null),
    gst: useRef<HTMLInputElement>(null),
    openingStockQuantity: useRef<HTMLInputElement>(null),
    expiryDate: useRef<HTMLButtonElement>(null),
    status: useRef<HTMLButtonElement>(null),
    saveButton: useRef<HTMLButtonElement>(null),
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  return (
    <form
      className="w-full bg-white rounded-2xl shadow-xl border p-6 space-y-6"
      onSubmit={addItem}
    >
      <div>
        <div className="text-xl font-semibold text-gray-900">Add New Item</div>
        <div className="text-xs text-gray-500">
          Add a new medicine / consumable / equipment to inventory
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-3">
          <label className="text-[12px] text-gray-600 font-medium">
            Brand Name *
          </label>
          <Input
            placeholder="e.g. T Dolo 650 mg"
            className="mt-1"
            {...register("name")}
            ref={(e) => {
              register("name").ref(e);
              refs.name.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.generic)}
            autoFocus
          />
          {errors.name && (
            <p className="text-xs text-red-600 my-1">{errors.name.message}</p>
          )}
          <p className="text-[11px] text-gray-400">
            This is what doctors see / gets billed
          </p>
        </div>

        <div className="col-span-3">
          <label className="text-[12px] text-gray-600 font-medium">
            Generic / Content
          </label>
          <Input
            placeholder="e.g. Paracetamol / Acetaminophen"
            className="mt-1"
            {...register("generic")}
            ref={(e) => {
              register("generic").ref(e);
              refs.generic.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.batchNumber)}
          />
          {errors.generic && (
            <p className="text-xs text-red-600 my-1">
              {errors.generic.message}
            </p>
          )}
          <p className="text-[11px] text-gray-400">
            Will display as (Gen: ...)
          </p>
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Batch Number
          </label>
          <Input
            placeholder="e.g. Batch 001"
            className="mt-1"
            {...register("batchNumber")}
            ref={(e) => {
              register("batchNumber").ref(e);
              refs.batchNumber.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.rackLocation)}
          />
          {errors.batchNumber && (
            <p className="text-xs text-red-600 my-1">
              {errors.batchNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Rack Location
          </label>
          <Input
            placeholder="e.g. Rack 001"
            className="mt-1"
            {...register("rackLocation")}
            ref={(e) => {
              register("rackLocation").ref(e);
              refs.rackLocation.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.packing)}
          />
          {errors.rackLocation && (
            <p className="text-xs text-red-600 my-1">
              {errors.rackLocation.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Packing
          </label>
          <Input
            placeholder="e.g. 100"
            className="mt-1"
            {...register("packing")}
            ref={(e) => {
              register("packing").ref(e);
              refs.packing.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.hsnCode)}
          />
          {errors.packing && (
            <p className="text-xs text-red-600 my-1">
              {errors.packing.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            HSN Code
          </label>
          <Input
            placeholder="e.g. 30045010"
            className="mt-1"
            {...register("hsnCode")}
            ref={(e) => {
              register("hsnCode").ref(e);
              refs.hsnCode.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.sku)}
          />
          {errors.hsnCode && (
            <p className="text-xs text-red-600 my-1">
              {errors.hsnCode.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            SKU / Internal Code
          </label>
          <Input
            placeholder="e.g. MED001"
            className="mt-1"
            {...register("sku")}
            ref={(e) => {
              register("sku").ref(e);
              refs.sku.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.category)}
          />
          {errors.sku && (
            <p className="text-xs text-red-600 my-1">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category
          </label>
          <Select onValueChange={(value) => setValue("category", value)} defaultValue="Medicine">
            <SelectTrigger className="mt-1 w-full" ref={refs.category} onKeyDown={(e) => handleKeyDown(e, refs.supplier)}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-600 my-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Supplier
          </label>
          <Input
            placeholder="e.g. ABC Pharma"
            className="mt-1"
            {...register("supplier")}
            ref={(e) => {
              register("supplier").ref(e);
              refs.supplier.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.manufacturer)}
          />
          {errors.supplier && (
            <p className="text-xs text-red-600 my-1">
              {errors.supplier.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Manufacturer
          </label>
          <Input
            placeholder="e.g. ABC Pharma"
            className="mt-1"
            {...register("manufacturer")}
            ref={(e) => {
              register("manufacturer").ref(e);
              refs.manufacturer.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.purchasePrice)}
          />
          {errors.manufacturer && (
            <p className="text-xs text-red-600 my-1">
              {errors.manufacturer.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Purchase Price (₹) *
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 2.50"
            className="mt-1"
            {...register("purchasePrice")}
            ref={(e) => {
              register("purchasePrice").ref(e);
              refs.purchasePrice.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.unitPrice)}
          />
          {errors.purchasePrice && (
            <p className="text-xs text-red-600 my-1">
              {errors.purchasePrice.message}
            </p>
          )}
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
            {...register("unitPrice")}
            ref={(e) => {
              register("unitPrice").ref(e);
              refs.unitPrice.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.gst)}
          />
          {errors.unitPrice && (
            <p className="text-xs text-red-600 my-1">
              {errors.unitPrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            GST (%)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 5"
            className="mt-1"
            {...register("gst")}
            ref={(e) => {
              register("gst").ref(e);
              refs.gst.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.openingStockQuantity)}
          />
          {errors.gst && (
            <p className="text-xs text-red-600 my-1">
              {errors.gst.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Opening Stock Qty *
          </label>
          <Input
            type="number"
            placeholder="e.g. 100"
            className="mt-1"
            {...register("openingStockQuantity")}
            ref={(e) => {
              register("openingStockQuantity").ref(e);
              refs.openingStockQuantity.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.expiryDate)}
          />
          {errors.openingStockQuantity && (
            <p className="text-xs text-red-600 my-1">
              {errors.openingStockQuantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Expiry Date *
          </label>

          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal"
                ref={refs.expiryDate}
                onKeyDown={(e) => handleKeyDown(e, refs.status)}
              >
                {values.expiryDate ? (() => {
                  const d = new Date(values.expiryDate);
                  return `${months[d.getMonth()]} / ${d.getFullYear()}`;
                })() : "Select Expiry"}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Select Month & Year</div>

                <div className="grid grid-cols-3 gap-1">
                  {months.map((m: string, idx: number) => (
                    <button
                      key={m}
                      type="button"
                      className={`px-2 py-1.5 text-xs rounded-md transition-colors ${values.expiryDate && new Date(values.expiryDate).getMonth() === idx
                        ? "bg-indigo-600 text-white font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                      onClick={() => {
                        const current = values.expiryDate ? new Date(values.expiryDate) : new Date();
                        const newDate = new Date(current.getFullYear(), idx, 1);
                        setValue("expiryDate", newDate.toISOString());
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <Select
                    value={values.expiryDate ? String(new Date(values.expiryDate).getFullYear()) : String(new Date().getFullYear())}
                    onValueChange={(y) => {
                      const current = values.expiryDate ? new Date(values.expiryDate) : new Date();
                      const newDate = new Date(Number(y), current.getMonth(), 1);
                      setValue("expiryDate", newDate.toISOString());
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y: number) => (
                        <SelectItem key={y} value={String(y)} className="text-xs">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setOpenCalendar(false)}
                >
                  Confirm
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {errors.expiryDate && (
            <p className="text-xs text-red-600 my-1">
              {errors.expiryDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Status
          </label>
          <Select
            defaultValue="Active"
            onValueChange={(value: "Active" | "Inactive") =>
              setValue("status", value)
            }
          >
            <SelectTrigger className="mt-1 w-full" ref={refs.status} onKeyDown={(e) => handleKeyDown(e, refs.saveButton)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-xs text-red-600 my-1">{errors.status.message}</p>
          )}
        </div>
      </div>



      <div className="flex gap-2">
        <Button className="bg-indigo-600 text-white flex-1" type="submit" ref={refs.saveButton}>
          Save Item
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          type="button"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
