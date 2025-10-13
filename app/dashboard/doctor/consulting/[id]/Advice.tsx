import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarClock } from 'lucide-react'
import React, { SetStateAction } from 'react'

export default function Advice({advice,setAdvice}:{advice: string,setAdvice: (value: SetStateAction<string>) => void}) {
  return (
    <>
     <Label className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Advice & Follow-up
                </Label>
                <Textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="mt-2"
                />
             
    </>
  )
}
