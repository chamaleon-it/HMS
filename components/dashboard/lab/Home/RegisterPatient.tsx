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
import { useEffect, useRef, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/auth/context/auth-context";
import Address from "./Address";
import { useDebounce } from "@/hooks/useDebounce";
import usePatientAlreadyExist from "@/data/usePatientAlreadyExist";
import ExistingPatientCard from "./ExistingPatientCard";
import { RegisterPatientSchema } from "@/schemas/registerPatientSchema";

export function RegisterPatient({ onClose, patient, mutate }: { onClose: (id?: string, name?: string) => void, patient?: any, mutate?: () => void }) {
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<RegisterPatientSchema>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      name: patient?.name || "",
      phoneNumber: patient?.phoneNumber || "",
      doctor: patient?.doctor || user?._id,
      gender: patient?.gender,
      dateOfBirth: patient?.dateOfBirth || "",
      age: patient?.age || "",
      month: patient?.month || "",
      address: patient?.address || "",
      allergies: patient?.allergies || "",
      mrn: patient?.mrn || "",
      guardian: patient?.guardian || "",
      guardianPhoneNumber: patient?.guardianPhoneNumber || "",
      guardianRelation: patient?.guardianRelation || "",
    },
  });

  const values = watch();
  const { dateOfBirth } = values;

  const refs = {
    name: useRef<HTMLInputElement>(null),
    mrn: useRef<HTMLInputElement>(null),
    phoneNumber: useRef<HTMLInputElement>(null),
    gender: useRef<HTMLButtonElement>(null),
    dob: useRef<HTMLButtonElement>(null),
    age: useRef<HTMLInputElement>(null),
    month: useRef<HTMLInputElement>(null),
    allergies: useRef<HTMLInputElement>(null),
    guardian: useRef<HTMLInputElement>(null),
    guardianPhoneNumber: useRef<HTMLInputElement>(null),
    guardianRelation: useRef<HTMLInputElement>(null),
    addressDetails: {
      line1: useRef<HTMLInputElement>(null),
      line2: useRef<HTMLInputElement>(null),
      city: useRef<HTMLInputElement>(null),
      state: useRef<HTMLInputElement>(null),
      pin: useRef<HTMLInputElement>(null),
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const mergeRefs = (...refs: any[]) => {
    return (node: any) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref != null) {
          ref.current = node;
        }
      });
    };
  };

  useEffect(() => {
    if (patient) {
      reset({
        name: patient?.name || "",
        phoneNumber: patient?.phoneNumber || "",
        doctor: patient?.doctor || user?._id,
        gender: patient?.gender,
        dateOfBirth: patient?.dateOfBirth || "",
        age: patient?.age || "",
        address: patient?.address || "",
        mrn: patient?.mrn || ""
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
  const [dobSetFromAge, setDobSetFromAge] = useState(false);

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
    phoneNumber: (debouncedPhone?.length || 0) > 4 ? debouncedPhone : undefined,
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2 relative">
            <Label>Name *</Label>
            <Input
              placeholder="Enter patient name"
              {...register("name")}
              ref={mergeRefs(refs.name, register("name").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.mrn)}
              onChange={(e) => {
                const capitalizedValue = e.target.value.replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                );
                setValue("name", capitalizedValue, { shouldValidate: true });
              }}
            />
            {errors.name && (
              <p className="text-red-500 text-xs my-1">{errors.name.message}</p>
            )}

            {/* Existing Patient Card for Name */}
            {isExistByName?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%-10px)] left-0 w-[calc(300%+32px)] z-50">
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
              ref={mergeRefs(refs.mrn, register("mrn").ref)}
              value={values.mrn ?? ""}
              disabled={patient?._id}
              onKeyDown={(e) => handleKeyDown(e, refs.phoneNumber)}
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
              ref={mergeRefs(refs.phoneNumber, register("phoneNumber").ref)}
              value={values.phoneNumber ?? ""}
              onKeyDown={(e) => handleKeyDown(e, refs.gender)}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs my-1">
                {errors.phoneNumber.message}
              </p>
            )}

            {/* Existing Patient Card for Phone */}
            {isExistByPhone?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%-10px)] left-0 w-[calc(300%+32px)] z-50">
                <ExistingPatientCard
                  patient={alreadyExistPatient}
                  onSelect={onClose}
                  onDismiss={() => setDismissed(true)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Gender *</Label>
            <Select
              onValueChange={(
                value: "Male" | "Female" | "Other"
              ) => setValue("gender", value)}
              value={values.gender}
            >
              <SelectTrigger
                ref={refs.gender}
                onKeyDown={(e) => handleKeyDown(e, refs.dob)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map((v) => (
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
                  ref={refs.dob}
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                  onKeyDown={(e) => handleKeyDown(e, refs.age)}
                >
                  {dateOfBirth && dateOfBirth !== ""
                    ? dobSetFromAge
                      ? `${new Date(dateOfBirth).getFullYear()}`
                      : `${new Date(dateOfBirth).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
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
                  selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (date) {
                      setValue("dateOfBirth", date.toISOString());

                      const today = new Date();
                      let years = today.getFullYear() - date.getFullYear();
                      let months = today.getMonth() - date.getMonth();
                      if (today.getDate() < date.getDate()) {
                        months--;
                      }
                      if (months < 0) {
                        years--;
                        months += 12;
                      }

                      setValue("age", years.toString());
                      setValue("month", months.toString());
                      setDobSetFromAge(false);
                    } else {
                      setValue("dateOfBirth", "");
                    }
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Age (Years)</Label>
              <Input
                {...register("age")}
                ref={mergeRefs(refs.age, register("age").ref)}
                type="number"
                placeholder="0"
                onKeyDown={(e) => handleKeyDown(e, refs.month)}
                onChange={(e) => {
                  const ageValue = e.target.value;
                  const monthValue = values.month || "0";
                  setValue("age", ageValue);

                  if ((ageValue && Number(ageValue) > 0) || (monthValue && Number(monthValue) > 0)) {
                    const today = new Date();
                    const estimatedDob = new Date(
                      today.getFullYear() - Number(ageValue || 0),
                      today.getMonth() - Number(monthValue || 0),
                      today.getDate()
                    );
                    setValue("dateOfBirth", estimatedDob.toISOString());
                    setDobSetFromAge(true);
                  } else {
                    setValue("dateOfBirth", "");
                    setDobSetFromAge(false);
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Months</Label>
              <Input
                {...register("month")}
                ref={mergeRefs(refs.month, register("month").ref)}
                type="number"
                placeholder="0"
                onKeyDown={(e) => handleKeyDown(e, refs.allergies)}
                onChange={(e) => {
                  const monthValue = e.target.value;
                  const ageValue = values.age || "0";
                  setValue("month", monthValue);

                  if ((ageValue && Number(ageValue) > 0) || (monthValue && Number(monthValue) > 0)) {
                    const today = new Date();
                    const estimatedDob = new Date(
                      today.getFullYear() - Number(ageValue || 0),
                      today.getMonth() - Number(monthValue || 0),
                      today.getDate()
                    );
                    setValue("dateOfBirth", estimatedDob.toISOString());
                    setDobSetFromAge(true);
                  } else {
                    setValue("dateOfBirth", "");
                    setDobSetFromAge(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Allergies</Label>
            <Input
              placeholder="Allergies"
              {...register("allergies")}
              ref={mergeRefs(refs.allergies, register("allergies").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.guardian)}
              onChange={(e) => {
                setValue("allergies", capitalizeFirstLetter(e.target.value), {
                  shouldValidate: true,
                });
              }}
            />
            {errors.allergies && (
              <p className="text-red-500 text-xs my-1">
                {errors.allergies.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Guardian Name</Label>
            <Input
              placeholder="Guardian Name"
              {...register("guardian")}
              ref={mergeRefs(refs.guardian, register("guardian").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.guardianPhoneNumber)}
              onChange={(e) => {
                setValue("guardian", capitalizeFirstLetter(e.target.value), {
                  shouldValidate: true,
                });
              }}
            />
            {errors.guardian && (
              <p className="text-red-500 text-xs my-1">
                {errors.guardian.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Guardian Phone Number</Label>
            <Input
              placeholder="Guardian Phone Number"
              {...register("guardianPhoneNumber")}
              ref={mergeRefs(refs.guardianPhoneNumber, register("guardianPhoneNumber").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.guardianRelation)}
              onChange={(e) => {
                setValue("guardianPhoneNumber", e.target.value, {
                  shouldValidate: true,
                });
              }}
            />
            {errors.guardianPhoneNumber && (
              <p className="text-red-500 text-xs my-1">
                {errors.guardianPhoneNumber.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Guardian Relation</Label>
            <Input
              placeholder="Guardian Relation"
              {...register("guardianRelation")}
              ref={mergeRefs(refs.guardianRelation, register("guardianRelation").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.addressDetails.line1)}
              onChange={(e) => {
                setValue("guardianRelation", capitalizeFirstLetter(e.target.value), {
                  shouldValidate: true,
                });
              }}
            />
            {errors.guardianRelation && (
              <p className="text-red-500 text-xs my-1">
                {errors.guardianRelation.message}
              </p>
            )}
          </div>

          <Address setValue={setValue} refs={refs.addressDetails} />
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => onClose()} type="button">
          Close
        </Button>
        <Button type="submit" className="bg-black text-white transition-colors shadow-sm hover:bg-gray-700 hover:text-white">{patient?._id ? "Update Customer" : "Register Customer"}</Button>
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
