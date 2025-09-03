import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CryptoPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Crypto</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {["BTC", "ETH", "LTC", "RPL"].map((s, i) => (
              <Card key={s}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{s} ↔ USD</span>
                    <span className={i % 2 ? "text-red-500" : "text-emerald-600"}>45,741 {i % 2 ? "▼" : "▲"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img src="/crypto-sparkline.png" alt={`${s} sparkline`} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Market Chart</CardTitle>
              <div className="text-sm text-muted-foreground">Bitcoin • 1h</div>
            </CardHeader>
            <CardContent>
              <img src="/candlestick-chart.png" alt="Candlestick chart" className="w-full" />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <img src="/dual-line-chart.png" alt="Dual line chart" className="w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Buy & Sell</CardTitle>
              </CardHeader>
              <CardContent>
                <img src="/buy-sell-form.png" alt="Buy and sell form" className="w-full" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <img src="/donut-chart-with-legend.png" alt="Summary donut" className="w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <img src="/bar-mini-chart.png" alt="Profit bar chart" className="w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Trading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Bitcoin", "Ethereum", "Litecoin", "Ripplecoin"].map((c) => (
                <div key={c} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div>
                      <div className="text-sm font-medium">{c}</div>
                      <div className="text-xs text-muted-foreground">Today, 12:30 AM</div>
                    </div>
                  </div>
                  <div className="font-medium">$13.90</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
