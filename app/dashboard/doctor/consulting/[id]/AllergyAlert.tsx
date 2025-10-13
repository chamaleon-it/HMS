import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import React, { useState } from 'react'

export default function AllergyAlert() {
    const [reviewed, setReviewed] = useState(false)
  return (
    <div
            className={
              "relative overflow-hidden rounded-2xl border shadow-lg" +
              (reviewed
                ? "border-red-200 bg-gradient-to-r from-red-50 to-white"
                : "border-red-200 bg-gradient-to-r from-red-600 to-red-500 text-white")
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
                      "text-sm " +
                      (reviewed ? "text-red-700/80" : "text-white/90")
                    }
                  >
                    Allergies: Penicillin, Ibuprofen
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!reviewed ? (
                  <Button
                    onClick={() => setReviewed(true)}
                    className="bg-white text-red-600 hover:bg-slate-50 rounded-xl"
                  >
                    Mark As Reviewed
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                    <CheckCircle2 className="h-4 w-4" /> Reviewed
                  </span>
                )}
              </div>
            </div>
          </div>
  )
}
