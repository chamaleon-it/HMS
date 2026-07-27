import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";

export default function AllergyAlert({ allergies }: { allergies: string }) {
  const [reviewed, setReviewed] = useState(false);
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border shadow-lg" +
        (reviewed
          ? "border-red-200 bg-linear-to-r from-red-50 to-white"
          : "border-red-200 bg-linear-to-r from-red-600 to-red-500 text-white")
      }
    >
      <div
        className={
          "flex items-center justify-between gap-3 p-4 " +
          (reviewed ? "text-red-700" : "")
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={
              "grid h-8 w-8 place-items-center rounded-full " +
              (reviewed ? "bg-red-100 text-red-600" : "bg-white/20")
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p
              className={
                "font-semibold text-base " +
                (reviewed ? "" : "drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]")
              }
            >
              Allergy Alert
            </p>
            <p
              className={
                "text-sm " + (reviewed ? "text-red-700/80" : "text-white/90")
              }
            >
              Allergies: {allergies}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!reviewed ? (
            <button
              type="button"
              onClick={() => setReviewed(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-red-600 bg-white hover:bg-red-50/90 active:scale-[0.98] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-white/30 backdrop-blur-xs select-none"
            >
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              <span>Mark As Reviewed</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              <CheckCircle2 className="h-4 w-4" /> Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
