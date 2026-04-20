import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Search } from "lucide-react";
import React, { useState } from "react";
import DateFilter from "./DateFilter";
import NewTest from "@/components/dashboard/lab/Home/NewTest";
import useSWR from "swr";
import Link from "next/link";
import { PatientCard } from "@/components/layout/SearchBar";

export const STATUSES = [
  "Upcoming",
  "Consulted",
  // "Observation",
  // "Completed",
  // "Not show",
  // "Admit",
  // "Test",
  "All",
  // "Deleted"
] as const;


export default function Filter({
  query,
  setQuery,
  date,
  setDate,
  activeDate,
  setActiveDate,
  mutate,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;

  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  activeDate: "Today" | "7 days" | "30 days" | "Custom";
  setActiveDate: React.Dispatch<React.SetStateAction<"Today" | "7 days" | "30 days" | "Custom">>;
  mutate?: () => void;
}) {

  const { data } = useSWR<{
    message: string;
    data: any[];
  }>(query && query.length >= 2 ? `/patients?query=${query}` : null);


  return (
    <Card className="border-zinc-200/60 shadow-sm py-2.5!">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center w-1/2">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-60">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search patient, doctor, or #ID..."
                  className="pl-9 h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all rounded-xl relative z-10"
                />

                {Boolean(data?.data?.length) && (
                  <div className="absolute w-full top-12 border rounded-xl bg-white p-1.5 space-y-1.5 z-50 shadow-lg max-h-[400px] overflow-y-auto">
                    {data?.data.map((p) => (
                      <Link href={`/dashboard/lab/patients/single/?id=${p._id}`} className="block" key={p._id}>
                        <PatientCard p={p} searchQuery={query} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DateFilter
              activeDate={activeDate}
              setActiveDate={setActiveDate}
              date={date}
              setDate={setDate}
              isLoading={false}
            />
            <NewTest mutate={mutate} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
