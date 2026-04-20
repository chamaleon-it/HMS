"use client";

import React from "react";
import { useOrderDrafts } from "../OrderDraftContext";
import { DraftWindow } from "./DraftWindow";

export function WindowManager() {
  const { drafts } = useOrderDrafts();

  return (
    <div className="relative pointer-events-none w-full h-full">
      <div className="pointer-events-auto">
        {drafts.map((draft, index) => (
          <DraftWindow key={draft.id} draft={draft} index={index} />
        ))}
      </div>
    </div>
  );
}
