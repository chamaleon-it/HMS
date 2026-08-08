"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PrescriptionCard from "./PrescriptionCard";
import { DataType } from "./interface";
import PatientSelection from "./PatientSelection";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/context/auth-context";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { PatientForm } from "@/components/shared/patient/PatientForm";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import PharmacistSelection from "./PharmacistSelection";
import { cn } from "@/lib/utils";
import { useDrafts } from "./DraftContext";

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const { user } = useAuth();
  const { addDraft } = useDrafts();
  const [openCreate, setOpenCreate] = useState(false);
  const [nameToRegister, setNameToRegister] = useState("");

  useEffect(() => {
    const handleRefresh = () => OrderMutate();
    window.addEventListener('order-created', handleRefresh);
    return () => window.removeEventListener('order-created', handleRefresh);
  }, [OrderMutate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mrn = params.get("mrn");
    const name = params.get("name");
    const id = params.get("id");
    const doctor = params.get("doctor");
    const allergiesParam = params.get("allergies");

    if (window.location.hash === "#newOrder" && id) {
      addDraft({
        patient: id,
        doctor: doctor || (user?.role === "Doctor" ? user?._id || null : null),
        doctorName: user?.role === "Doctor" ? user?.name || "" : "",
        allergies: allergiesParam || ""
      }, mrn ? `${name} - (${mrn})` : (name || ""));
      window.location.hash = "";
    }
  }, [addDraft, user]);

  return (
    <div className="flex gap-2">
      <Button

        onClick={() => { setNameToRegister(""); setOpenCreate(true); }}
        className="bg-(--color-synapse-light)  "
      >
        New Customer
      </Button>

      <Button
        className="bg-(--color-synapse-light)  "
        size={"sm"}
        onClick={() => addDraft(user?.role === "Doctor" ? { doctor: user?._id, doctorName: user?.name } : {})}
      >
        New Order
      </Button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl! pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <PatientForm
            patient={{ name: nameToRegister }}
            onClose={(id?: string, name?: string, allergies?: string, mrn?: string) => {
              setOpenCreate(false);
              if (id && name) {
                addDraft({
                  patient: id,
                  doctor: user?.role === "Doctor" ? user?._id || null : null,
                  doctorName: user?.role === "Doctor" ? user?.name || "" : "",
                  allergies: allergies || ""
                }, mrn ? `${name} - (${mrn})` : name);
              }
              setNameToRegister("");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
