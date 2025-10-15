import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dispatch, SetStateAction } from "react";

export default function Summery({selectedDate,setSelectedDate}:{  selectedDate: Date | undefined,setSelectedDate: Dispatch<SetStateAction<Date | undefined>>}) {
  return (
    <div className="mt-[3.75rem]">
    
        <Card className="p-4">
        <h3 className="text-lg font-semibold">Calendar</h3>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
        </Card>
    
    </div>
  );
}
