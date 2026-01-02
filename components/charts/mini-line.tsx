"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data = Array.from({ length: 14 })?.map((_, i) => ({ x: i, y: Math.round(20 + Math.sin(i) * 10 + i * 1.2) }))

export function MiniLine() {
  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="y" stroke="#6d28d9" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
