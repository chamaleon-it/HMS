import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  FileText,
  FlaskConical,
  Hospital,
} from "lucide-react";
import React, { useState } from "react";
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ActionButton({ data, testIsOK }: { data: DataType, testIsOK: boolean }) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const router = useRouter();

  const consulting = async (status: string) => {
    if (!testIsOK) {
      toast.error("Please confirm the test before proceeding.");
      return;
    }

    try {
      if (alreadySubmitted) {
        toast.error("This consultation has already been recorded.");
        return;
      }

      const payload = {
        ...data,
        medicines: (data.medicines || [])
          .filter((e) => !!e.name || !!e.referralName?.trim())
          .map((e) => ({
            ...e,
            name: e.name && /^[0-9a-fA-F]{24}$/.test(e.name) ? e.name : null,
          })),
      };

      await toast.promise(api.post("/consultings", payload), {
        loading: "We are recording this consultation.",
        error: ({ response }) => response?.data?.message || "Failed to record consultation.",
        success: ({ data }) => data?.message || "Consultation recorded successfully.",
      });

      await toast.promise(
        api.patch(`/appointments/update-status/${data.appointment}`, {
          status: status,
        }),
        {
          loading: "Updating appointment status...",
          error: ({ response }) => response?.data?.message || "Failed to update status.",
          success: ({ data }) => data?.message || "Status updated.",
        }
      );

      setAlreadySubmitted(true);
      router.push("/dashboard/doctor");
    } catch (error) {
      console.error("Error submitting consultation:", error);
    }
  };

  return (
    <div className="flex justify-between gap-2 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => window.print()}
        className="cursor-pointer"
      >
        <FileText className="w-4 h-4 mr-1" /> Print
      </Button>
      <motion.div whileTap={{ scale: 0.98 }} className="flex flex-wrap gap-3">
        {/* Observation Button */}
        <Button
          type="button"
          onClick={() => consulting("Observation")}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          Observation
        </Button>

        {/* Admit Button */}
        <Button
          type="button"
          onClick={() => consulting("Admit")}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm cursor-pointer"
        >
          <Hospital className="w-4 h-4" />
          Admit
        </Button>

        {/* Complete Consultation */}
        <Button
          type="button"
          onClick={() => consulting("Consulted")}
          className="flex items-center gap-2 bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white font-semibold shadow-sm cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          Complete
        </Button>
      </motion.div>
    </div>
  );
}
