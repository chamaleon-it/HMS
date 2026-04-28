"use client";
import React, { useState, useEffect } from 'react';
import { useLabDrafts, LabDraft } from '@/app/dashboard/lab/LabDraftContext';
import { DraggableWindow } from '@/app/dashboard/lab/DraggableWindow';
import NewTestWindowContent from './NewTestWindowContent';
import { RegisterPatient } from './RegisterPatient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertCircle } from "lucide-react";

export const LabDraftManager: React.FC = () => {
  const { drafts, removeDraft, updateDraft, bringToFront, activeDraftId } = useLabDrafts();
  const [registerData, setRegisterData] = useState<{ name: string; draftId: string } | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleRegister = (e: any) => setRegisterData(e.detail);
    window.addEventListener('open-lab-register-patient', handleRegister);
    return () => window.removeEventListener('open-lab-register-patient', handleRegister);
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {drafts.map((draft) => (
        <DraggableWindow
          key={draft.id}
          id={draft.id}
          title={draft.patientName ? `Add Test - ${draft.patientName}` : `Add Test #${draft.id.slice(-4)}`}
          zIndex={draft.zIndex}
          position={draft.position}
          minimized={draft.minimized}
          isActive={draft.id === activeDraftId}
          onClose={() => setDraftToDelete(draft.id)}
          onMinimize={() => updateDraft(draft.id, { minimized: !draft.minimized })}
          onFocus={() => bringToFront(draft.id)}
          onPositionChange={(pos) => updateDraft(draft.id, { position: pos })}
        >
          <NewTestWindowContent draft={draft} />
        </DraggableWindow>
      ))}

      {/* Discard Draft Dialog */}
      <AlertDialog open={!!draftToDelete} onOpenChange={(val) => !val && setDraftToDelete(null)}>
        <AlertDialogContent className="pointer-events-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl">Discard Test Draft?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-[15px]">
              This will permanently delete the current test draft for{" "}
              <span className="font-bold text-slate-900">
                {drafts.find(d => d.id === draftToDelete)?.patientName || "this customer"}
              </span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Keep Draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (draftToDelete) {
                  removeDraft(draftToDelete);
                  setDraftToDelete(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Discard Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Patient Register Dialog */}
      <Dialog open={!!registerData} onOpenChange={(val) => !val && setRegisterData(null)}>
        <DialogContent className="max-w-3xl! pointer-events-auto">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          {registerData && (
            <RegisterPatient
              patient={{ name: registerData.name }}
              onClose={(id?: string, name?: string) => {
                if (id && name) {
                  updateDraft(registerData.draftId, (prev) => ({
                    payload: { ...prev.payload, patient: id },
                    patientName: name
                  }));
                }
                setRegisterData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
