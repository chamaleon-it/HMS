import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "@/lib/axios";
import { fAge } from "@/lib/fDateAndTime";
import registerPatientSchema from "@/schemas/registerPatientSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChevronDownIcon, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/auth/context/auth-context";
import Address from "./Address";
import { useDebounce } from "@/hooks/useDebounce";
import usePatientAlreadyExist from "@/data/usePatientAlreadyExist";
import ExistingPatientCard from "../ExistingPatientCard";

export function RegisterPatient({ onClose, patient, mutate }: { onClose: (id?: string, name?: string) => void, patient?: any, mutate?: () => void }) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      name: patient?.name || "",
      phoneNumber: patient?.phoneNumber || "+91",
      doctor: patient?.doctor || user?._id,
      gender: patient?.gender || "Prefer not to say",
      dateOfBirth: patient?.dateOfBirth || new Date().toISOString(),
      address: patient?.address || "",
      mrn: patient?.mrn || undefined
    },
  });

  const values = watch();
  const { dateOfBirth } = values;

  useEffect(() => {
    if (patient) {
      reset({
        name: patient?.name || "",
        phoneNumber: patient?.phoneNumber || "+91",
        doctor: patient?.doctor || user?._id,
        gender: patient?.gender || "Prefer not to say",
        dateOfBirth: patient?.dateOfBirth || new Date().toISOString(),
        address: patient?.address || "",
        mrn: patient?.mrn || undefined
      });
    }
  }, [patient]);

  const createEditPatient = handleSubmit(async (data) => {
    try {
      if (patient?._id) {
        await toast.promise(api.patch(`/patients/${patient._id}`, data), {
          loading: "Updating customer...!",
          error: ({ response }) => response.data.message,
          success: `Customer updated successfully.`,
        });
        if (mutate) mutate();
        onClose();
      } else {
        const { data: responseData } = await toast.promise(api.post("/patients", data), {
          loading: "Customer is registering...!",
          error: ({ response }) => response.data.message,
          success: `Customer register successfully.`,
        });
        reset();
        onClose(responseData.data._id, responseData.data.name);
      }
    } catch (error) {
      console.log(error);
    }
  });

  const [openCalander, setOpenCalander] = useState(false);

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  useEffect(() => {
    if (name) setValue("name", name);
  }, [name, setValue]);

  const debouncedName = useDebounce(values.name, 500);
  const debouncedPhone = useDebounce(values.phoneNumber, 500);

  const isExistByName = usePatientAlreadyExist({
    name: debouncedName?.length > 2 ? debouncedName : undefined,
  });

  const isExistByPhone = usePatientAlreadyExist({
    phoneNumber: debouncedPhone?.length > 4 ? debouncedPhone : undefined,
  });

  const alreadyExistPatient = isExistByName?.data?.patient || isExistByPhone?.data?.patient;

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [alreadyExistPatient]);

  return (
    <form className="space-y-5" onSubmit={createEditPatient}>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Customer</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2 relative">
            <Label>Name *</Label>
            <Input placeholder="Enter patient name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs my-1">{errors.name.message}</p>
            )}

            {/* Existing Patient Card for Name */}
            {isExistByName?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%-10px)] left-0 w-[calc(200%+16px)] z-50">
                <ExistingPatientCard
                  patient={alreadyExistPatient}
                  onSelect={onClose}
                  onDismiss={() => setDismissed(true)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Customer ID</Label>
            <Input
              placeholder="PID"
              {...register("mrn")}
              value={values.mrn}
              disabled={patient?._id}
            />
            {errors.mrn && (
              <p className="text-red-500 text-xs my-1">
                {errors.mrn.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 relative">
            <Label>Phone </Label>
            <Input
              placeholder="+91"
              {...register("phoneNumber")}
              value={values.phoneNumber}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs my-1">
                {errors.phoneNumber.message}
              </p>
            )}

            {/* Existing Patient Card for Phone */}
            {isExistByPhone?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%-10px)] left-0 w-[calc(200%+16px)] z-50">
                <ExistingPatientCard
                  patient={alreadyExistPatient}
                  onSelect={onClose}
                  onDismiss={() => setDismissed(true)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Gender </Label>
            <Select
              onValueChange={(
                value: "Male" | "Female" | "Other" | "Prefer not to say"
              ) => setValue("gender", value)}
              value={values.gender}
            >
              <SelectTrigger className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other", "Prefer not to say"].map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs my-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Date of Birth </Label>

            <Popover open={openCalander} onOpenChange={setOpenCalander}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {dateOfBirth
                    ? `${new Date(dateOfBirth).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })} - Age : ${fAge(new Date(dateOfBirth))}`
                    : "Select date of birth"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  disabled={{ after: new Date() }}
                  mode="single"
                  selected={new Date(dateOfBirth)}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setValue(
                      "dateOfBirth",
                      date?.toISOString() ?? new Date().toISOString()
                    );
                    setOpenCalander(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs my-1">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <Address setValue={setValue} />
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => onClose()} type="button">
          Close
        </Button>
        <Button type="submit">{patient?._id ? "Update Customer" : "Register Customer"}</Button>
      </div>
    </form>
  );
}

type Props = {
  values: string[]; // CONDITIONS array
  selected: string[]; // current selected array from react-hook-form watch
  setValue: (v: string[]) => void;
  errors: FieldErrors<{
    name: string;
    phoneNumber: string;
    email: string;
    gender: "Male" | "Female" | "Other";
    age: unknown;
    conditions?: string[] | undefined;
    blood?: string | undefined;
    allergies?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
  }>;
};

export default function MultiConditionSelect({
  values,
  selected,
  setValue,
  errors,
}: Props) {
  const toggle = (val: string) => {
    const exists = selected.includes(val);
    const next = exists
      ? selected.filter((s) => s !== val)
      : [...selected, val];
    setValue(next);
  };

  const clearAll = () => setValue([]);

  return (
    <div className="grid gap-2">
      <Label>Conditions</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-haspopup="listbox"
            className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-left flex items-center justify-between"
            variant="outline"
          >
            <div className="truncate">
              {selected.length === 0 ? (
                <span className="text-slate-400">
                  Select patient conditions
                </span>
              ) : (
                <div className="flex gap-2 flex-wrap items-center">
                  {selected.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-white"
                    >
                      {s}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(s);
                        }}
                        className="ml-1"
                        aria-label={`remove ${s}`}
                      >
                        <X className="w-3 h-3" />
                      </div>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {selected.length > 0 ? `${selected.length}` : ""}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Choose conditions</div>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="grid gap-2 max-h-56 overflow-auto">
            {values.map((v) => (
              <label
                key={v}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(v)}
                  onCheckedChange={() => toggle(v)}
                />
                <span className="text-sm">{v}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {errors?.conditions && (
        <p className="text-red-500 text-xs my-1">
          {errors?.conditions.message}
        </p>
      )}
    </div>
  );
}
