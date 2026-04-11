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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import {
  combineToIST,
  fAge,
  fDate,
  generateTimeSlots,
  isSameDay,
  startOfDay,
  toMinutes,
} from "@/lib/fDateAndTime";
import registerPatientSchema from "@/schemas/registerPatientSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChevronDownIcon, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Address from "./Address";

import useSWR from "swr";
import AppointmentSelect from "./AppointmentSelect";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { BLOOD_GROUPS, CONDITIONS } from "./data";
import InsuranceSelection from "./InsuranceSelection";
import { Data } from "./PatientTable";

const getRoundForTime = (
  time: string,
  rounds?: { label: string; start: string; end: string }[]
) => {
  if (!rounds?.length) return null;
  const tm = toMinutes(time);
  return (
    rounds.find((r) => tm >= toMinutes(r.start) && tm <= toMinutes(r.end)) ||
    null
  );
};

export function RegisterPatient({
  onClose,
  mutate,
  patient,
}: {
  onClose: () => void;
  mutate?: () => void;
  patient?: Data;
}) {
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
      phoneNumber: "+91",
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        address: patient.address,
        allergies: patient.allergies,
        blood: patient.blood,
        conditions: patient.conditions,
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString()
          : undefined,
        doctor: patient.doctor?._id,
        email: patient.email,
        emergencyContactNumber: patient?.emergencyContactNumber?.replace(
          /\s+/g,
          ""
        ),
        gender: patient.gender,
        insurance: patient.insurance,
        insuranceValidity: patient.insuranceValidity
          ? new Date(patient.insuranceValidity).toISOString()
          : undefined,
        name: patient.name,
        notes: patient.notes,
        phoneNumber: patient.phoneNumber.replace(/\s+/g, ""),
        uhid: patient.uhid,
      });
    }
  }, [patient, reset]);

  const values = watch();
  const { conditions, dateOfBirth } = values;

  const { data: walkInData } = useSWR<{
    message: string;
    data: {
      alreadyBooked: Date[];
      nextAvailableDate: Date;
    };
  }>(
    values.doctor ? `/appointments/walk-in/${values.doctor}` : null
  );

  const { data: availabilityData } = useSWR<{
    message: string;
    data: {
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      days: string[];
      rounds: { label: string; start: string; end: string }[];
    };
  }>(values.doctor ? `/users/doctor_availability/${values.doctor}` : null);

  const availability = availabilityData?.data;

  const createEditPatient = handleSubmit(async (data) => {
    try {
      if (patient?._id) {
        await toast.promise(api.patch(`/patients/${patient._id}`, data), {
          loading: "Patient is updating...!",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        });
        reset();
        onClose();
        if (mutate) {
          mutate();
        }

        return;
      }

      const res = await toast.promise(api.post("/patients", data), {
        loading: "Patient is registering...!",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });

      if (!walkInData?.data || !availability) return;
      const { alreadyBooked, nextAvailableDate } = walkInData.data;

      const nextDate = new Date(nextAvailableDate);
      const today = startOfDay(new Date());
      const isNextDayToday = isSameDay(nextDate, today);

      const now = new Date();
      const cutoffMins = isNextDayToday
        ? now.getHours() * 60 + now.getMinutes()
        : -1;

      const bookedSet = new Set(
        (alreadyBooked ?? []).map((d) => new Date(d).getTime())
      );

      const times = generateTimeSlots(
        availability.startTime ?? "09:00",
        availability.endTime ?? "18:00",
        15
      );



      const firstFree = times.find((time) => {
        const round = getRoundForTime(time, availability.rounds);

        if (round) return false;

        const tm = toMinutes(time);
        if (isNextDayToday && tm < cutoffMins) return false;

        const slotDate = combineToIST(nextDate, time);
        if (bookedSet.has(slotDate.getTime())) return false;

        return true;
      });


      if (!nextAvailableDate || !firstFree) {
        return null;
      }


      const istDate = combineToIST(nextDate, firstFree);

      const appointmentPayload: {
        patient: string;
        doctor: string;
        method: string;
        date: string;
        isPaid: boolean;
        type: string;
      } = {
        patient: res.data.data._id,
        doctor: data.doctor,
        method: "In clinic",
        isPaid: false,
        type: "New",
        date: istDate.toISOString(),
      };
      await toast.promise(api.post("/appointments", appointmentPayload), {
        loading: "We are booking a walk in appointment for you.",
        error: ({ response }) => response.data.message,
        success: "We booked a walk in appointment.",
      });
      reset();
      onClose();
      if (mutate) {
        mutate();
      }
    } catch (error) {
      console.log(error);
    }
  });

  const [openCalander, setOpenCalander] = useState(false);
  const [openInsuranceValidityCalander, setOpenInsuranceValidityCalander] =
    useState(false);

  const { data } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors");

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  useEffect(() => {
    if (name) setValue("name", name);
  }, [name, setValue]);

  return (
    <form className="space-y-5" onSubmit={createEditPatient}>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Patient</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Name *</Label>
            <Input
              placeholder="Enter patient name"
              {...register("name")}
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
          </div>
          <div className="grid gap-2">
            <Label>Phone *</Label>
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
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              placeholder="name@email.com"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs my-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label>Doctor *</Label>
            <AppointmentSelect
              value={values.doctor}
              onChange={(v) => setValue("doctor", v)}
              placeholder="Choose doctor"
              options={
                data?.data.map((s) => ({ label: s.name, value: s._id })) ?? []
              }
            />
            {errors.doctor && (
              <p className="text-red-500 text-xs my-1">
                {errors.doctor.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Gender *</Label>
            <Select
              onValueChange={(
                value: "Male" | "Female" | "Other" | "Prefer not to say"
              ) => setValue("gender", value)}
              value={patient?.gender || values.gender}
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
            <Label>Date of Birth *</Label>

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
                  selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
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

          <div className="grid gap-2">
            <Label>Blood Group</Label>
            <Select
              onValueChange={(value) => setValue("blood", value)}
              value={patient?.blood || values.blood}
            >
              <SelectTrigger className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <SelectValue placeholder="Choose Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.blood && (
              <p className="text-red-500 text-xs my-1">
                {errors.blood.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Allergies</Label>
            <Input
              placeholder="Allergies"
              {...register("allergies")}
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

          <InsuranceSelection
            errors={errors}
            setValue={setValue}
            values={values}
          />

          <div className="grid gap-2">
            <Label>Insurance validity</Label>

            <Popover
              open={openInsuranceValidityCalander}
              onOpenChange={setOpenInsuranceValidityCalander}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex justify-between items-center"
                  )}
                >
                  {values.insuranceValidity
                    ? fDate(values.insuranceValidity)
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  disabled={{
                    before: new Date(),
                  }}
                  startMonth={new Date(2025, 0)}
                  endMonth={new Date(2030, 0)}
                  mode="single"
                  selected={
                    values.insuranceValidity
                      ? new Date(values.insuranceValidity)
                      : new Date()
                  }
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setValue("insuranceValidity", date?.toISOString());
                    setOpenInsuranceValidityCalander(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {errors.insuranceValidity && (
              <p className="text-red-500 text-xs my-1">
                {errors.insuranceValidity.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>UHID</Label>
            <Input placeholder="UHID" {...register("uhid")} />
            {errors.uhid && (
              <p className="text-red-500 text-xs my-1">{errors.uhid.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Emergency Contact Number</Label>
            <Input
              placeholder="Emergency Contact Number"
              {...register("emergencyContactNumber")}
            />
            {errors.emergencyContactNumber && (
              <p className="text-red-500 text-xs my-1">
                {errors.emergencyContactNumber.message}
              </p>
            )}
          </div>

          <div className="col-span-full">
            <MultiConditionSelect
              selected={conditions ?? []}
              setValue={(v: string[]) => setValue("conditions", v)}
              values={CONDITIONS}
              errors={errors}
            />
          </div>

          <Address setValue={setValue} />

          <div className="sm:col-span-2 grid gap-2">
            <Label>Reason / Notes</Label>
            <Textarea rows={3} placeholder="Optional" {...register("notes")} />
            {errors.notes && (
              <p className="text-red-500 text-xs my-1">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onClose} type="button">
          Close
        </Button>
        <Button type="submit">
          {patient?._id ? "Edit" : "Register"} Patient
        </Button>
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
