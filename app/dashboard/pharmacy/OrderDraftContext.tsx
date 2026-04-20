"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DataType } from "./interface";
import { useAuth } from "@/auth/context/auth-context";

export interface OrderDraft {
  id: string;
  data: DataType;
  isMinimized: boolean;
  label: string;
}

interface OrderDraftContextType {
  drafts: OrderDraft[];
  addDraft: (initialData?: Partial<DataType>) => void;
  updateDraft: (id: string, data: Partial<DataType>) => void;
  closeDraft: (id: string) => void;
  minimizeDraft: (id: string) => void;
  restoreDraft: (id: string) => void;
  activeDraftId: string | null;
  setActiveDraftId: (id: string | null) => void;
}

const OrderDraftContext = createContext<OrderDraftContextType | undefined>(undefined);

const STORAGE_KEY = "pharmacy_order_drafts";

export const OrderDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDrafts(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stored drafts", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when drafts change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }
  }, [drafts, isInitialized]);

  const addDraft = useCallback((initialData?: Partial<DataType>) => {
    const id = `draft_${Date.now()}`;
    const newDraft: OrderDraft = {
      id,
      label: "New Order",
      isMinimized: false,
      data: {
        patient: "",
        doctor: user?._id ?? "",
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
      }
    };
    setDrafts(prev => [...prev, newDraft]);
    setActiveDraftId(id);
  }, [user?._id]);

  const updateDraft = useCallback((id: string, data: Partial<DataType>) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, data: { ...d.data, ...data } } : d
    ));
  }, []);

  const closeDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    if (activeDraftId === id) setActiveDraftId(null);
  }, [activeDraftId]);

  const minimizeDraft = useCallback((id: string) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, isMinimized: true } : d
    ));
    if (activeDraftId === id) setActiveDraftId(null);
  }, [activeDraftId]);

  const restoreDraft = useCallback((id: string) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, isMinimized: false } : d
    ));
    setActiveDraftId(id);
  }, []);

  return (
    <OrderDraftContext.Provider value={{
      drafts,
      addDraft,
      updateDraft,
      closeDraft,
      minimizeDraft,
      restoreDraft,
      activeDraftId,
      setActiveDraftId
    }}>
      {children}
    </OrderDraftContext.Provider>
  );
};

export const useOrderDrafts = () => {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error("useOrderDrafts must be used within an OrderDraftProvider");
  }
  return context;
};
