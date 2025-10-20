import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, FileText, FlaskConical, Hospital } from "lucide-react";
import React, { useState } from "react";
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ActionButton({ data }: { data: DataType }) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const router = useRouter();

  const consulting = async (status: string) => {
    try {
      if (alreadySubmitted) {
        toast.error("This consultation has already been recorded.");
        return;
      }

      await toast.promise(
        api.patch(`/appointments/update_status/${data.appointment}`, {
          status: status,
        }),
        {
          loading: "Please wait we are updating status",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        }
      );

      await toast.promise(api.post("/consultings", data), {
        loading: "We are recording this consultation.",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });
      router.push("/dashboard/doctor");
      setAlreadySubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-between gap-2 mt-6">
      <Button variant="outline">
        <FileText className="w-4 h-4 mr-1" /> Print
      </Button>
      <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex flex-wrap gap-3"
    >
      {/* Test Button */}
      <Button
        onClick={() => consulting("Test")}
        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm cursor-pointer"
      >
        <FlaskConical className="w-4 h-4" />
        Send for Test
      </Button>

      {/* Observation Button */}
      <Button
        onClick={() => consulting("Observation")}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm cursor-pointer"
      >
        <Eye className="w-4 h-4" />
        Observation
      </Button>

      {/* Admit Button */}
      <Button
        onClick={() => consulting("Admit")}
        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm cursor-pointer"
      >
        <Hospital className="w-4 h-4" />
        Admit
      </Button>

      {/* Complete Consultation */}
      <Button
        onClick={() => consulting("Consulted")}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
        Complete
      </Button>
    </motion.div>
    </div>
  );
}
