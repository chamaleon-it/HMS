"use client"

import { Bar, BarChart, ResponsiveContainer } from "recharts"

const data = Array.from({ length: 12 }).map((_, i) => ({ x: i, y: Math.round(10 + Math.random() * 20) }))

export function MiniBar() {
  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="y" fill="#e9d5ff" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
