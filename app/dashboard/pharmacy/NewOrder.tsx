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
import { useRouter } from "next/navigation";
import { draftManager } from "./lib/draftManager";

export default function NewOrder({ OrderMutate }: { OrderMutate: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = useState(false);
  const [nameToRegister, setNameToRegister] = useState("");
  const [patientName, setpatientName] = useState("")

  useEffect(() => {
    const channel = new BroadcastChannel('pharmacy-orders');
    channel.onmessage = (event) => {
      if (event.data.type === 'order-created') {
        OrderMutate();
      } else if (event.data.type === 'redirect-to-billing') {
        OrderMutate();
        router.push(`/dashboard/pharmacy/billing?mrn=${event.data.mrn}#new`);
      } else if (event.data.type === 'update-draft-label') {
        const drafts = draftManager.getDrafts();
        const draft = drafts.find(d => d.win.name === event.data.windowName);
        if (draft) {
          draftManager.updateLabel(draft.win, event.data.label);
        }
      } else if (event.data.type === 'draft-closed') {
        const drafts = draftManager.getDrafts();
        const draft = drafts.find(d => d.win.name === event.data.windowName);
        if (draft) {
          draftManager.removeDraft(draft.win);
        }
      } else if (event.data.type === 'window-focused') {
        draftManager.handleWindowFocus(event.data.windowName);
      }
    };



    return () => {
      channel.close();
    };
  }, [OrderMutate, router]);

  const openNewOrderWindow = () => {
    const windowName = `newOrder_${Date.now()}`;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("windowName", windowName);
    const url = `/dashboard/pharmacy/new-order?${searchParams.toString()}`;
    const features = "width=1200,height=900,left=10,top=10,scrollbars=yes,resizable=yes";
    const win = window.open(url, windowName, features);
    if (win) {
      win.addEventListener('load', () => win.moveTo(10, 10));
      draftManager.addDraft(win, "Empty Draft");
      draftManager.bringToFront(true);
    }
  };

  useEffect(() => {
    if (window.location.hash === "#newOrder") {
      openNewOrderWindow();
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
        onClick={() => {
          openNewOrderWindow();
          draftManager.bringToFront(true);
        }}
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
                const windowName = `newOrder_${Date.now()}`;
                const url = `/dashboard/pharmacy/new-order?id=${id}&name=${name}&mrn=`; // Simplified
                const win = window.open(url, windowName, "width=1200,height=900,scrollbars=yes,resizable=yes");
                if (win) {
                  draftManager.addDraft(win, name || "New Order");
                  draftManager.bringToFront();
                }
              }
              setNameToRegister("");
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
