import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InvoicingPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Invoicing</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { color: "text-violet-600", label: "Sent", value: "1234" },
              { color: "text-amber-500", label: "Pending", value: "654" },
              { color: "text-orange-500", label: "Unpaid", value: "765" },
              { color: "text-sky-500", label: "Paid", value: "456" },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader>
                  <CardTitle className={`text-3xl ${s.color}`}>{s.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.label}</CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lastest Invoice</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Invoice ID</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Due Date</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3">#{123456 + i}</td>
                      <td className="px-4 py-3">21/03/2021</td>
                      <td className="px-4 py-3">$145.00</td>
                      <td className="px-4 py-3">21/04/2021</td>
                      <td className="px-4 py-3">
                        {i % 2 === 0 ? (
                          <Badge className="bg-violet-600">Paid</Badge>
                        ) : (
                          <Badge className="bg-red-500">Unpaid</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">•••</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-violet-600 via-violet-500 to-amber-400 text-white">
            <CardHeader>
              <CardTitle>My Card</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">$4811,21</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Recipient</div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select from list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tony">Tony Soap</SelectItem>
                  <SelectItem value="karen">Karen Hope</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm font-medium">Amount</div>
              <Input placeholder="Insert amount" />
              <div className="text-sm font-medium">Reference</div>
              <Input placeholder="Enter reference here" />
              <Button className="w-full bg-violet-600 hover:bg-violet-700">Confirm</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
