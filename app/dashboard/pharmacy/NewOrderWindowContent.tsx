"use client";
import React, { useState, useEffect } from "react";
import PrescriptionCard from "./PrescriptionCard";
import { DataType } from "./interface";
import PatientSelection from "./PatientSelection";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/context/auth-context";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Eye, Printer } from "lucide-react";
import PharmacistSelection from "./PharmacistSelection";
import DoctorSelection from "./billing/DoctorSelection";
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

  const showAllFields = draft.showAllFields;
  const setShowAllFields = (val: boolean) => updateDraft(draft.id, { showAllFields: val });

  const patientName = draft.patientName;
  const createOrder = async () => {
    try {
      if (!payload.patient) {
        toast.error("Please select patient");
        return;
      }

      const validItems = payload.items.filter((item: any) => item.name && item.name.trim() !== "");
      for (const [index, item] of validItems.entries()) {
        if (!item.batchId) {
          toast.error(`Item ${index + 1}: Select a batch before saving`);
          return;
        }
        if (item.quantity > (item.availableQuantity ?? item.batchStock ?? 0)) {
          toast.error(`Item ${index + 1}: Quantity exceeds selected batch stock`);
          return;
        }
      }
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
      // Omit allergies from order payload — patient allergy stays on Patient record only.
      const { allergies: _allergies, ...orderWithoutAllergies } = payload as DataType & {
        allergies?: string;
      };
      const payloadToSubmit = { ...orderWithoutAllergies, items: validItems };
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
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <PatientSelection
            patientName={patientName}
            autoFocus
            setValue={(id: string, name?: string) => {
              setPayload((prev: any) => ({ ...prev, patient: id }));
              updateDraft(draft.id, { patientName: name || "" });
            }}
            register={(name) => {
              window.dispatchEvent(new CustomEvent('open-register-patient', { detail: { name, draftId: draft.id } }));
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5 items-stretch">
            <div className="flex flex-col gap-1.5 p-2.5 border border-slate-200 bg-slate-50/40 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-slate-200/60 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                </div>
                <Label className="text-xs font-semibold text-slate-700">Doctor</Label>
              </div>
              <DoctorSelection
                value={payload.doctorName || ""}
                onSelect={(name: string, id?: string | null) => {
                  setPayload((prev: any) => ({ ...prev, doctorName: name, doctor: id ?? null }));
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5 p-2.5 border border-slate-200 bg-slate-50/40 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-slate-200/60 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><circle cx="19" cy="11" r="2" /><path d="m19 13.5 0 .5" /><path d="m19 8.5 0 .5" /></svg>
                </div>
                <Label className="text-xs font-semibold text-slate-700">Pharmacist In-charge</Label>
              </div>
              <PharmacistSelection
                hideLabel
                setValue={(name: string) => {
                  setPayload((prev) => ({ ...prev, pharmacist: name }));
                }}
                pharmacistName={payload.pharmacist}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-6">
          <Button
            variant="outline"
            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
            onClick={() => setShowAllFields(!showAllFields)}
          >
            {showAllFields ? "Hide optional fields" : "Display all fields"}
          </Button>
        </div>
      </div>

      <PrescriptionCard setData={setPayload as any} data={payload} showAllFields={showAllFields} />

      <div className="flex justify-between items-center pt-0.5">
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
