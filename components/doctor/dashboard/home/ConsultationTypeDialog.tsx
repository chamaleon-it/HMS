"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Stethoscope, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConsultationTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export function ConsultationTypeDialog({
  isOpen,
  onClose,
  appointmentId,
}: ConsultationTypeDialogProps) {
  const router = useRouter();

  const handleSelect = (type: "consulting" | "consulting-2") => {
    onClose();
    router.push(`/dashboard/doctor/${type}/?id=${appointmentId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Select Consultation Type
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Please choose the consultation form format you wish to proceed with.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {/* Option 1: Standard Consultation */}
          <button
            type="button"
            onClick={() => handleSelect("consulting")}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-500 hover:shadow-md transition-all group text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-800 text-sm mb-1 text-center">
              Standard Consultation
            </span>
            <span className="text-xs text-slate-500 text-center">
              General OPD & clinical diagnosis format
            </span>
          </button>

          {/* Option 2: Acupuncture Consultation */}
          <button
            type="button"
            onClick={() => handleSelect("consulting-2")}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-500 hover:shadow-md transition-all group text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-800 text-sm mb-1 text-center">
              Acupuncture Consultation
            </span>
            <span className="text-xs text-slate-500 text-center">
              Specialized acupuncture & assessment form
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
