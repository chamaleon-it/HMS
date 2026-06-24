import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateAppointmentForm } from "./CreateAppointmentForm";

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  walkIn,
  mutate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  walkIn?: boolean;
  mutate?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment?._id ? "Edit Appointment" : "Create Appointment"}</DialogTitle>
        </DialogHeader>
        <CreateAppointmentForm
          onClose={() => onOpenChange(false)}
          mutate={mutate}
          walkIn={walkIn}
          appointment={appointment}
        />
      </DialogContent>
    </Dialog>
  );
}
