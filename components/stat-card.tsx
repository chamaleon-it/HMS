import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

export function StatCard({
  title,
  value,
  icon,
  tone = "violet",
}: {
  title: string
  value: string | number
  icon?: ReactNode
  tone?: "violet" | "amber" | "blue"
}) {
  const color = tone === "violet" ? "text-violet-600" : tone === "amber" ? "text-amber-500" : "text-sky-500"
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
