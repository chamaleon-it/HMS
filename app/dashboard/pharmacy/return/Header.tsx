// import { Badge } from '@/components/ui/badge'
import React from 'react'

export default function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold leading-tight text-slate-900">
            Pharmacy Return
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process patient returns and generate credit notes
          </p>
        </div>
        {/* <Badge className="rounded-full bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
              Draft
            </Badge> */}
      </div>

      <div className="flex flex-col items-end text-right">
        <div className="text-[10px] text-slate-400">
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </header>
  )
}
