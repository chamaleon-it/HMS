"use client";
import React, { useEffect, useState } from "react";
import { draftManager } from "../lib/draftManager";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActiveDrafts() {
  const [drafts, setDrafts] = useState(draftManager.getDrafts());

  useEffect(() => {
    return draftManager.subscribe((newDrafts) => {
      setDrafts(newDrafts);
    });
  }, []);

  if (drafts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-4 w-full max-w-4xl pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="pointer-events-auto flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-700/50 mr-2 shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              draftManager.bringToFront();
            }}
            className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 transition-colors mr-2"
            title="Bring all drafts to front"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase whitespace-nowrap">
            Active Drafts
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
          <AnimatePresence mode="popLayout">
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0",
                  "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-transparent hover:border-slate-600/50 cursor-pointer",
                  draft.win && !draft.win.closed && "active:bg-slate-700"
                )}
                onClick={() => {
                  if (draft.win && !draft.win.closed) {
                    draft.win.focus();
                    try {
                      draftManager.handleWindowFocus(draft.win.name);
                    } catch (e) {}
                  }
                }}
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">{draft.label}</span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (draft.win && !draft.win.closed) {
                      draft.win.close();
                    }
                    draftManager.removeDraft(draft.win);
                  }}
                  className="ml-1 p-0.5 rounded-md hover:bg-slate-600/50 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

