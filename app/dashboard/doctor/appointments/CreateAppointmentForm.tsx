import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { createAppointmentSchema } from "@/schemas/createAppointmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm, UseFormSetValue } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import DateTimePicker from "./DateTimePicker";
const METHODS = ["In clinic", "Video", "Phone"] as const;

export function CreateAppointmentForm({ onClose }: { onClose: () => void }) {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const { mutate } = useSWR("/appointments/list");
  const { data } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors");

  const {
    register,
    handleSubmit,
    // formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      method: "In clinic",
      type: "New",
      isPaid: "false",
    },
  });

  const createAppointment = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/appointments", data), {
        loading: "Please wait, We are creating an appointment",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      reset();
      onClose();
      mutate();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <form className="space-y-5" onSubmit={createAppointment}>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Patient</h3>
        </div>
        <div className="">
          <PatientSelection setValue={setValue} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <h3 className="font-medium">Appointment</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Doctor</Label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register("doctor")}
            >
              <option value="">Choose doctor</option>
              {data?.data.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Method</Label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register("method")}
            >
              <option value="">In-clinic / Video / Phone</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          {/* <Input type="datetime-local" {...register("date")} /> */}
          <DateTimePicker setValue={setValue} />

          <div className="sm:col-span-2">
            <Label>Reason / Notes</Label>
            <Textarea rows={3} placeholder="Optional" {...register("notes")} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Advanced</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Show</span>
            <input
              type="checkbox"
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
          </div>
        </div>
        {showAdvanced && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Appointment Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  {...register("type")}
                >
                  <option>New</option>
                  <option>Follow up</option>
                </select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  {...register("isPaid")}
                >
                  <option value={"false"}>Unpaid</option>
                  <option value={"true"}>Paid</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea
                rows={3}
                placeholder="Visible to staff only"
                {...register("internalNotes")}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onClose} type="button">
          Close
        </Button>
        <Button type="submit">Create Appointment</Button>
      </div>
    </form>
  );
}

type Patient = {
  _id: string;
  name: string;
  phoneNumber: string;
};

const PatientSelection = ({
  setValue,
}: {
  setValue: UseFormSetValue<{
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    type?: string | undefined;
  }>;
}) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: patientData, isLoading } = useSWR<{
    data: Patient[];
  }>(`/patients?limit=5&page=1${query ? `&query=${query}` : ""}`);

  const patients = patientData?.data ?? [];

  const handleSelect = (patient: Patient) => {
    setSelected(patient);
    setIsOpen(false);
    setQuery(patient.name);
    setValue("patient", patient._id);
  };

  return (
    <div className="relative w-full">
      <Label className="mb-1 block">Patient Name</Label>
      <Input
        placeholder="Search or type new"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full"
      />

      {isOpen && query && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ScrollArea className="max-h-56">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : patients.length > 0 ? (
              patients.map((p) => (
                <div
                  key={p._id}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-gray-100",
                    selected?._id === p._id && "bg-gray-100 font-medium"
                  )}
                  onClick={() => handleSelect(p)}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.phoneNumber}</div>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">
                No patients found. Please register a patient first.
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
