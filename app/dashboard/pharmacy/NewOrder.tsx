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
import { RegisterPatient } from "./RegisterPatient";
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
        doctor: doctor || user?._id || "",
        allergies: allergiesParam || ""
      }, name || "");
      window.location.hash = "";
    }
  }, [addDraft, user?._id]);

  return (
    <div className="flex gap-2">
      <Button
        variant={"outline"}
        onClick={() => { setNameToRegister(""); setOpenCreate(true); }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        New Customer
      </Button>

      <Button
        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        size={"sm"}
        onClick={() => addDraft({ doctor: user?._id || "" })}
      >
        New Order
      </Button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl! pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient
            patient={{ name: nameToRegister }}
            onClose={(id?: string, name?: string, allergies?: string) => {
              setOpenCreate(false);
              if (id && name) {
                addDraft({
                  patient: id,
                  doctor: user?._id || "",
                  allergies: allergies || ""
                }, name);
              }
              setNameToRegister("");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
