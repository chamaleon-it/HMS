import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function BankingPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Banking</h1>

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>My Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-amber-400 p-6 text-white">
                <div className="text-sm">Balance</div>
                <div className="mt-2 text-4xl font-semibold">$4811,21</div>
                <div className="mt-8 text-right tracking-widest">•••• •••• •••• 1234</div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {["Tony", "Karen", "Jordan"].map((n) => (
                  <div key={n} className="w-14">
                    <div className="h-12 w-12 rounded-md bg-muted" />
                    <div className="mt-1 text-center text-xs">{n}</div>
                  </div>
                ))}
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-violet-600 text-white">+</div>
              </div>
              <div className="text-sm font-medium">Amount</div>
              <input className="w-full rounded-md border bg-muted/40 px-3 py-2" defaultValue="$100" />
              <Button className="w-full bg-violet-600 hover:bg-violet-700">Transfer ▶</Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Profits</CardTitle>
              <div className="text-sm text-muted-foreground">Weekly ▾</div>
            </CardHeader>
            <CardContent>
              <img src="/area-chart.png" alt="Profits area chart" className="w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Lastest Transaction</CardTitle>
              <a className="text-sm text-violet-600" href="#">
                View all
              </a>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {["To Heaven Studio", "Monthly Subcribtion", "Groceries", "Icon Studio"].map((t) => (
                  <li key={t} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t}</div>
                      <div className="text-xs text-muted-foreground">12 June, 2021</div>
                    </div>
                    <div className="font-medium">- $ 650,00</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Buying House</span>
                  <span>16500 / $10000</span>
                </div>
                <Progress value={70} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Gaming Setup</span>
                  <span>16500 / $10000</span>
                </div>
                <Progress value={60} className="[&>div]:bg-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
