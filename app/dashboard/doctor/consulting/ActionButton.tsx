import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ActionButton({ data,testIsOK }: { data: DataType ,testIsOK:boolean}) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const router = useRouter();

  const consulting = async () => {

    if(!testIsOK){
      toast.error("Please confirm the test before proceeding.")
      return
    }

    try {
      if (alreadySubmitted) {
        toast.error("This consultation has already been recorded.");
        return;
      }

      await toast.promise(
        api.patch(`/appointments/update_status/${data.appointment}`, {
          status: "Consulted",
        }),
        {
          loading: "Please wait we are updating status",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        }
      );

      if (data.medicines.find(e => e.name === "")) {
        toast.error("Some medicine details are missing.");
      }

      const payload = { ...data, medicines: data.medicines.filter(e => !!e.name) }

      await toast.promise(api.post("/consultings", payload), {
        loading: "We are recording this consultation.",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });
      router.push("/dashboard/doctor");
      setAlreadySubmitted(true);
    } catch (error) {

    }
  };

  return (
    <div className="flex justify-end mt-6">
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          onClick={consulting}
          className="flex items-center gap-2 bg-[var(--color-cosmo-dark)] hover:bg-[var(--color-cosmo-dark)] text-white font-semibold shadow-sm cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          Complete
        </Button>
      </motion.div>
    </div>
  );
}
