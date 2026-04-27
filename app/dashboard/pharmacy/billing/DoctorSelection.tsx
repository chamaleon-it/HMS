import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { User2, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Doctor {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    profilePic?: string;
}

interface Props {
    value: string;
    onSelect: (name: string) => void;
}

const DoctorSelection: React.FC<Props> = ({ value, onSelect }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value || "");
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: doctorsData, isLoading } = useSWR<{ data: Doctor[] }>("/users/doctors");
    const doctors = doctorsData?.data ?? [];

    const filteredDoctors = useMemo(() => {
        if (!search) return doctors;
        return doctors.filter(d =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.email?.toLowerCase().includes(search.toLowerCase())
        );
    }, [doctors, search]);

    // Update search when external value changes (e.g. on clear)
    useEffect(() => {
        setSearch(value || "");
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (doctor: Doctor) => {
        onSelect(doctor.name);
        setSearch(doctor.name);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex(prev => (prev < filteredDoctors.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(filteredDoctors[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search or type doctor name"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onSelect(e.target.value); // Allow manual typing
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
                {search && (
                    <button
                        onClick={() => {
                            setSearch("");
                            onSelect("");
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
                        <div className="p-3 text-center text-xs text-slate-400">Loading doctors...</div>
                    ) : (
                        filteredDoctors.map((doctor, index) => (
                            <div
                                key={doctor._id}
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                onClick={() => handleSelect(doctor)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors",
                                    activeIndex === index ? "bg-indigo-50" : "hover:bg-slate-50"
                                )}
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                                    {(doctor.profilePic && false) ? (
                                        <img src={doctor.profilePic} alt={doctor.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User2 className="h-4 w-4 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium text-slate-700 truncate">{doctor.name}</span>
                                    {doctor.email && <span className="text-[10px] text-slate-400 truncate">{doctor.email}</span>}
                                </div>
                                {value === doctor.name && <Check className="ml-auto h-3 w-3 text-indigo-500" />}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorSelection;
