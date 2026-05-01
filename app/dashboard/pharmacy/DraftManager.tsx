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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  if (!isMounted) return null;

  // Only show windows on the main pharmacy dashboard page
  if (pathname !== "/dashboard/pharmacy/") return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
      {drafts.filter(draft => draft.isOpen).map((draft) => (
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
          dragConstraints={containerRef}
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
            <AlertDialogCancel 
              onClick={() => {
                if (draftToDelete) {
                  updateDraft(draftToDelete, { isOpen: false });
                }
                setDraftToDelete(null);
              }}
              
            className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
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

      {/* Kept Drafts Drawer / List */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
        {drafts.filter(d => !d.isOpen).map(draft => (
          <div 
            key={draft.id} 
            className="bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-xl p-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-2xl pointer-events-auto w-[280px]"
            onClick={() => updateDraft(draft.id, { isOpen: true, minimized: false })}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-lg border border-indigo-100 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {draft.patientName || `Draft #${draft.id.slice(-4)}`}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {draft.payload.items?.filter((i: any) => i.name)?.length || 0} items
                </span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeDraft(draft.id);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Discard Draft"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
