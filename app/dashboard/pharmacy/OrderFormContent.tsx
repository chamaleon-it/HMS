"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AlertTriangle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import PatientSelection from "./PatientSelection";
import PharmacistSelection from "./PharmacistSelection";
import PrescriptionCard from "./PrescriptionCard";
import { RegisterPatient } from "./RegisterPatient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

interface OrderFormContentProps {
  draftId: string;
  data: DataType;
  updateData: (data: Partial<DataType>) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrderFormContent({ 
  draftId, 
  data, 
  updateData, 
  onSuccess, 
  onCancel 
}: OrderFormContentProps) {
  const router = useRouter();
  const [showAllFields, setShowAllFields] = useState(false);
  const [hasAllergy, setHasAllergy] = useState(!!data.allergies);
  const [openRegister, setOpenRegister] = useState(false);
  const [nameToRegister, setNameToRegister] = useState("");
  const [patientName, setPatientName] = useState("");

  const placeOrder = async () => {
    try {
      if (!data.patient) {
        toast.error("Please select patient");
        return;
      }

      const validItems = data.items.filter((item) => item.name && item.name.trim() !== "");

      if (validItems.length === 0) {
        toast.error("Please select at least one item");
        return;
      }

      for (const [index, item] of validItems.entries()) {
        if (!item.quantity || item.quantity <= 0) {
          toast.error(`Item ${index + 1}: Quantity must be greater than 0`);
          return;
        }
      }

      const payloadToSubmit = { ...data, items: validItems };
      const { data: responseData } = await toast.promise(api.post("/pharmacy/orders", payloadToSubmit), {
        loading: "Order is creating...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });

      onSuccess();
      if (responseData.data.billNo === "-") {
        router.push(`/dashboard/pharmacy/billing?mrn=${responseData.data.mrn}#new`)
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <PatientSelection
            patientName={patientName}
            setValue={(id: string, allergies?: string) => {
              updateData({ patient: id, allergies: allergies || undefined });
              if (allergies && allergies.trim().toLowerCase() !== "none" && allergies.trim().toLowerCase() !== "n/a" && allergies.trim() !== "") {
                setHasAllergy(true);
              } else {
                setHasAllergy(false);
              }
            }}
            register={(name) => {
              setNameToRegister(name || "");
              setOpenRegister(true);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
            <div className="flex flex-col p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-slate-200/60 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><circle cx="19" cy="11" r="2" /><path d="m19 13.5 0 .5" /><path d="m19 8.5 0 .5" /></svg>
                </div>
                <Label className="text-sm font-semibold text-slate-700">Pharmacist In-charge</Label>
              </div>
              <PharmacistSelection
                hideLabel
                setValue={(name: string) => updateData({ pharmacist: name })}
                pharmacistName={data.pharmacist}
                className="mt-auto"
              />
            </div>

            <div className={cn(
              "flex flex-col p-3.5 border transition-all duration-300 rounded-xl",
              hasAllergy ? "bg-amber-50/60 border-amber-200" : "bg-slate-50/40 border-slate-200"
            )}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    hasAllergy ? "bg-amber-100 text-amber-600" : "bg-slate-200/60 text-slate-400"
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <Label className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Patient Allergy?
                  </Label>
                </div>
                <Switch
                  checked={hasAllergy}
                  onCheckedChange={setHasAllergy}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>

              {hasAllergy && (
                <div className="space-y-1.5">
                  <Input
                    placeholder="Specify allergies..."
                    value={data.allergies ?? ""}
                    onChange={(e) => updateData({ allergies: e.target.value })}
                    className="h-9 focus:ring-amber-500/20 focus:border-amber-400 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-7">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllFields(!showAllFields)}
          >
            {showAllFields ? "Hide optional" : "Display all"}
          </Button>
        </div>
      </div>

      <PrescriptionCard 
        setData={(fn: any) => {
            const newData = typeof fn === 'function' ? fn(data) : fn;
            updateData(newData);
        }} 
        data={data} 
        showAllFields={showAllFields} 
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={placeOrder}
        >
          Place Order
        </Button>
      </div>

      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient 
            patient={{ name: nameToRegister }} 
            onClose={(id?: string, name?: string) => {
              setOpenRegister(false);
              updateData({ patient: id ?? "" });
              setPatientName(name ?? "");
              setNameToRegister("");
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
