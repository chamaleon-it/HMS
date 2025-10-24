import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { createAppointmentSchema } from "@/schemas/createAppointmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, UserRound } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import DateTimePicker from "./DateTimePicker";
import PatientSelection from "./PatientSelection";
import Select from "./AppointmentSelect";
const METHODS = ["In clinic", "Video", "Phone"] as const;

export function CreateAppointmentForm({
  onClose,
  mutate,
  walkIn = false,
}: {
  onClose: () => void;
  mutate?: () => void;
  walkIn?: boolean;
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
          <PatientSelection setValue={setValue} values={values} />
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
          <DateTimePicker
            setValue={setValue}
            doctor={values.doctor}
            walkIn={walkIn}
          />

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
