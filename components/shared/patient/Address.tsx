import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";

export default function Address({
  setValue,
  watch,
  errors,
}: {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}) {
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const addressLine1 = watch("addressLine1");
  const addressLine2 = watch("addressLine2");
  const city = watch("city");
  const district = watch("district");
  const state = watch("state");
  const pinCode = watch("pinCode");
  const country = watch("country");

  return (
    <section className="space-y-3 pt-1">
      <h3 className="font-semibold text-[15px] text-slate-800">Patient Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
        
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">Address Line 1</Label>
          <Input
            placeholder="Address Line 1"
            value={addressLine1 ?? ""}
            onChange={(e) =>
              setValue("addressLine1", capitalizeWords(e.target.value))
            }
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">Address Line 2</Label>
          <Input
            placeholder="Address Line 2"
            value={addressLine2 ?? ""}
            onChange={(e) =>
              setValue("addressLine2", capitalizeWords(e.target.value))
            }
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">City</Label>
          <Input
            placeholder="City"
            value={city ?? ""}
            onChange={(e) =>
              setValue("city", capitalizeWords(e.target.value))
            }
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">District</Label>
          <Input
            placeholder="District"
            value={district ?? ""}
            onChange={(e) =>
              setValue("district", capitalizeWords(e.target.value))
            }
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">State</Label>
          <Input
            placeholder="State"
            value={state ?? ""}
            onChange={(e) => setValue("state", capitalizeWords(e.target.value))}
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">PIN Code</Label>
          <Input
            placeholder="PIN Code"
            value={pinCode ?? ""}
            onChange={(e) => setValue("pinCode", e.target.value)}
            type="number"
            className="h-9 rounded-xl"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm font-medium text-slate-700">Country</Label>
          <Input
            placeholder="Country"
            value={country ?? ""}
            onChange={(e) => setValue("country", capitalizeWords(e.target.value))}
            className="h-9 rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
