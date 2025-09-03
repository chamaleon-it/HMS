"use client"

import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const data = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  a: 30 + ((i * 7) % 50),
  b: 25 + ((i * 11) % 55),
}))

export function DualLine() {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#eee" />
          <XAxis dataKey="x" />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="a" stroke="#6d28d9" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="b" stroke="#f59e0b" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
