"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts"

const data = Array.from({ length: 6 }, (_, i) => ({
  x: i + 1,
  thisWeek: 8 + (i % 3) * 2,
  lastWeek: 5 + ((i + 1) % 4),
}))

export function MiniColumns() {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6}>
          <CartesianGrid vertical={false} stroke="#f1f1f1" />
          <XAxis dataKey="x" />
          <Tooltip />
          <Bar dataKey="thisWeek" fill="#6d28d9" radius={[6, 6, 0, 0]} />
          <Bar dataKey="lastWeek" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
