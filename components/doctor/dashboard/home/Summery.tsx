import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

export default function Summery() {
  return (
    <div className="">
      <div className="rounded-2xl border shadow-sm p-5 sticky top-6 space-y-4">
        <h3 className="text-lg font-semibold">Calendar</h3>

        <Card className="p-4">
          <Calendar mode="single" selected={new Date()} />
        </Card>
      </div>
    </div>
  );
}
