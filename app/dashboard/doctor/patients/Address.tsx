import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

export default function Address({
  setValue,
}: {
  setValue: UseFormSetValue<{
    name: string;
    doctor: string;
    gender: "Male" | "Female" | "Other";
    dateOfBirth?: string | undefined;
    mrn?: string | undefined;
    phoneNumber?: string | undefined;
    email?: string | undefined;
    conditions?: string[] | undefined;
    blood?: string | undefined;
    allergies?: string | undefined;
    insurance?: string | undefined;
    insuranceValidity?: string | undefined;
    uhid?: string | undefined;
    emergencyContactNumber?: string | undefined;
    address?: string | undefined;
    guardian?: string | undefined;
    guardianPhoneNumber?: string | undefined;
    guardianRelation?: string | undefined;
    notes?: string | undefined;
  }>;
}) {
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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
      <p className="col-span-full font-semibold">Patient Address</p>
      <div className="grid gap-2">
        <Label>Address Line 1</Label>
        <Input
          placeholder="Address Line 1"
          value={address.line1 ?? ""}
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
          placeholder="Address Line 2"
          value={address.line2 ?? ""}
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
          placeholder="City"
          value={address.city ?? ""}
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
          placeholder="State"
          value={address.state ?? ""}
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
