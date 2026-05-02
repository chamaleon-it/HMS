"use client";
import React, { useState, useEffect } from "react";
import PrescriptionCard from "./PrescriptionCard";
import { DataType } from "./interface";
import PatientSelection from "./PatientSelection";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/context/auth-context";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { AlertTriangle, Eye, Printer } from "lucide-react";
import PharmacistSelection from "./PharmacistSelection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Draft, useDrafts } from "./DraftContext";

export default function NewOrderWindowContent({ draft }: { draft: Draft }) {
  const { user } = useAuth();
  const router = useRouter();
  const { updateDraft, removeDraft } = useDrafts();

  const payload = draft.payload;
  const setPayload = (updater: DataType | ((prev: DataType) => DataType)) => {
    updateDraft(draft.id, (prev: Draft) => ({
      payload: typeof updater === 'function' ? updater(prev.payload) : updater
    }));
  };

  const hasAllergy = draft.hasAllergy;
  const setHasAllergy = (val: boolean) => updateDraft(draft.id, { hasAllergy: val });

  const showAllFields = draft.showAllFields;
  const setShowAllFields = (val: boolean) => updateDraft(draft.id, { showAllFields: val });

  const patientName = draft.patientName;
  const setPatientName = (val: string) => updateDraft(draft.id, { patientName: val });

  const createOrder = async () => {
    try {
      if (!payload.patient) {
        toast.error("Please select patient");
        return;
      }

      const validItems = payload.items.filter((item: any) => item.name && item.name.trim() !== "");
      if (validItems.length === 0) {
        toast.error("Please select atleast on item");
        return;
      }

      for (const [index, item] of validItems.entries()) {
        const { quantity } = item;
        if (!quantity || quantity <= 0) {
          toast.error(`Item ${index + 1}: Quantity must be greater than 0`);
          return;
        }
      }
      const payloadToSubmit = { ...payload, items: validItems };
      const { data } = await toast.promise(api.post("/pharmacy/orders", payloadToSubmit), {
        loading: "Order is creating...",
        success: ({ data }) => data.message,
        error: ({ response }) => response.data.message,
      });

      removeDraft(draft.id);
      // We might need to refresh the order table. 
      // Since this is in a manager, we might need a broadcast or a global mutate.
      window.dispatchEvent(new CustomEvent('order-created'));

      if (data.data.billNo === "-") {
        router.push(`/dashboard/pharmacy/billing?mrn=${data.data.mrn}#new`)
      }

    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <PatientSelection
              patientName={patientName}
              autoFocus
              setValue={(id: string, allergies?: string, name?: string) => {
                setPayload((prev: any) => ({ ...prev, patient: id, allergies: allergies || undefined }));
                updateDraft(draft.id, { patientName: name || "" });
                if (allergies && allergies.trim().toLowerCase() !== "none" && allergies.trim().toLowerCase() !== "n/a" && allergies.trim() !== "") {
                  setHasAllergy(true);
                } else {
                  setHasAllergy(false);
                }
              }}
              register={(name) => {
                // For simplicity, we'll keep the registration in the window or handle it globally
                window.dispatchEvent(new CustomEvent('open-register-patient', { detail: { name, draftId: draft.id } }));
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
              <div className="flex flex-col p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-slate-200/60 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><circle cx="19" cy="11" r="2" /><path d="m19 13.5 0 .5" /><path d="m19 8.5 0 .5" /></svg>
                  </div>
                  <Label className="text-sm font-semibold text-slate-700">Pharmacist In-charge</Label>
                </div>
                <PharmacistSelection
                  hideLabel
                  setValue={(name: string) => {
                    setPayload((prev) => ({ ...prev, pharmacist: name }));
                  }}
                  pharmacistName={payload.pharmacist}
                  className="mt-auto"
                />
              </div>

              <div className={cn(
                "flex flex-col p-3.5 border transition-all duration-300 rounded-xl hover:shadow-sm",
                hasAllergy
                  ? "bg-amber-50/60 border-amber-200 shadow-sm shadow-amber-100/30"
                  : "bg-slate-50/40 border-slate-200"
              )}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      hasAllergy ? "bg-amber-100 text-amber-600" : "bg-slate-200/60 text-slate-400"
                    )}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <Label htmlFor={`allergy-toggle-${draft.id}`} className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Patient Allergy?
                    </Label>
                  </div>
                  <Switch
                    id={`allergy-toggle-${draft.id}`}
                    checked={hasAllergy}
                    onCheckedChange={setHasAllergy}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {hasAllergy ? (
                    <div className="space-y-1.5">
                      <Input
                        id={`allergy-input-${draft.id}`}
                        placeholder="Specify medical/food allergies..."
                        value={payload.allergies ?? ""}
                        onChange={(e) => setPayload((prev) => ({ ...prev, allergies: e.target.value }))}
                        className="h-9 focus:ring-amber-500/20 focus:border-amber-400 bg-white border-amber-100 placeholder:text-slate-400 text-sm"
                      />
                      <p className="text-[10px] text-amber-600 font-medium px-1">
                        Critical for medication safety
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic px-1">
                      Toggle if patient has known allergies
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 pt-7">
            <Button
              variant="outline"
              className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
              onClick={() => setShowAllFields(!showAllFields)}
            >
              {showAllFields ? "Hide optional fields" : "Display all fields"}
            </Button>
          </div>
        </div>
      </div>

      <PrescriptionCard setData={setPayload as any} data={payload} showAllFields={showAllFields} />

      <div className="flex justify-between items-center mt-4">
        <div className="">
          {payload.patient && (
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/dashboard/pharmacy/billing?id=${payload.patient}#new`)
              }}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              Direct to Billing (No Medicine)
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {
            window.dispatchEvent(new CustomEvent('request-delete-draft', { detail: draft.id }));
          }}>Cancel</Button>
          <Button
            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            onClick={createOrder}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
