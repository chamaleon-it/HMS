import React from "react";
import { FileText } from "lucide-react";

interface InvoiceNotesProps {
    payload: any;
    setPayload: React.Dispatch<React.SetStateAction<any>>;
}

export const InvoiceNotes: React.FC<InvoiceNotesProps> = ({
    payload,
    setPayload,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 p-4 shadow-sm supports-backdrop-filter:bg-white/80 supports-backdrop-filter:backdrop-blur dark:border-slate-800 dark:supports-backdrop-filter:bg-slate-900/70 bg-white dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Notes
            </div>
            <textarea
                value={payload.note || ""}
                onChange={(e) =>
                    setPayload((prev: any) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Add invoice note… (optional)"
                className="h-28 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
            />
        </div>
    );
};
