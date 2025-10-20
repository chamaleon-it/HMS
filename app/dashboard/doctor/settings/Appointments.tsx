import React, { useEffect, useMemo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { fDate, to12h } from "@/lib/fDateAndTime";
import { UpdateSettingsInput } from "@/schemas/updateSettingsSchema";
import { UseFormSetValue } from "react-hook-form";

export default function Appointments({
  setValue,
  availability,
}: {
  setValue: UseFormSetValue<UpdateSettingsInput>;
  availability?: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    days?: string[];
    rounds?: {
      label: string;
      start: string;
      end: string;
    }[];
  };
}) {
  const defaultValue = useMemo(
    () => ({
      startDate: availability?.startDate ?? (undefined as undefined | string),
      endDate: availability?.endDate ?? (undefined as undefined | string),
      startTime: availability?.startTime ?? "09:00",
      endTime: availability?.endTime ?? "17:00",
      days:
        availability?.days ?? (["Mon", "Tue", "Wed", "Thu", "Fri"] as string[]),
      rounds:
        availability?.rounds?.map((e, i) => ({ id: i + 1, ...e })) ??
        ([
          { id: 1, label: "Morning Round", start: "09:00", end: "10:00" },
          { id: 2, label: "Evening Round", start: "17:00", end: "18:00" },
        ] as { id: number; label: string; start: string; end: string }[]),
    }),
    [availability]
  );

  const [avail, setAvail] = React.useState(() => defaultValue);

  useEffect(() => {
    setAvail(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setValue("availability", avail);
  }, [avail, setValue]);

  const toggleDay = (d: string) =>
    setAvail((a) => ({
      ...a,
      days: a.days.includes(d) ? a.days.filter((x) => x !== d) : [...a.days, d],
    }));

  const addRound = () =>
    setAvail((a) => ({
      ...a,
      rounds: [
        ...a.rounds,
        {
          id: Date.now(),
          label: "Custom Round",
          start: a.startTime,
          end: a.endTime,
        },
      ],
    }));

  const updateRound = (
    id: number,
    patch: Partial<{ label: string; start: string; end: string }>
  ) =>
    setAvail((a) => ({
      ...a,
      rounds: a.rounds.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  const removeRound = (id: number) =>
    setAvail((a) => ({ ...a, rounds: a.rounds.filter((it) => it.id !== id) }));
  const hasRoundErrors = intervalsHaveErrors(avail.rounds);

  return (
    <>
      <div className="w-1/2">
        <Label className="text-[12px] text-slate-600">Date range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 w-full justify-between">
              <span className="truncate">
                {avail.startDate && avail.endDate
                  ? `${fDate(avail.startDate)} → ${fDate(avail.endDate)}`
                  : avail.startDate
                  ? `${fDate(avail.startDate)}`
                  : "Select dates"}
              </span>
              <CalendarIcon className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-auto" align="start">
            <Calendar
              fromMonth={new Date(new Date().getFullYear(), 0)}
              toMonth={new Date(new Date().getFullYear() + 10, 11)}
              mode="range"
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              captionLayout="dropdown"
              selected={{
                from: avail.startDate ? new Date(avail.startDate) : new Date(),
                to: avail.endDate ? new Date(avail.endDate) : new Date(),
              }}
              onSelect={(range) => {
                if (!range?.from) return;
                if (range.from && range.to) {
                  setAvail((prev) => ({
                    ...prev,
                    startDate: range.from?.toISOString(),
                    endDate: range.to?.toISOString(),
                  }));
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2 ">
        <span className="text-[12px] text-slate-600">Days</span>
        <div className="flex flex-wrap gap-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <label
              key={d}
              htmlFor={`day-${d}`}
              className="inline-flex items-center gap-2"
            >
              <Checkbox
                id={`day-${d}`}
                checked={avail.days.includes(d)}
                onCheckedChange={() => toggleDay(d)}
              />
              <span className="text-sm text-slate-700">{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="mb-0.5 text-[12px] text-slate-600">
            Appointments from
          </Label>
          <ComboTime
            value={avail.startTime}
            onChange={(v) => setAvail({ ...avail, startTime: v })}
          />
        </div>
        <div className="grid gap-2">
          <Label className="mb-0.5 text-[12px] text-slate-600">
            Appointments to
          </Label>
          <ComboTime
            value={avail.endTime}
            onChange={(v) => setAvail({ ...avail, endTime: v })}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-slate-600">
            Rounds (excluded from appointments)
          </span>
          <Button
            type="button"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={addRound}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
        <div className="grid gap-2">
          {avail.rounds.map((it) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
              <Input
                value={it.label}
                onChange={(e) => updateRound(it.id, { label: e.target.value })}
                className="col-span-4 h-9"
                placeholder="Label (e.g., Ward Rounds)"
              />
              <div className="col-span-6 grid grid-cols-2 gap-2">
                <ComboTime
                  value={it.start}
                  onChange={(v) => updateRound(it.id, { start: v })}
                />
                <ComboTime
                  value={it.end}
                  onChange={(v) => updateRound(it.id, { end: v })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="col-span-2 justify-self-end text-rose-600 hover:bg-rose-50"
                onClick={() => removeRound(it.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {hasRoundErrors ? (
          <p className="text-[12px] text-rose-600">
            {hasRoundErrors
              ? "Each round's end time must be after its start time. "
              : ""}
          </p>
        ) : null}

        <p className="text-[12px] text-muted-foreground">
          Appointments are available between the window above{" "}
          <span className="font-medium">minus</span> any rounds.
        </p>
      </div>
    </>
  );
}

function ComboTime({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between"
        >
          <span className="truncate">{to12h(value) || "--:--"}</span>
          <Clock className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Type or pick time…" />
          <CommandEmpty>No times</CommandEmpty>
          <CommandGroup className="h-96 overflow-scroll">
            {TIME_OPTIONS.map((t) => (
              <CommandItem
                key={t}
                value={t}
                onSelect={(v) => {
                  onChange(v);
                  setOpen(false);
                }}
              >
                {to12h(t)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

function intervalsHaveErrors(intervals: Array<{ start: string; end: string }>) {
  return (
    Array.isArray(intervals) &&
    intervals.some((it) => isTimeRangeInvalid(it.start, it.end))
  );
}

function isTimeRangeInvalid(start: string, end: string) {
  return start !== "" && end !== "" && end <= start;
}
