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
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacyItemAddSchema } from "@/schemas/pharmacyItemAddSchema";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";
import TypableExpiryInput from "../suppliers/purchase-entry/components/TypableExpiryInput";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);

export function EditItem({
  item,
  onClose,
}: {
  item: ItemType;
  onClose: () => void;
}) {
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
      category: item.category,
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString()
        : undefined,
      generic: item.generic,
      hsnCode: String(item.hsnCode),
      manufacturer: item.manufacturer,
      name: item.name,
      openingStockQuantity: item.openingStockQuantity,
      purchasePrice: item.purchasePrice,
      quantity: item.quantity,
      sku: item.sku,
      status: item.status as "Active" | "Inactive" | undefined,
      supplier: item.supplier,
      unitPrice: item.unitPrice,
      rackLocation: item.rackLocation,
      packing: item.packing,
      gst: item.gst,
    }
  });

  useEffect(() => {
    reset({
      category: item.category,
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString()
        : undefined,
      generic: item.generic,
      hsnCode: String(item.hsnCode),
      manufacturer: item.manufacturer,
      name: item.name,
      openingStockQuantity: item.openingStockQuantity,
      purchasePrice: item.purchasePrice,
      quantity: item.quantity,
      sku: item.sku,
      status: item.status as "Active" | "Inactive" | undefined,
      supplier: item.supplier,
      unitPrice: item.unitPrice,
      rackLocation: item.rackLocation,
      packing: item.packing,
      gst: item.gst,
    });
  }, [item, reset]);

  const values = watch();
  const { data: suppliersData } = useSWR<{ message: string; data: { _id: string; name: string }[] }>("/suppliers/get_id_and_name");
  const suppliers = suppliersData?.data || [];



  const editItem = handleSubmit(async (data) => {
    try {
      await toast.promise(api.patch(`/pharmacy/items/${item._id}`, data), {
        loading: "Please wait, Editing item...!",
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

  const { user } = useAuth()

  const [openCalendar, setOpenCalendar] = useState(false)

  // Refs for keyboard navigation
  const refs = {
    name: useRef<HTMLInputElement>(null),
    generic: useRef<HTMLInputElement>(null),
    rackLocation: useRef<HTMLInputElement>(null),
    packing: useRef<HTMLInputElement>(null),
    hsnCode: useRef<HTMLInputElement>(null),
    sku: useRef<HTMLInputElement>(null),
    category: useRef<HTMLButtonElement>(null),
    supplier: useRef<HTMLButtonElement>(null),
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
      onSubmit={editItem}
      className="w-full bg-white rounded-2xl shadow-xl border p-6 space-y-6"
    >
      <div>
        <div className="text-xl font-semibold text-gray-900">Edit Item</div>
        <div className="text-xs text-gray-500">
          Last updated: {fDate(item.updatedAt)} by {user?.name}
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
            onKeyDown={(e) => handleKeyDown(e, refs.rackLocation)}
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
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value)}
          >
            <SelectTrigger className="mt-1 w-full" ref={refs.category} onKeyDown={(e) => handleKeyDown(e, refs.supplier)}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
              <SelectItem value="Surgicals">Surgicals</SelectItem>
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
          <Select value={watch("supplier")} onValueChange={(value) => setValue("supplier", value)}>
            <SelectTrigger
              className="mt-1 w-full"
              ref={refs.supplier}
              onKeyDown={(e) => handleKeyDown(e, refs.manufacturer)}
            >
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200">
              {suppliers.map((s: { _id: string; name: string }) => (
                <SelectItem key={s._id} value={s.name} className="rounded-md focus:bg-indigo-50">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            Current Stock Qty *
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const el = document.querySelector('input[data-field="expiryDate"]') as HTMLInputElement;
                if (el) el.focus();
              }
            }}
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

          <TypableExpiryInput
            value={values.expiryDate || ""}
            onChange={(date: string) => setValue("expiryDate", date, { shouldValidate: true })}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, refs.status)}
          />

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
            value={watch("status")}
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
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          type="button"
          onClick={() => onClose()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
