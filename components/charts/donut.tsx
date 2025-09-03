"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"

const data = [
  { name: "Male", value: 55, color: "#6d28d9" },
  { name: "Female", value: 45, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#94a3b8" },
]

export function Donut() {
  return (
    <div className="mx-auto h-48 w-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((e) => (
              <Cell key={e.name} fill={e.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
