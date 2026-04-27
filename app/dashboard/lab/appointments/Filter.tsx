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
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query && data?.data?.length) {
      setIsOpen(true);
      setFocusedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [query, data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !data?.data) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < data.data.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < data.data.length) {
        const selectedPatient = data.data[focusedIndex];
        router.push(`/dashboard/lab/patients/single/?id=${selectedPatient._id}`);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Card className="border-zinc-200/60 shadow-sm py-2.5!">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center w-1/2">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-60" ref={dropdownRef}>
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Search patient, doctor, or #ID..."
                  className="pl-9 h-11 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all rounded-xl relative z-10"
                />

                {isOpen && Boolean(data?.data?.length) && (
                  <div className="absolute w-full top-12 border rounded-xl bg-white p-1.5 space-y-1.5 z-50 shadow-lg max-h-[400px] overflow-y-auto">
                    {data?.data.map((p, index) => (
                      <Link 
                        href={`/dashboard/lab/patients/single/?id=${p._id}`} 
                        className={`block rounded-2xl transition-all ${focusedIndex === index ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`} 
                        key={p._id}
                        onClick={() => setIsOpen(false)}
                      >
                        <PatientCard p={p} searchQuery={query} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
