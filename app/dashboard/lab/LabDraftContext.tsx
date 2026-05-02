"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LabDraft {
  id: string;
  payload: {
    patient: string;
    doctor?: string | null;
    lab: string;
    test: { name: string }[];
    panels: string[];
    date: Date | undefined;
    priority: "Normal" | "Urgent";
    sampleType: string;
    status: string;
    technician: string;
  };
  position: { x: number; y: number };
  zIndex: number;
  isOpen: boolean;
  minimized: boolean;
  patientName: string;
  bookingType: "Book Now" | "Schedule";
}

interface LabDraftContextType {
  drafts: LabDraft[];
  addDraft: (initialData?: Partial<LabDraft['payload']>, bookingType?: "Book Now" | "Schedule") => void;
  updateDraft: (id: string, updates: Partial<LabDraft> | ((prev: LabDraft) => Partial<LabDraft>)) => void;
  removeDraft: (id: string) => void;
  bringToFront: (id: string) => void;
  activeDraftId: string | null;
  draftToDelete: string | null;
  setDraftToDelete: (id: string | null) => void;
}

const LabDraftContext = createContext<LabDraftContextType | undefined>(undefined);

export const LabDraftProvider: React.FC<{ children: React.ReactNode; userId: string }> = ({ children, userId }) => {
  const [drafts, setDrafts] = useState<LabDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lab_test_drafts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const hydrated = parsed.map((d: any) => ({
          ...d,
          payload: {
            ...d.payload,
            date: d.payload.date ? new Date(d.payload.date) : undefined
          }
        }));
        setDrafts(hydrated);
      } catch (e) {
        console.error("Failed to parse lab drafts", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (drafts.length > 0) {
      localStorage.setItem('lab_test_drafts', JSON.stringify(drafts));
    } else {
      localStorage.removeItem('lab_test_drafts');
    }
  }, [drafts]);

  const addDraft = (initialData?: Partial<LabDraft['payload']>, bookingType: "Book Now" | "Schedule" = "Book Now") => {
    const id = Date.now().toString();
    const maxZ = Math.max(40, ...drafts.map(d => d.zIndex), 40);
    const newDraft: LabDraft = {
      id,
      payload: {
        patient: "",
        doctor: userId,
        lab: userId,
        test: [],
        panels: [],
        date: new Date(),
        priority: "Normal",
        sampleType: "Other",
        status: "Upcoming",
        technician: "",
        ...initialData
      },
      position: { x: 100 + drafts.length * 30, y: 100 + drafts.length * 30 },
      zIndex: maxZ + 1,
      isOpen: true,
      minimized: false,
      patientName: "",
      bookingType
    };
    setDrafts([...drafts, newDraft]);
    setActiveDraftId(id);
  };

  const updateDraft = (id: string, updates: Partial<LabDraft> | ((prev: LabDraft) => Partial<LabDraft>)) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...(typeof updates === 'function' ? updates(d) : updates) } : d));
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    if (activeDraftId === id) setActiveDraftId(null);
  };

  const bringToFront = (id: string) => {
    setActiveDraftId(id);
    const draft = drafts.find(d => d.id === id);
    const maxZ = Math.max(40, ...drafts.map(d => d.zIndex), 40);
    
    if (draft && draft.zIndex < maxZ) {
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, zIndex: maxZ + 1 } : d));
    }
  };

  return (
    <LabDraftContext.Provider value={{ drafts, addDraft, updateDraft, removeDraft, bringToFront, activeDraftId, draftToDelete, setDraftToDelete }}>
      {children}
    </LabDraftContext.Provider>
  );
};

export const useLabDrafts = () => {
  const context = useContext(LabDraftContext);
  if (!context) throw new Error("useLabDrafts must be used within LabDraftProvider");
  return context;
};
