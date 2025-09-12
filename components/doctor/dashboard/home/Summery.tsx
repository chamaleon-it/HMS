import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

export default function Summery() {
  return (
    <div className="mt-[3.75rem]">
    
        <Card className="p-4">
        <h3 className="text-lg font-semibold">Calendar</h3>
          <Calendar mode="single" selected={new Date()} />
        </Card>
    
    </div>
  );
}
