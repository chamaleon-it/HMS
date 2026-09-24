import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { pharmacyItemAddSchema } from "@/schemas/pharmacyItemAddSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import TypableExpiryInput from "../purchase-entry/components/TypableExpiryInput";

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
      name: "",
      generic: "",
      rackLocation: "",
      hsnCode: "",
      sku: "",
      manufacturer: "",
    },
  });

  const values = watch();

  const addItem = handleSubmit(async (data) => {
    try {
      // Master-only payload: strip item-level pricing / packing fields.
      // Opening batch (batchNumber / qty / expiry) remains optional.
      const payload = {
        name: data.name,
        generic: data.generic,
        rackLocation: data.rackLocation,
        hsnCode: data.hsnCode,
        sku: data.sku,
        category: data.category,
        manufacturer: data.manufacturer,
        status: data.status,
        batchNumber: data.batchNumber,
        openingStockQuantity: data.openingStockQuantity,
        quantity: data.openingStockQuantity ?? data.quantity,
        expiryDate: data.expiryDate,
      };
      await toast.promise(api.post("/pharmacy/items", payload), {
        loading: "Please wait, Adding item to inventory...",
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
    if (values.openingStockQuantity != null) {
      setValue("quantity", values.openingStockQuantity);
    }
  }, [values.openingStockQuantity, setValue]);

  const refs = {
    name: useRef<HTMLInputElement>(null),
    generic: useRef<HTMLInputElement>(null),
    sku: useRef<HTMLInputElement>(null),
    category: useRef<HTMLButtonElement>(null),
    rackLocation: useRef<HTMLInputElement>(null),
    hsnCode: useRef<HTMLInputElement>(null),
    manufacturer: useRef<HTMLInputElement>(null),
    status: useRef<HTMLButtonElement>(null),
    batchNumber: useRef<HTMLInputElement>(null),
    openingStockQuantity: useRef<HTMLInputElement>(null),
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
          Create the master record for a medicine / consumable / equipment.
          Pricing, GST, supplier and packing live on each batch.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="sm:col-span-2">
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
            <p className="text-xs text-red-600 my-1">{errors.name.message as string}</p>
          )}
          <p className="text-[11px] text-gray-400">
            This is what doctors see / gets billed
          </p>
        </div>

        <div className="sm:col-span-2">
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
            onKeyDown={(e) => handleKeyDown(e, refs.sku)}
          />
          {errors.generic && (
            <p className="text-xs text-red-600 my-1">
              {errors.generic.message as string}
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
            <p className="text-xs text-red-600 my-1">{errors.sku.message as string}</p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category
          </label>
          <Select onValueChange={(value) => setValue("category", value)} defaultValue="Medicine">
            <SelectTrigger className="mt-1 w-full" ref={refs.category} onKeyDown={(e) => handleKeyDown(e, refs.rackLocation)}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
              <SelectItem value="Surgicals">Surgicals</SelectItem>
            </SelectContent>
          </Select>
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
            onKeyDown={(e) => handleKeyDown(e, refs.hsnCode)}
          />
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
            onKeyDown={(e) => handleKeyDown(e, refs.manufacturer)}
          />
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
            onKeyDown={(e) => handleKeyDown(e, refs.status)}
          />
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
            <SelectTrigger className="mt-1 w-full" ref={refs.status} onKeyDown={(e) => handleKeyDown(e, refs.batchNumber)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4 space-y-3">
        <div>
          <div className="text-[13px] font-semibold text-gray-800">
            Opening Batch & Stock
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600">
              Optional
            </span>
          </div>
          <p className="text-[11px] text-gray-500">
            Leave blank to register the master record only. Rates, GST, supplier
            and packing are set when you add a batch (Purchase Entry / Update Batch).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
              onKeyDown={(e) => handleKeyDown(e, refs.openingStockQuantity)}
            />
          </div>

          <div>
            <label className="text-[12px] text-gray-600 font-medium">
              Current Stock Qty
            </label>
            <Input
              type="number"
              placeholder="e.g. 100"
              className="mt-1"
              value={(values.openingStockQuantity as number | string) ?? ""}
              {...register("openingStockQuantity")}
              onChange={(e) => {
                const qty = Number(e.target.value) || 0;
                setValue("openingStockQuantity", qty);
                setValue("quantity", qty);
              }}
              ref={(e) => {
                register("openingStockQuantity").ref(e);
                refs.openingStockQuantity.current = e;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const el = document.querySelector('input[data-field="expiryDate"]') as HTMLInputElement;
                  if (el) el.focus();
                }
              }}
            />
          </div>

          <div>
            <label className="text-[12px] text-gray-600 font-medium">
              Expiry Date
            </label>
            <TypableExpiryInput
              value={values.expiryDate || ""}
              onChange={(date: string) => setValue("expiryDate", date, { shouldValidate: true })}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, refs.saveButton)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="bg-indigo-600 text-white flex-1 cursor-pointer" type="submit" ref={refs.saveButton}>
          Save Item
        </Button>
        <Button
          variant="outline"
          className="flex-1 cursor-pointer"
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
