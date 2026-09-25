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
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacyItemAddSchema } from "@/schemas/pharmacyItemAddSchema";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuth } from "@/auth/context/auth-context";

export function EditItem({
  item,
  onClose,
}: {
  item: ItemType;
  onClose: () => void;
}) {
  const { user } = useAuth();

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(pharmacyItemAddSchema),
    defaultValues: {
      category: item.category || "Medicine",
      generic: item.generic || "",
      hsnCode: item.hsnCode ? String(item.hsnCode) : "",
      manufacturer: item.manufacturer || "",
      name: item.name || "",
      status: (item.status as "Active" | "Inactive") || "Active",
      rackLocation: item.rackLocation || "",
    },
  });

  useEffect(() => {
    reset({
      category: item.category || "Medicine",
      generic: item.generic || "",
      hsnCode: item.hsnCode ? String(item.hsnCode) : "",
      manufacturer: item.manufacturer || "",
      name: item.name || "",
      status: (item.status as "Active" | "Inactive") || "Active",
      rackLocation: item.rackLocation || "",
    });
  }, [item, reset]);

  const editItem = handleSubmit(async (data) => {
    try {
      // Master-only: do not send strip/MRP/P.Rate/GST/supplier/packing/SKU.
      const payload = {
        name: data.name,
        generic: data.generic,
        rackLocation: data.rackLocation,
        hsnCode: data.hsnCode,
        category: data.category,
        manufacturer: data.manufacturer,
        status: data.status,
      };
      await toast.promise(api.patch(`/pharmacy/items/${item._id}`, payload), {
        loading: "Please wait, Saving item changes...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      reset();
      onClose();
    } catch (error) {
      console.log(error);
    }
  });

  const refs = {
    name: useRef<HTMLInputElement>(null),
    generic: useRef<HTMLInputElement>(null),
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
      onSubmit={editItem}
    >
      <div>
        <div className="text-xl font-semibold text-gray-900">Edit Item</div>
        <div className="text-xs text-gray-500">
          Last updated:{" "}
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}{" "}
          by {user?.name || "Staff"}. Pricing & stock are managed at batch level
          (Update Batch / Purchase Entry).
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="sm:col-span-2">
          <label className="text-[12px] text-gray-600 font-medium">
            Brand Name *
          </label>
          <Input
            placeholder="e.g. SunPharma Bilastine 20 mg"
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
            onKeyDown={(e) => handleKeyDown(e, refs.category)}
          />
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category
          </label>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value)}
          >
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
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="bg-indigo-600 text-white flex-1 cursor-pointer" type="submit" ref={refs.saveButton}>
          Save Changes
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
