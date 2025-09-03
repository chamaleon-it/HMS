"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"

const data = Array.from({ length: 14 }, (_, i) => ({
  m: i + 1,
  v: (Math.sin(i / 2) + 1) * 25 + (i % 3) * 6,
}))

export function SmallVerticalBars() {
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={8}>
          <XAxis dataKey="m" hide />
          <Tooltip />
          <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#6d28d9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
