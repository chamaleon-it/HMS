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
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export function AddNewItem({ onClose }: { onClose: () => void }) {
  const {
    register,
    formState: { errors },
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

  const addItem = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/pharmacy/items", data), {
        loading: "Please wait, Adding item to inventory...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      reset();
      onClose();
    } catch (error) {
      // Handled by toast.promise
    }
  });

  // Refs for keyboard navigation
  const refs = {
    name: useRef<HTMLInputElement>(null),
    generic: useRef<HTMLInputElement>(null),
    sku: useRef<HTMLInputElement>(null),
    category: useRef<HTMLButtonElement>(null),
    rackLocation: useRef<HTMLInputElement>(null),
    hsnCode: useRef<HTMLInputElement>(null),
    manufacturer: useRef<HTMLInputElement>(null),
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
          Add a new medicine / consumable / equipment to inventory (pricing & stock are managed at the batch level)
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
          <p className="text-[11px] text-gray-400">
            Will display as (Gen: ...)
          </p>
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
          {errors.category && (
            <p className="text-xs text-red-600 my-1">
              {errors.category.message as string}
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
            onKeyDown={(e) => handleKeyDown(e, refs.hsnCode)}
          />
          {errors.rackLocation && (
            <p className="text-xs text-red-600 my-1">
              {errors.rackLocation.message as string}
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
            onKeyDown={(e) => handleKeyDown(e, refs.manufacturer)}
          />
          {errors.hsnCode && (
            <p className="text-xs text-red-600 my-1">
              {errors.hsnCode.message as string}
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
            onKeyDown={(e) => handleKeyDown(e, refs.status)}
          />
          {errors.manufacturer && (
            <p className="text-xs text-red-600 my-1">
              {errors.manufacturer.message as string}
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
            <p className="text-xs text-red-600 my-1">{errors.status.message as string}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="bg-(--color-synapse-light) text-white flex-1 cursor-pointer" type="submit" ref={refs.saveButton}>
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
