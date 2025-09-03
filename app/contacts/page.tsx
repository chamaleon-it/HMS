import AppShell from "@/components/layout/app-shell"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MessageSquareMore } from "lucide-react"

const people = [
  "Johnny Ahmad",
  "Samantha William",
  "Nadila Adja",
  "Tony Soap",
  "Karen Hope",
  "Jack Gallen",
  "Jordan Nico",
  "John Doe",
  "Vega D.",
  "Col J. Lays",
  "Vergo Vergana",
  "Angelina Crispy",
].map((name) => ({ name, role: "Central Usability Officer" }))

export default function ContactsPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Contact</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((p) => (
          <Card key={p.name} className="border-violet-200/40">
            <CardHeader className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-md bg-muted">
                <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </div>
              <div className="ms-auto text-muted-foreground">•••</div>
            </CardHeader>
            <CardContent />
            <CardFooter className="flex gap-2">
              <Button variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                <Mail className="mr-2 h-4 w-4" />
                Mail
              </Button>
              <Button variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                <MessageSquareMore className="mr-2 h-4 w-4" />
                Chat
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
