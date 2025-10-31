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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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

  return (
    <form
      className="max-w-xl bg-white rounded-2xl shadow-xl border p-6 space-y-6"
      onSubmit={addItem}
    >
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
          <Input
            placeholder="e.g. T Dolo 650 mg"
            className="mt-1"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-600 my-1">{errors.name.message}</p>
          )}
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
            {...register("generic")}
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
            HSN Code *
          </label>
          <Input
            placeholder="e.g. 30045010"
            className="mt-1"
            {...register("hsnCode")}
          />
          {errors.hsnCode && (
            <p className="text-xs text-red-600 my-1">
              {errors.hsnCode.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            SKU / Internal Code *
          </label>
          <Input
            placeholder="e.g. MED001"
            className="mt-1"
            {...register("sku")}
          />
          {errors.sku && (
            <p className="text-xs text-red-600 my-1">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Category *
          </label>
          <Select onValueChange={(value) => setValue("category", value)}>
            <SelectTrigger className="mt-1 w-full">
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
            Supplier *
          </label>
          <Input
            placeholder="e.g. ABC Pharma"
            className="mt-1"
            {...register("supplier")}
          />
          {errors.supplier && (
            <p className="text-xs text-red-600 my-1">
              {errors.supplier.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Manufacturer *
          </label>
          <Input
            placeholder="e.g. ABC Pharma"
            className="mt-1"
            {...register("manufacturer")}
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
          />
          {errors.unitPrice && (
            <p className="text-xs text-red-600 my-1">
              {errors.unitPrice.message}
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
          />
          {errors.openingStockQuantity && (
            <p className="text-xs text-red-600 my-1">
              {errors.openingStockQuantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-[12px] text-gray-600 font-medium">
            Expiry Date
          </label>
          <Input type="date" className="mt-1" {...register("expiryDate")} />
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
            <SelectTrigger className="mt-1 w-full">
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

      <div className="rounded-lg border bg-gray-50 p-3 text-[12px] leading-relaxed text-gray-600">
        <div className="font-medium text-gray-800 text-[12px] mb-1">
          Initial Stock Batch
        </div>
        Add where you got this first stock, batch number, notes etc so audit is
        clean.
      </div>

      <div className="flex gap-2">
        <Button className="bg-purple-600 text-white flex-1" type="submit">
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
