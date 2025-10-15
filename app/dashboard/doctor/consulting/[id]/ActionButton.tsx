import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import React, { useState } from "react";
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function ActionButton({ data }: { data: DataType }) {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const consulting = async () => {
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

      await toast.promise(api.post("/consultings", data), {
        loading: "We are recording this consultation.",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });
      setAlreadySubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-end gap-2 mt-6">
      {/* <Button variant="outline">Save Draft</Button> */}
      <Button variant="outline">
        <FileText className="w-4 h-4 mr-1" /> Print
      </Button>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={consulting}
        >
          Complete Consultation
        </Button>
      </motion.div>
    </div>
  );
}
