"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/context/auth-context";
import { RegisterPatient } from "./RegisterPatient";
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

    if (window.location.hash === "#newOrder" && id) {
      addDraft({
        patient: id,
        doctor: doctor || user?._id || "",
      }, mrn ? `${name} - (${mrn})` : (name || ""));
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
            onClose={(id?: string, name?: string, mrn?: string) => {
              setOpenCreate(false);
              if (id && name) {
                addDraft({
                  patient: id,
                  doctor: user?._id || "",
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
