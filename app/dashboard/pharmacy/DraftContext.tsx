"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataType } from './interface';
import { useAuth } from '@/auth/context/auth-context';

export interface Draft {
  id: string;
  payload: DataType;
  position: { x: number; y: number };
  zIndex: number;
  isOpen: boolean;
  minimized: boolean;
  hasAllergy: boolean;
  showAllFields: boolean;
  patientName: string;
}

interface DraftContextType {
  drafts: Draft[];
  addDraft: (initialData?: Partial<DataType>, patientName?: string) => void;
  updateDraft: (id: string, updates: Partial<Draft> | ((prev: Draft) => Partial<Draft>)) => void;
  removeDraft: (id: string) => void;
  bringToFront: (id: string) => void;
  activeDraftId: string | null;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pharmacy_order_drafts');
    if (saved) {
      try {
        const parsed: Draft[] = JSON.parse(saved);
        const sanitized = parsed.map(d => {
          const isDoc = user?.role === "Doctor";
          let docId = d.payload?.doctor;
          let docName = d.payload?.doctorName === "-" ? "" : (d.payload?.doctorName || "");

          if (isDoc) {
            docId = docId || user?._id || null;
            docName = docName || user?.name || "";
          } else {
            // In pharmacy module (non-doctor user), if doctor is an ObjectId without a valid doctorName, reset to null
            if (!docName && typeof docId === "string" && /^[0-9a-fA-F]{24}$/.test(docId)) {
              docId = null;
              docName = "";
            }
          }

          return {
            ...d,
            payload: {
              ...d.payload,
              doctor: docId,
              doctorName: docName,
            }
          };
        });
        setDrafts(sanitized);
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, [user]);

  // Save to localStorage on change
  useEffect(() => {
    if (drafts.length > 0) {
      localStorage.setItem('pharmacy_order_drafts', JSON.stringify(drafts));
    } else {
      localStorage.removeItem('pharmacy_order_drafts');
    }
  }, [drafts]);

  const isNoAllergy = (a?: string) => !a || ["none", "n/a", "no", "nil"].includes(a.trim().toLowerCase());

  const addDraft = useCallback((initialData?: Partial<DataType>, patientName?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setDrafts((prev) => {
      const maxZ = Math.max(40, ...prev.map(d => d.zIndex));
      const defaultDoctorId = user?.role === "Doctor" ? user?._id : null;
      const defaultDoctorName = user?.role === "Doctor" ? user?.name : "";

      const newDraft: Draft = {
        id,
        payload: {
          patient: "",
          doctor: defaultDoctorId,
          doctorName: defaultDoctorName,
          items: [
            {
              rowId: Date.now().toString(),
              dosage: "1 tab",
              name: "",
              medicineName: "",
              duration: "",
              food: "",
              frequency: "",
              quantity: 0,
              availableQuantity: 0,
              unitPrice: 0
            },
          ],
          discount: 0,
          priority: "Normal",
          status: "Pending",
          pharmacist: "",
          allergies: "",
          ...initialData
        },
        position: { x: 100 + (prev.length % 10) * 30, y: 100 + (prev.length % 10) * 30 },
        zIndex: maxZ + 1,
        isOpen: true,
        minimized: false,
        hasAllergy: !isNoAllergy(initialData?.allergies),
        showAllFields: false,
        patientName: patientName || ""
      };
      return [...prev, newDraft];
    });
    setActiveDraftId(id);
  }, [user]);

  const updateDraft = useCallback((id: string, updates: Partial<Draft> | ((prev: Draft) => Partial<Draft>)) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...(typeof updates === 'function' ? updates(d) : updates) } : d));
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    setActiveDraftId(prev => (prev === id ? null : prev));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setActiveDraftId(id);
    setDrafts(prev => {
      const draft = prev.find(d => d.id === id);
      const maxZ = Math.max(40, ...prev.map(d => d.zIndex));
      if (draft && draft.zIndex < maxZ) {
        return prev.map(d => d.id === id ? { ...d, zIndex: maxZ + 1 } : d);
      }
      return prev;
    });
  }, []);

  return (
    <DraftContext.Provider value={{ drafts, addDraft, updateDraft, removeDraft, bringToFront, activeDraftId }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDrafts = () => {
  const context = useContext(DraftContext);
  if (!context) throw new Error("useDrafts must be used within DraftProvider");
  return context;
};
