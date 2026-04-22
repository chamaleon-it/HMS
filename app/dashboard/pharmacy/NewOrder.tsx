"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataType } from "./interface";
import { useAuth } from "@/auth/context/auth-context";
import { RegisterPatient } from "./RegisterPatient";

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [nameToRegister, setNameToRegister] = useState("");
  const [patientName, setpatientName] = useState("")
  const [payload, setPayload] = useState<DataType>({
    patient: "",
    doctor: user?._id ?? "",
    items: [],
    discount: 0,
    priority: "Normal",
    status: "Pending",
    pharmacist: "",
    allergies: ""
  });

  useEffect(() => {
    const channel = new BroadcastChannel('pharmacy-orders');
    channel.onmessage = (event) => {
      if (event.data.type === 'order-created') {
        OrderMutate();
      }
    };
    return () => channel.close();
  }, [OrderMutate]);

  const openNewOrderWindow = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const url = `/dashboard/pharmacy/new-order?${searchParams.toString()}`;
    const windowName = `newOrder_${Date.now()}`;
    // Optimized popup features for a "desktop-like" experience
    const features = "width=1200,height=900,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes";
    window.open(url, windowName, features);
  };

  useEffect(() => {
    if (window.location.hash === "#newOrder") {
      openNewOrderWindow();
      // Remove hash to prevent re-opening on refresh
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <div className="flex gap-2">
      <Button 
        variant={"outline"} 
        onClick={() => { setNameToRegister(""); setOpenCreate(true); }} 
        className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
      >
        New Customer
      </Button>

      <Button
        className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        size={"sm"}
        onClick={openNewOrderWindow}
      >
        New Order
      </Button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient 
            patient={{ name: nameToRegister }} 
            onClose={(id?: string, name?: string) => {
              setOpenCreate(false);
              // After registering, we could potentially open the New Order window for this patient
              if (id) {
                const url = `/dashboard/pharmacy/new-order?id=${id}&name=${name}&mrn=`; // Simplified
                window.open(url, `newOrder_${Date.now()}`, "width=1200,height=900");
              }
              setNameToRegister("");
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
