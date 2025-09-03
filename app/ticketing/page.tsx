import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TicketingPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Ticketing</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Ticket Solds", value: "8.900", change: "+0,5%" },
              { label: "Ticket Refund", value: "1234", change: "+0,5%" },
              { label: "Total Sold", value: "1123", change: "+0,5%" },
              { label: "Target Sold", value: "765/1000", change: "+0,5%" },
            ].map((s) => (
              <Card key={s.label} className="border-violet-200/40">
                <CardHeader>
                  <CardTitle className="text-base">{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-emerald-600">{s.change} than last month</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Lastest Transaction</CardTitle>
              <a className="text-sm text-violet-600" href="#">
                View all
              </a>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="grid grid-cols-6 items-center gap-4">
                    <div className="col-span-2">
                      <div className="font-medium">Music Event</div>
                      <div className="text-xs text-muted-foreground">12 June, 2021</div>
                    </div>
                    <div className="text-sm text-muted-foreground">samantha@email.com</div>
                    <div>
                      {i % 2 ? (
                        <Badge className="bg-emerald-500">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    <a className="text-sm text-violet-600" href="#">
                      ticket00{i + 1}.pdf
                    </a>
                    <div className="text-right font-medium">{i % 2 ? "- $ 750,00" : "- $ 60,00"}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Web Design Webinar", "Food Festival", "Tech Seminar", "Music Event"].map((t, i) => (
              <div key={t} className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">09.00 - 10.00 AM</div>
                <div className="mt-1 font-medium">{t}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Sed eligendi facere repellendus. Ipsam ipsum incidunt minima harum tenetur. Ab sit asperiores
                  architecto repudiandae.
                </div>
                <div className="mt-3">
                  <Badge className={i % 2 ? "bg-amber-500" : "bg-violet-600"}>5+</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
