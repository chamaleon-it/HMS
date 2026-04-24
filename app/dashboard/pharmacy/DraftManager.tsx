"use client";
import React, { useState, useEffect } from 'react';
import { useDrafts, Draft } from './DraftContext';
import { DraggableWindow } from './DraggableWindow';
import NewOrderWindowContent from './NewOrderWindowContent';
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

import { usePathname } from 'next/navigation';

export const DraftManager: React.FC = () => {
  const { drafts, removeDraft, updateDraft, bringToFront, activeDraftId } = useDrafts();
  const [registerData, setRegisterData] = useState<{ name: string; draftId: string } | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleRegister = (e: any) => setRegisterData(e.detail);
    window.addEventListener('open-register-patient', handleRegister);
    return () => window.removeEventListener('open-register-patient', handleRegister);
  }, []);

  // Listen for delete requests from children
  useEffect(() => {
    const handleDeleteRequest = (e: any) => setDraftToDelete(e.detail);
    window.addEventListener('request-delete-draft', handleDeleteRequest);
    return () => window.removeEventListener('request-delete-draft', handleDeleteRequest);
  }, []);

  if (typeof window === 'undefined') return null;

  // Only show windows on the main pharmacy dashboard page
  if (pathname !== "/dashboard/pharmacy/") return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {drafts.map((draft) => (
        <DraggableWindow
          key={draft.id}
          id={draft.id}
          title={draft.patientName ? `New Order - ${draft.patientName}` : `New Order #${draft.id.slice(-4)}`}
          zIndex={draft.zIndex}
          position={draft.position}
          minimized={draft.minimized}
          isActive={draft.id === activeDraftId}
          onClose={() => setDraftToDelete(draft.id)}
          onMinimize={() => updateDraft(draft.id, { minimized: !draft.minimized })}
          onFocus={() => bringToFront(draft.id)}
          onPositionChange={(pos) => updateDraft(draft.id, { position: pos })}
        >
          <NewOrderWindowContent draft={draft} />
        </DraggableWindow>
      ))}

      {/* Global Delete Confirmation Dialog */}
      <AlertDialog open={!!draftToDelete} onOpenChange={(val) => !val && setDraftToDelete(null)}>
        <AlertDialogContent className="pointer-events-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl">Discard Order Draft?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-[15px]">
              This will permanently delete the current order draft for{" "}
              <span className="font-bold text-slate-900">
                {drafts.find(d => d.id === draftToDelete)?.patientName || "this customer"}
              </span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              Keep Draft
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (draftToDelete) {
                  removeDraft(draftToDelete);
                  setDraftToDelete(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Discard Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Register Modal */}
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
                  const draft = drafts.find(d => d.id === registerData.draftId);
                  if (draft) {
                    updateDraft(registerData.draftId, {
                      payload: { ...draft.payload, patient: id },
                      patientName: name
                    });
                  }
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
