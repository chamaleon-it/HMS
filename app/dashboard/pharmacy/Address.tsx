import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

export default function Address({
  setValue,
  refs,
}: {
  setValue: UseFormSetValue<{
    name: string;
    phoneNumber: string;
    email?: string;
    doctor: string;
    gender: "Male" | "Female" | "Other" | "Prefer not to say";
    dateOfBirth: string;
    conditions?: string[] | undefined;
    blood?: string | undefined;
    allergies?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
  }>;
  refs: {
    line1: React.RefObject<HTMLInputElement | null>;
    line2: React.RefObject<HTMLInputElement | null>;
    city: React.RefObject<HTMLInputElement | null>;
    state: React.RefObject<HTMLInputElement | null>;
    pin: React.RefObject<HTMLInputElement | null>;
  };
}) {
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement | null>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const [address, setAddress] = useState<{
    line1: null | string;
    line2: null | string;
    city: null | string;
    state: null | string;
    pin: null | string;
    country: string;
  }>({
    line1: null,
    line2: null,
    city: null,
    state: "Kerala",
    pin: null,
    country: "India",
  });

  useEffect(() => {
    const newAddress = Object.values(address).filter(Boolean).join(", ");
    setValue("address", newAddress);
  }, [address, setValue]);

  return (
    <>
      <p className="col-span-full font-semibold text-left">Patient Address</p>
      <div className="grid gap-2">
        <Label>Address Line 1</Label>
        <Input
          ref={refs.line1}
          placeholder="Address Line 1"
          value={address.line1 ?? ""}
          onKeyDown={(e) => handleKeyDown(e, refs.line2)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              line1: capitalizeWords(e.target.value),
            }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>Address Line 2</Label>
        <Input
          ref={refs.line2}
          placeholder="Address Line 2"
          value={address.line2 ?? ""}
          onKeyDown={(e) => handleKeyDown(e, refs.city)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              line2: capitalizeWords(e.target.value),
            }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>City</Label>
        <Input
          ref={refs.city}
          placeholder="City"
          value={address.city ?? ""}
          onKeyDown={(e) => handleKeyDown(e, refs.state)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              city: capitalizeWords(e.target.value),
            }))
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>State</Label>
        <Input
          ref={refs.state}
          placeholder="State"
          value={address.state ?? ""}
          onKeyDown={(e) => handleKeyDown(e, refs.pin)}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              state: capitalizeWords(e.target.value),
            }))
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>PIN Code</Label>
        <Input
          ref={refs.pin}
          placeholder="PIN Code"
          value={address.pin ?? ""}
          onChange={(e) =>
            setAddress((prev) => ({ ...prev, pin: e.target.value }))
          }
          type="number"
        />
      </div>

      <div className="grid gap-2">
        <Label>Country</Label>
        <Input
          placeholder="Country"
          value={address.country ?? ""}
          onChange={(e) =>
            setAddress((prev) => ({
              ...prev,
              country: capitalizeWords(e.target.value),
            }))
          }
          disabled
        />
      </div>
    </>
  );
}
