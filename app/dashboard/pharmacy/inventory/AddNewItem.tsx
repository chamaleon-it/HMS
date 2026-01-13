import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useEffect, useState } from "react";
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

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-3">
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

        <div className="col-span-3">
          <label className="text-[12px] text-gray-600 font-medium">
            Generic / Content
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
            Batch Number
          </label>
          <Input
            placeholder="e.g. Batch 001"
            className="mt-1"
            {...register("batchNumber")}
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
            Category
          </label>
          <Select onValueChange={(value) => setValue("category", value)} defaultValue="Medicine">
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
            Supplier
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
            Manufacturer
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
            GST (%)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 5"
            className="mt-1"
            {...register("gst")}
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
              >
                {values.expiryDate ? fDate(new Date(values.expiryDate)) : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                startMonth={new Date(2025, 0)}
                endMonth={new Date(2030, 0)}
                disabled={{ before: new Date() }}
                mode="single"
                selected={values.expiryDate ? new Date(values.expiryDate) : undefined}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) {
                    setValue("expiryDate", date.toISOString())
                    setOpenCalendar(false)
                  }
                }}
              />
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



      <div className="flex gap-2">
        <Button className="bg-indigo-600 text-white flex-1" type="submit">
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
