import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import React from "react";

const STATUSES = [
  "Upcoming",
  "Consulted",
  "Observation",
  "Completed",
  "Not show",
] as const;

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(" ");

export default function Filter({
  query,
  setQuery,
  activeStatuses,
  setActiveStatuses,
}: {
  query:string;
  setQuery:React.Dispatch<React.SetStateAction<string>>;
  activeStatuses:string[];
  setActiveStatuses:React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Search by patient, doctor, or #ID"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = activeStatuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    setActiveStatuses((prev) =>
                      active ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  className={cx(
                    "px-3 h-9 rounded-full border text-sm flex items-center gap-2",
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-zinc-50 border-zinc-200"
                  )}
                >
                  <Check
                    className={cx(
                      "h-4 w-4",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
