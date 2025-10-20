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
import React, { useEffect, useMemo, useState } from "react";
import { useForm, UseFormSetValue } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import DateTimePicker from "./DateTimePicker";
const METHODS = ["In clinic", "Video", "Phone"] as const;

export function CreateAppointmentForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate?: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(true);
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
    watch,
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

  const values = watch();

  const createAppointment = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/appointments", data), {
        loading: "Please wait, We are creating an appointment",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
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
            <Select
              value={values.doctor}
              onChange={(v) => setValue("doctor", v)}
              placeholder="Choose doctor"
              options={
                data?.data.map((s) => ({ label: s.name, value: s._id })) ?? []
              }
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select
              value={values.method}
              onChange={(v) => setValue("method", v)}
              placeholder="In-clinic / Video / Phone"
              options={METHODS.map((s) => ({ label: s, value: s })) ?? []}
            />
          </div>
          {/* <Input type="datetime-local" {...register("date")} /> */}
          <DateTimePicker setValue={setValue} doctor={values.doctor} />

          <div className="sm:col-span-2">
            <Label>Reason / Notes</Label>
            <Textarea
              rows={3}
              placeholder="Optional"
              {...register("notes")}
              className="mt-2.5"
            />
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

                <Select
                  value={values.type || "New"}
                  onChange={(v) => setValue("type", v)}
                  placeholder="Appointment Type"
                  options={
                    ["New", "Follow up"].map((s) => ({ label: s, value: s })) ??
                    []
                  }
                />
              </div>
              <div>
                <Label>Payment Status</Label>

                <Select
                  value={values.isPaid}
                  onChange={(v) => setValue("isPaid", v)}
                  placeholder="Payment Status"
                  options={[
                    { value: "false", label: "Unpaid" },
                    { value: "true", label: "Paid" },
                  ]}
                />
              </div>
            </div>
            <div>
              <Label>Internal Note</Label>
              <Textarea
                rows={3}
                placeholder="Visible to staff only"
                {...register("internalNotes")}
                className="mt-2.5"
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
      <Label className=" block">Patient Name</Label>
      <Input
        placeholder="Search or type new"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full mt-2.5"
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

function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  placeholder: string;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const visible = useMemo(() => {
    if (!searchable || !q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [options, q, searchable]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className} mt-2.5`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`h-11 px-3 rounded-xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 inline-flex items-center gap-2 min-w-[150px] w-full justify-between`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${placeholder}: ${current ? current.label : "Any"}`}
        title={`${placeholder}: ${current ? current.label : "Any"}`}
      >
        <span className="truncate text-sm text-gray-700">
          {current ? current.label : placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[min(240px,calc(100vw-2rem))] max-h-72 overflow-auto bg-white rounded-xl shadow-xl ring-1 ring-gray-200 p-2">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="mb-2 w-full h-9 px-3 rounded-lg bg-gray-50 ring-1 ring-gray-200 focus:ring-gray-300"
            />
          )}
          <ul role="listbox" className="grid gap-1">
            {visible.map((o) => {
              const active = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && <span>✓</span>}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
