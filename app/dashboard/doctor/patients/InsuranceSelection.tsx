import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FieldErrors, UseFormSetValue } from "react-hook-form";
import { TopInsuranceCompany } from "./data";
import { X } from "lucide-react";

interface FormType {
  name: string;
  phoneNumber: string;
  doctor: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  dateOfBirth: string;
  email?: string | undefined;
  conditions?: string[] | undefined;
  blood?: string | undefined;
  allergies?: string | undefined;
  insurance?: string | undefined;
  insuranceValidity?: string | undefined;
  uhid?: string | undefined;
  emergencyContactNumber?: string | undefined;
  address?: string | undefined;
  notes?: string | undefined;
}

export default function InsuranceSelection({
  setValue,
  errors,
  values
}: {
  setValue: UseFormSetValue<FormType>;
  errors: FieldErrors<FormType>;
  values: FormType
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {

    setQuery(values.insurance || "")
  }, [values.insurance])

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Case-insensitive filtering; de-dup if needed
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TopInsuranceCompany;
    return TopInsuranceCompany.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  const commit = (value: string) => {
    setQuery(value);
    setValue("insurance", value, { shouldValidate: true, shouldDirty: true });
    setOpen(false);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="insurance-input">Insurance</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id="insurance-input"
              ref={inputRef}
              placeholder="Select or type insurance"
              value={query}
              // onFocus={() => setOpen(true)}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                setValue("insurance", v, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                if (!open) setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Accept current manual text
                  e.preventDefault();
                  commit(query.trim());
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                onClick={() => {
                  setQuery("");
                  setValue("insurance", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  inputRef.current?.focus();
                  setOpen(true);
                }}
                aria-label="Clear"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-(--radix-popover-trigger-width)"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // keep focus in input
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-56">
              {/* Manual text option always first when there is input */}
              {query.trim() && (
                <CommandGroup>
                  <CommandItem
                    value={`__use-entered__-${query}`}
                    onSelect={() => commit(query.trim())}
                  >
                    Use “{query.trim()}”
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandEmpty>
                No matches{query ? ` for “${query.trim()}”` : ""}.
              </CommandEmpty>

              <CommandGroup heading="Suggestions">
                {options.map((company) => (
                  <CommandItem
                    key={company}
                    value={company}
                    onSelect={() => commit(company)}
                  >
                    {company}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {errors.insurance && (
        <p className="text-red-500 text-xs my-1">{errors.insurance.message}</p>
      )}
    </div>
  );
}
