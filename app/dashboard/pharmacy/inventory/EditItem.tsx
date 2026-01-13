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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacyItemAddSchema } from "@/schemas/pharmacyItemAddSchema";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuth } from "@/auth/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

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
            SKU / Internal Code
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
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue={item.category}
          >
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
            defaultValue={item.status}
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
