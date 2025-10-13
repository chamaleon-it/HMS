import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

export default function History() {
  return (
    <div className="mt-4">
              <Card className="p-6">
                <div className="flex gap-2 mb-4 items-center">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search history..."
                  />
                </div>
                {HISTORY.map((h) => (
                  <div key={h.id} className="border rounded p-3 mb-3">
                    <div className="font-medium">
                      {h.date} — {h.diagnosis}
                    </div>
                    <div className="text-sm">{h.complaints.join(", ")}</div>
                  </div>
                ))}
              </Card>
            </div>
  )
}

const HISTORY= [
  {
    id: "C-1008",
    date: "2025-09-03",
    patientId: "P-001",
    patientName: "Ravi Kumar",
    complaints: ["Fever", "Headache"],
    diagnosis: "Viral fever",
    prescriptions: [
      {
        drug: "Paracetamol 650mg",
        dosage: "1 tab",
        freq: "1-1-1",
        duration: "5",
        notes: "After food",
      },
      {
        drug: "Pantoprazole 40mg",
        dosage: "1 tab",
        freq: "0-1-0",
        duration: "5",
        notes: "Morning",
      },
    ],
    advice: "Hydration, rest",
  },
];