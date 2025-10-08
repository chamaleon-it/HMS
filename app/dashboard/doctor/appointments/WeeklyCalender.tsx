import { TabsContent } from '@/components/ui/tabs'
import React from 'react'
import { motion } from "framer-motion";


const colorMap = {
    Consultation: {
      chip: "bg-blue-100 text-blue-800",
      block: "bg-blue-100 text-blue-800",
      ring: "ring-blue-200",
      dot: "bg-blue-500",
      label: "Consultation",
    },
    "Lab Test": {
      chip: "bg-amber-100 text-amber-800",
      block: "bg-amber-100 text-amber-800",
      ring: "ring-amber-200",
      dot: "bg-amber-500",
      label: "Lab Test",
    },
    "Follow-up": {
      chip: "bg-emerald-100 text-emerald-800",
      block: "bg-emerald-100 text-emerald-800",
      ring: "ring-emerald-200",
      dot: "bg-emerald-500",
      label: "Follow-up",
    },
  } as const;



    const consultedStyles = {
    container: "opacity-60 grayscale",
    chip: "bg-gray-200 text-gray-700",
    dot: "bg-gray-400",
    badge:
      "inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200",
  } as const;


export default function WeeklyCalender() {
  return (
    <TabsContent
            value="week"
            className="bg-white rounded-xl shadow p-4 overflow-auto h-full min-h-[40rem]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">This Week</h3>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                {Object.entries(colorMap).map(([key, v]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${v.dot}`}
                    ></span>
                    <span>{v.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${consultedStyles.dot}`}
                  ></span>
                  <span>Consulted</span>
                </div>
              </div>
            </div>
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[64px_repeat(7,1fr)] text-xs text-gray-500 px-2">
                <div></div>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d, i) => (
                    <div key={i} className="text-center font-medium">
                      {d}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-[64px_repeat(7,1fr)]">
                <div className="flex flex-col">
                  {[...Array(13)].map((_, row) => (
                    <div
                      key={row}
                      className="h-14 px-2 text-[10px] text-gray-500 flex items-start justify-end pt-1 border-t"
                    >
                      {8 + row}:00
                    </div>
                  ))}
                </div>
                {[...Array(7)].map((_, col) => (
                  <div key={col} className="border-l">
                    {[...Array(13)].map((_, row) => (
                      <div key={row} className="h-14 border-t relative" />
                    ))}
                  </div>
                ))}
              </div>
          
              <div className="pointer-events-none -mt-[calc(13*3.5rem)] grid grid-cols-[64px_repeat(7,1fr)]">
                <div></div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute left-2 right-2 top-[3.5rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${consultedStyles.container} ${colorMap["Consultation"].block}`}
                  >
                    Jane Feedback
                    <br />
                    <span className="opacity-70">9:00–10:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                    className={`absolute left-2 right-2 top-[7rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Follow-up"].block}`}
                  >
                    Design System
                    <br />
                    <span className="opacity-70">11:00–12:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className={`absolute left-2 right-2 top-[5.25rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Consultation"].block}`}
                  >
                    Discuss Holo Project
                    <br />
                    <span className="opacity-70">10:00–11:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                    className={`absolute left-2 right-2 top-[7rem] h-[3.5rem] rounded-lg text-xs p-2 shadow ${colorMap["Follow-up"].block}`}
                  >
                    Daily Sync
                    <br />
                    <span className="opacity-70">11:00–12:00</span>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className={`absolute left-2 right-2 top-[3.5rem] h-[2.625rem] rounded-lg text-xs p-2 shadow ${colorMap["Lab Test"].block}`}
                  >
                    Upload Shots
                    <br />
                    <span className="opacity-70">9:30–10:00</span>
                  </motion.div>
                </div>
                <div className="relative"></div>
                <div className="relative"></div>
              </div>
            </div>
            
          </TabsContent>
  )
}
