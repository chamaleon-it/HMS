"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import useSWR from "swr";
import { User2, X, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Doctor {
  _id: string;
  name: string;
  email?: string;
}

interface Props {
  /** Called with doctor ObjectId, or "self" / undefined when cleared. */
  setValue: (id: string | undefined) => void;
  doctor?: string;
  /** Display name when doctor id is set (e.g. draft.doctorName). */
  doctorName?: string;
  onNameChange?: (name: string) => void;
  hideLabel?: boolean;
  className?: string;
}

const DoctorSelection: React.FC<Props> = ({
  setValue,
  doctor,
  doctorName,
  onNameChange,
  hideLabel,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: doctorsData, isLoading } = useSWR<{ data: Doctor[] }>(
    "/users/doctors",
  );
  const doctors = doctorsData?.data ?? [];

  // Sync display from external doctor / doctorName
  useEffect(() => {
    if (doctor === "self" || doctor === undefined || doctor === null) {
      if (doctor === "self") {
        setSearch("Self");
      } else if (!doctorName) {
        setSearch("");
      }
      return;
    }
    const found = doctors.find((d) => d._id === doctor);
    setSearch(found?.name || doctorName || "");
  }, [doctor, doctorName, doctors]);

  const filteredDoctors = useMemo(() => {
    const selfOption: Doctor = { _id: "self", name: "Self" };
    const allOptions = [selfOption, ...doctors];
    if (!search || search === "Self") return allOptions;
    const searchLower = search.toLowerCase();
    return allOptions.filter(
      (d) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.email?.toLowerCase().includes(searchLower),
    );
  }, [doctors, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (doc: Doctor) => {
    const isSelf = doc._id === "self";
    setValue(isSelf ? "self" : doc._id);
    onNameChange?.(isSelf ? "Self" : doc.name);
    setSearch(doc.name);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) =>
        prev < filteredDoctors.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredDoctors[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {!hideLabel && <Label className="block mb-1.5">Doctor Name</Label>}
      <div className="relative">
        <input
          type="text"
          placeholder="Search or type doctor name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onNameChange?.(e.target.value);
            // Typing freely clears id until a list pick
            setValue(undefined);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setValue(undefined);
              onNameChange?.("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && (filteredDoctors.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400">
              Loading doctors...
            </div>
          ) : (
            filteredDoctors.map((doc, index) => (
              <div
                key={doc._id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(doc)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors",
                  activeIndex === index ? "bg-indigo-50" : "hover:bg-slate-50",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                  <User2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {doc._id === "self" ? "Self" : `Dr. ${doc.name}`}
                  </span>
                  {doc.email && (
                    <span className="text-[10px] text-slate-400 truncate">
                      {doc.email}
                    </span>
                  )}
                </div>
                {(doctor === doc._id ||
                  (doc._id === "self" && doctor === "self")) && (
                  <Check className="ml-auto h-3 w-3 text-indigo-500" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSelection;
