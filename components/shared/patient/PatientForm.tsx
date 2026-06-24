import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { ChevronDownIcon, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Address from "./Address";
import { useDebounce } from "@/hooks/useDebounce";
import usePatientAlreadyExist from "@/data/usePatientAlreadyExist";
import ExistingPatientCard from "./ExistingPatientCard";
import { useAuth } from "@/auth/context/auth-context";
import useSWR from "swr";

export function PatientForm({
  onClose,
  mutate,
  patient,
}: {
  onClose: (id?: string, name?: string, allergies?: string, mrn?: string) => void;
  mutate?: () => void;
  patient?: any;
}) {
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const { data: doctorsData } = useSWR<{
    data: { _id: string; name: string }[];
    message: string;
  }>("/users/doctors");

  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      phoneNumber: patient?.phoneNumber || "",
      doctor: patient?.doctor || "none",
      state: patient?.state || "Kerala",
      country: patient?.country || "India",
    },
  });

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phoneNumber: useRef<HTMLInputElement>(null),
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
        name: patient.name,
        mrn: patient.mrn,
        phoneNumber: patient?.phoneNumber?.replace(/\s+/g, ""),
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString()
          : undefined,
        age: patient.age,
        month: patient.month,
        allergies: patient.allergies,
        guardian: patient.guardian,
        guardianPhoneNumber: patient.guardianPhoneNumber,
        guardianRelation: patient.guardianRelation,
        addressLine1: patient.addressLine1,
        addressLine2: patient.addressLine2,
        locality: patient.locality,
        state: patient.state || "Kerala",
        pinCode: patient.pinCode,
        country: patient.country || "India",
        doctor: patient.doctor?._id || patient.doctor || "none",
      });
    }
  }, [patient, reset, user]);

  const values = watch();
  const { dateOfBirth } = values;

  // Auto-calculate age and months when dateOfBirth changes
  useEffect(() => {
    if (dateOfBirth) {
      const ageObj = fAge(new Date(dateOfBirth));
      setValue("age", ageObj.years);
      setValue("month", ageObj.months);
    }
  }, [dateOfBirth, setValue]);

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

  const createEditPatient = handleSubmit(async (data) => {
    try {
      const addressParts = [data.addressLine1, data.addressLine2, data.locality, data.state, data.pinCode, data.country].filter(Boolean);
      data.address = addressParts.join(', ');

      if (!data.doctor || data.doctor === "none") {
        delete data.doctor;
      }

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

      reset();
      onClose(res.data.data._id, res.data.data.name, res.data.data.allergies, res.data.data.mrn);
      if (mutate) {
        mutate();
      }
    } catch (error) {

    }
  });

  const [openCalander, setOpenCalander] = useState(false);

  return (
    <form className="space-y-4" onSubmit={createEditPatient}>
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-slate-800">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium text-[15px]">Customer</h3>
        </div>
        
        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
          
          {/* Row 1 */}
          <div className="grid gap-1.5 relative">
            <Label className="text-sm font-medium text-slate-700">Name *</Label>
            <Input
              placeholder="Enter patient name"
              {...register("name")}
              ref={mergeRefs(refs.name, register("name").ref)}
              onKeyDown={(e) => handleKeyDown(e, refs.phoneNumber)}
              onChange={(e) => {
                const capitalizedValue = e.target.value.replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                );
                setValue("name", capitalizedValue, { shouldValidate: true });
              }}
              className="h-9 rounded-xl"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
            )}

            {isExistByName?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-[calc(200%+16px)] z-50">
                <ExistingPatientCard
                  patient={alreadyExistPatient}
                  onSelect={onClose}
                  onDismiss={() => setDismissed(true)}
                />
              </div>
            )}
          </div>



          <div className="grid gap-1.5 relative">
            <Label className="text-sm font-medium text-slate-700">Phone</Label>
            <Input
              placeholder="Phone Number"
              {...register("phoneNumber")}
              ref={mergeRefs(refs.phoneNumber, register("phoneNumber").ref)}
              value={values.phoneNumber}
              className="h-9 rounded-xl"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message as string}
              </p>
            )}

            {isExistByPhone?.data?.isPatientAlreadyExists && alreadyExistPatient && !dismissed && !patient?._id && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-[calc(200%+16px)] z-50">
                <ExistingPatientCard
                  patient={alreadyExistPatient}
                  onSelect={onClose}
                  onDismiss={() => setDismissed(true)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Doctor</Label>
            <Select
              onValueChange={(value) => setValue("doctor", value === "none" ? "" : value)}
              value={values.doctor || "none"}
            >
              <SelectTrigger className="w-full h-9 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned / None</SelectItem>
                {doctorsData?.data?.map((doc) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.doctor.message as string}
              </p>
            )}
          </div>

          {/* Row 2 */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Gender *</Label>
            <Select
              onValueChange={(value: "Male" | "Female") => setValue("gender", value)}
              value={patient?.gender || values.gender}
            >
              <SelectTrigger className="w-full h-9 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female"].map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Date of Birth</Label>
            <Popover open={openCalander} onOpenChange={setOpenCalander}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal h-9 rounded-xl"
                >
                  {dateOfBirth
                    ? new Date(dateOfBirth).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Select date of birth"}
                  <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  disabled={{ after: new Date() }}
                  mode="single"
                  selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setValue("dateOfBirth", date?.toISOString() ?? new Date().toISOString());
                    setOpenCalander(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dateOfBirth.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Age (Years)</Label>
              <Input
                placeholder="0"
                type="number"
                {...register("age")}
                onChange={(e) => {
                  setValue("age", e.target.value);
                  const yrs = parseInt(e.target.value) || 0;
                  const mths = parseInt(getValues("month") as string) || 0;
                  const today = new Date();
                  const dob = new Date(today.getFullYear() - yrs, today.getMonth() - mths, today.getDate());
                  setValue("dateOfBirth", dob.toISOString());
                }}
                className="h-9 rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium text-slate-700">Months</Label>
              <Input
                placeholder="0"
                type="number"
                {...register("month")}
                onChange={(e) => {
                  setValue("month", e.target.value);
                  const yrs = parseInt(getValues("age") as string) || 0;
                  const mths = parseInt(e.target.value) || 0;
                  const today = new Date();
                  const dob = new Date(today.getFullYear() - yrs, today.getMonth() - mths, today.getDate());
                  setValue("dateOfBirth", dob.toISOString());
                }}
                className="h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Allergies</Label>
            <Input
              placeholder="Allergies"
              {...register("allergies")}
              onChange={(e) => {
                setValue("allergies", capitalizeFirstLetter(e.target.value), {
                  shouldValidate: true,
                });
              }}
              className="h-9 rounded-xl"
            />
            {errors.allergies && (
              <p className="text-red-500 text-xs mt-1">
                {errors.allergies.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Guardian Name</Label>
            <Input
              placeholder="Guardian Name"
              {...register("guardian")}
              className="h-9 rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Guardian Phone Number</Label>
            <Input
              placeholder="Guardian Phone Number"
              {...register("guardianPhoneNumber")}
              className="h-9 rounded-xl"
            />
          </div>

          {/* Row 4 */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium text-slate-700">Guardian Relation</Label>
            <Input
              placeholder="Guardian Relation"
              {...register("guardianRelation")}
              className="h-9 rounded-xl"
            />
          </div>
        </div>
      </section>

      <Address setValue={setValue} watch={watch} errors={errors} />

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={() => onClose()} type="button" className="text-slate-600">
          Close
        </Button>
        <Button type="submit" className="bg-black hover:bg-zinc-800 text-white rounded-xl px-6">
          {patient?._id ? "Edit" : "Register"} Customer
        </Button>
      </div>
    </form>
  );
}
