"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { useOrderDrafts } from "./OrderDraftContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegisterPatient } from "./RegisterPatient";

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const { addDraft } = useOrderDrafts();
  const { user } = useAuth();
  const router = useRouter();
  const [openRegister, setOpenRegister] = useState(false);

  // Handle URL params for direct order creation if needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const doctor = params.get("doctor");
    const allergiesParam = params.get("allergies");

    if (window.location.hash === "#newOrder" && id) {
      addDraft({
        patient: id,
        doctor: doctor || user?._id || "",
        allergies: allergiesParam || ""
      });
      window.location.hash = "";
    }
  }, [addDraft, user?._id]);

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => setOpenRegister(true)} 
        className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
      >
        New Customer
      </Button>
      
      <Button
        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        size="sm"
        onClick={() => addDraft()}
      >
        New Order
      </Button>

      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient 
            onClose={(id?: string) => {
              setOpenRegister(false);
              if (id) {
                // If a patient was registered, maybe open a new order for them?
                addDraft({ patient: id });
              }
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
