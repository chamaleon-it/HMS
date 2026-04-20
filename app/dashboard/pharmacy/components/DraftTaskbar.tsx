"use client";

import React from "react";
import { useOrderDrafts } from "../OrderDraftContext";
import { cn } from "@/lib/utils";
import { LayoutGrid, FileText, ChevronUp } from "lucide-react";

export function DraftTaskbar() {
  const { drafts, restoreDraft, activeDraftId } = useOrderDrafts();

  if (drafts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-r border-white/10 mr-1">
        <LayoutGrid className="h-4 w-4 text-slate-400" />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Active Drafts</span>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto max-w-[70vw] scrollbar-hide">
        {drafts.map((draft) => (
          <button
            key={draft.id}
            onClick={() => restoreDraft(draft.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0",
              activeDraftId === draft.id && !draft.isMinimized
                ? "bg-indigo-500 text-white shadow-lg ring-1 ring-white/20"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            )}
          >
            <FileText className={cn(
              "h-3.5 w-3.5",
              activeDraftId === draft.id && !draft.isMinimized ? "text-white" : "text-slate-400"
            )} />
            <span className="text-xs font-medium truncate max-w-[120px]">
              {draft.data.patient ? `Draft: ${draft.id.slice(-4)}` : "Empty Draft"}
            </span>
            {draft.isMinimized && <ChevronUp className="h-3 w-3 text-slate-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
