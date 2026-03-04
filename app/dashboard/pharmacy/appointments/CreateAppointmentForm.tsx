import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { createAppointmentSchema } from "@/schemas/createAppointmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, UserRound } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR, { useSWRConfig } from "swr";
import DateTimePicker from "./DateTimePicker";
import PatientSelection from "./PatientSelection";
import Select from "./AppointmentSelect";
import BlankPrescription from "./BlankPrescription";
const METHODS = ["In clinic", "Video", "Phone"] as const;

export function CreateAppointmentForm({
  onClose,
  mutate,
  walkIn = false,
  appointment,
}: {
  onClose: () => void;
  mutate?: () => void;
  walkIn?: boolean;
  appointment?: {
    _id: string;
    patient: {
      _id: string;
      mrn: string;
      name: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: Date;
      blood: string;
      allergies: string;
      address: string;
      notes: string;
      createdAt: Date;
    };
    doctor: {
      _id: string;
      name: string;
      email: string;
      phoneNumber: string | null;
      address: string | null;
      profilePic: string | null;
    };
    createdBy: string;
    method: "In clinic" | "Video" | "Phone";
    date: Date;
    notes: string | null;
    internalNotes: string | null;
    type: "New" | "Follow up";
    status:
    | "Upcoming"
    | "Consulted"
    | "Observation"
    | "Completed"
    | "Not show"
    | "Admit"
    | "Test";
    isPaid: boolean;
    createdAt: Date;
    visitCount: number;
    visitId?: string;
  };
}) {
  const { data: doctorsData } = useSWR<{
    data: {
      _id: string;
      name: string;
      email: string;
    }[];
    message: string;
  }>("/users/doctors", {
    revalidateIfStale: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const { mutate: globalMutate } = useSWRConfig();

  const refreshCalendars = async () => {
    // Invalidate monthly calendar
    await globalMutate(
      (key) => typeof key === 'string' && key.startsWith('/appointments/calender-monthly'),
      undefined,
      { revalidate: true }
    );

    // Invalidate weekly calendar (which has query params)
    await globalMutate(
      (key) => typeof key === 'string' && key.startsWith('/appointments/calender/weekly'),
      undefined,
      { revalidate: true }
    );
  };

  useEffect(() => {
    if (appointment) {
      // Safely access properties, as appointment might be a partial object when coming from "Book Follow-up"
      const doctorId = typeof appointment.doctor === 'object' ? appointment.doctor?._id : appointment.doctor;
      const patientId = typeof appointment.patient === 'object' ? appointment.patient?._id : appointment.patient;

      reset({
        date: appointment.date ? new Date(appointment.date).toISOString() : new Date().toISOString(),
        doctor: doctorId || "",
        internalNotes: appointment.internalNotes || "",
        isPaid: appointment.isPaid ? "true" : "false",
        method: appointment.method || "In clinic",
        notes: appointment.notes || "",
        patient: patientId || "",
        type: appointment.type || "New",
      });
    }
  }, [appointment, reset]);

  useEffect(() => {
    if (doctorsData?.data?.length && !appointment && !watch("doctor")) {
      setValue("doctor", doctorsData.data[0]._id);
    }
  }, [doctorsData, appointment, setValue, watch]);

  const values = watch();

  const { data: profile } = useSWR<{
    data: {
      pharmacy: {
        billing: {
          autoGeneratePrescription: boolean
        }
      }
    },
    message: string
  }>("/users/profile");

  const autoGeneratePrescription = profile?.data?.pharmacy?.billing?.autoGeneratePrescription || false;

  const [printData, setPrintData] = React.useState<any>(null);


  const createAppointment = handleSubmit(async (data) => {
    try {
      if (appointment?._id) {
        await toast.promise(
          api.patch(`/appointments/${appointment._id}`, data),
          {
            loading: "Please wait, We are Updating an appointment",
            success: ({ data }) => data.message,
            error: ({ response }) => response.data.message,
          }
        );
        reset({
          doctor: doctorsData?.data[0]?._id,
          method: "In clinic",
          type: "New",
          isPaid: "false",
        });
        onClose();
        if (mutate) {
          mutate();
        }
        await refreshCalendars();

        return;
      }
      const res = await toast.promise(api.post("/appointments", data), {
        loading: "Please wait, We are creating an appointment",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });

      if (autoGeneratePrescription) {
        try {
          const createdId = res.data?.data?._id;
          if (createdId) {
            const { data: fullAppt } = await api.get(`/appointments/single/${createdId}`);
            let printPayload = fullAppt.data;
            if (typeof printPayload.doctor === 'string') {
              const selectedDoctor = doctorsData?.data.find((d) => d._id === printPayload.doctor);
              if (selectedDoctor) {
                printPayload = { ...printPayload, doctor: selectedDoctor };
              }
            }
            setPrintData(printPayload);
            await refreshCalendars();
            if (mutate) mutate();
            reset({ doctor: doctorsData?.data[0]?._id });

            setTimeout(() => {
              window.print();
              setPrintData(null);
              onClose();
            }, 500);
            return;
          }
        } catch (err) {
          console.error("Failed to prepare prescription print", err);
          // Fallback simple close if print prep fails
        }
      }

      reset({ doctor: doctorsData?.data[0]?._id });
      onClose();
      if (mutate) {
        mutate();
      }

      await refreshCalendars();
    } catch (error) {
      console.log(error);
    }
  });

  // Refs for keyboard navigation
  const refs = {
    patient: useRef<HTMLInputElement>(null),
    doctor: useRef<HTMLButtonElement>(null),
    method: useRef<HTMLButtonElement>(null),
    notes: useRef<HTMLTextAreaElement>(null),
    type: useRef<HTMLButtonElement>(null),
    isPaid: useRef<HTMLButtonElement>(null),
    internalNotes: useRef<HTMLTextAreaElement>(null),
    submitButton: useRef<HTMLButtonElement>(null),
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  return (
    <form className="space-y-5" onSubmit={createAppointment}>
      <section className="space-y-3 print:hidden">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Patient</h3>
        </div>
        <div className="">
          <PatientSelection
            setValue={setValue}
            values={values}
            patient={appointment?.patient}
            ref={refs.patient}
            onKeyDown={(e) => handleKeyDown(e, refs.doctor)}
          />
          {errors.patient && (
            <p className="text-red-500 text-xs mt-1.5">
              Please select a patient
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <h3 className="font-medium">Appointment</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Doctor</Label>
            <Select
              value={values.doctor}
              onChange={(v) => setValue("doctor", v, { shouldValidate: true })}
              placeholder="Choose doctor"
              options={
                doctorsData?.data.map((s) => ({ label: s.name, value: s._id })) ?? []
              }
              ref={refs.doctor}
              onKeyDown={(e) => handleKeyDown(e, refs.method)}
            />
            {errors.doctor && (
              <p className="text-red-500 text-xs mt-1.5">
                Please select a doctor
              </p>
            )}
          </div>
          <div>
            <Label>Method</Label>
            <Select
              value={values.method}
              onChange={(v) => setValue("method", v)}
              placeholder="In-clinic / Video / Phone"
              options={METHODS.map((s) => ({ label: s, value: s })) ?? []}
              ref={refs.method}
              onKeyDown={(e) => handleKeyDown(e, refs.notes)}
            />
            {errors.method && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.method.message}
              </p>
            )}
          </div>
          <div className="w-full col-span-full">
            <DateTimePicker
              setValue={setValue}
              doctor={values.doctor}
              walkIn={walkIn}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1.5">
                Please select date and time
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label>Reason / Notes</Label>
            <Textarea
              rows={3}
              placeholder="Optional"
              {...register("notes")}
              className="mt-2.5"
              ref={(e) => {
                register("notes").ref(e);
                refs.notes.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, refs.type)}
            />
            {errors.notes && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Advanced</h3>
        </div>

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
                ref={refs.type}
                onKeyDown={(e) => handleKeyDown(e, refs.isPaid)}
              />
              {errors.type && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.type.message}
                </p>
              )}
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
                ref={refs.isPaid}
                onKeyDown={(e) => handleKeyDown(e, refs.internalNotes)}
              />
              {errors.isPaid && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.isPaid.message}
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      <div className="flex items-center justify-between pt-2 print:hidden">
        <Button variant="ghost" onClick={onClose} type="button">
          Close
        </Button>
        <Button type="submit" ref={refs.submitButton}>
          {appointment?._id ? "Save" : "Create"} Appointment
        </Button>
      </div>
      {printData && <BlankPrescription data={printData} />}
    </form>
  );
}
