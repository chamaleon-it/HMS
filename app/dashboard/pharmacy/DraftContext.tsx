"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType } from './interface';

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
  addDraft: (initialData?: Partial<DataType>) => void;
  updateDraft: (id: string, updates: Partial<Draft> | ((prev: Draft) => Partial<Draft>)) => void;
  removeDraft: (id: string) => void;
  bringToFront: (id: string) => void;
  activeDraftId: string | null;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pharmacy_order_drafts');
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (drafts.length > 0) {
      localStorage.setItem('pharmacy_order_drafts', JSON.stringify(drafts));
    } else {
      localStorage.removeItem('pharmacy_order_drafts');
    }
  }, [drafts]);

  const addDraft = (initialData?: Partial<DataType>) => {
    const id = Date.now().toString();
    const maxZ = Math.max(40, ...drafts.map(d => d.zIndex));
    const newDraft: Draft = {
      id,
      payload: {
        patient: "",
        doctor: "",
        items: [
          {
            dosage: "1 tab",
            name: "",
            duration: "",
            food: "After food",
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
      position: { x: 100 + drafts.length * 30, y: 100 + drafts.length * 30 },
      zIndex: maxZ + 1,
      isOpen: true,
      minimized: false,
      hasAllergy: false,
      showAllFields: false,
      patientName: ""
    };
    setDrafts([...drafts, newDraft]);
    setActiveDraftId(id);
  };

  const updateDraft = (id: string, updates: Partial<Draft> | ((prev: Draft) => Partial<Draft>)) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...(typeof updates === 'function' ? updates(d) : updates) } : d));
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    if (activeDraftId === id) setActiveDraftId(null);
  };

  const bringToFront = (id: string) => {
    setActiveDraftId(id);
    const draft = drafts.find(d => d.id === id);
    const maxZ = Math.max(40, ...drafts.map(d => d.zIndex));
    
    // Only update drafts array if z-index actually needs to change
    if (draft && draft.zIndex < maxZ) {
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, zIndex: maxZ + 1 } : d));
    }
  };

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
