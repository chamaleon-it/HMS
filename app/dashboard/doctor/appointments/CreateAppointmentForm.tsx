import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { createAppointmentSchema } from "@/schemas/createAppointmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
const METHODS = ["In clinic", "Video", "Phone"] as const;

export function CreateAppointmentForm({ onClose }: { onClose: () => void }) {
  const [showAdvanced, setShowAdvanced] = useState(true);
const {mutate} = useSWR("/appointments/list")
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
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      phoneNumber: "+91",
      method: "In clinic",
      type: "New",
      isPaid: "false",
    },
  });


  console.log(errors);

  const createAppointment = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/appointments", data), {
        loading: "Please wait, We are creating an appointment",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });
      reset()
      onClose()
      mutate()
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Patient Name</Label>
            <Input
              placeholder="Search or type new"
              {...register("patientName")}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="+91" {...register("phoneNumber")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input
              placeholder="name@email.com"
              type="email"
              {...register("email")}
            />
          </div>
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
          <div>
            <Label>Date and time</Label>
            <Input type="datetime-local" {...register("date")} />
          </div>

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
