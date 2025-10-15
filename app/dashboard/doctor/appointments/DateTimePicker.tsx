import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { UseFormSetValue } from "react-hook-form";

// Helper to generate time slots
function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number
) {
  const times: string[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const current = new Date();
  current.setHours(startH, startM, 0, 0);

  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);

  while (current <= endDate) {
    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    times.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return times;
}

// Helper: combine date and time into IST Date object
function combineToIST(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);

  // Create a copy of the date
  const istDate = new Date(date);

  // Set hours and minutes in IST (UTC +5:30)
  istDate.setHours(h, m, 0, 0);

  return istDate;
}

// Convert 24h to 12h format
function to12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export default function DateTimePicker({
  setValue,
}: {
  setValue: UseFormSetValue<{
    patient: string;
    doctor: string;
    method: string;
    date: string;
    isPaid: string;
    notes?: string | undefined;
    internalNotes?: string | undefined;
    type?: string | undefined;
  }>;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const istDate = combineToIST(selectedDate, selectedTime);

      setValue("date", istDate.toISOString()); // store as UTC string
    }
  }, [selectedDate, selectedTime, setValue]);

  return (
    <div className="col-span-full ">
      <Label>Date and time</Label>
      <div className="flex gap-2.5 mt-2.5">
        <Card className="w-[45%]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </Card>
        <div className=" grid grid-cols-3 h-80 overflow-y-scroll overflow-hidden gap-1.5 w-[55%]">
          {generateTimeSlots("09:00", "18:00", 15).map((time) => (
            <motion.div
              key={time}
              whileTap={{ scale: 0.95 }}
              className="w-full"
              onClick={() => handleTimeClick(time)}
            >
              <Button
                type="button"
                className="w-full"
                size="sm"
                variant={selectedTime === time ? "default" : "outline"}
              >
                {to12h(time)}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
