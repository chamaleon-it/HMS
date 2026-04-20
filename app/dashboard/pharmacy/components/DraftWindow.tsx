"use client";

import React from "react";
import { X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderDraft, useOrderDrafts } from "../OrderDraftContext";
import { OrderFormContent } from "../OrderFormContent";
import { motion, useDragControls } from "framer-motion";

interface DraftWindowProps {
  draft: OrderDraft;
  index: number;
}

export function DraftWindow({ draft, index }: DraftWindowProps) {
  const { closeDraft, minimizeDraft, updateDraft, activeDraftId, setActiveDraftId } = useOrderDrafts();
  const isActive = activeDraftId === draft.id;
  const dragControls = useDragControls();

  if (draft.isMinimized) return null;

  const offset = index * 20;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onClick={() => setActiveDraftId(draft.id)}
      initial={{ x: "-50%", y: offset }}
      className={cn(
        "fixed top-20 left-1/2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden transition-shadow duration-200",
        "flex flex-col",
        isActive ? "z-[100] ring-2 ring-indigo-500/20 scale-[1.01]" : "z-[90] scale-100 grayscale-[0.2]",
      )}
      style={{
        maxHeight: "calc(100vh - 120px)",
        width: "100%",
        maxWidth: "64rem",
      }}
    >
      {/* Window Header */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={cn(
          "flex items-center justify-between px-4 py-3 cursor-move border-b select-none",
          isActive ? "bg-slate-50" : "bg-slate-100/50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
          <span className="text-sm font-semibold text-slate-700">
            {draft.data.patient ? `Order Draft: ${draft.id.slice(-4)}` : "New Order Draft"}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); minimizeDraft(draft.id); }}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeDraft(draft.id); }}
            className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-white">
        <OrderFormContent
          draftId={draft.id}
          data={draft.data}
          updateData={(data) => updateDraft(draft.id, data)}
          onSuccess={() => closeDraft(draft.id)}
          onCancel={() => closeDraft(draft.id)}
        />
      </div>
    </motion.div>
  );
}
