"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fAge } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Phone, X, UserPlus, Search } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegisterPatient } from "./RegisterPatient";
import { useAuth } from "@/auth/context/auth-context";

type Patient = {
  _id: string;
  name: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  address?: string;
  mrn?: string;
  allergies?: string;
};

interface Props {
  setValue: (id: string, allergies?: string, name?: string) => void;
  register: (name?: string) => void;
  patientName: string;
  autoFocus?: boolean;
  actionElement?: React.ReactNode;
  isWalkIn?: boolean;
  onToggleWalkIn?: (isWalkIn: boolean, initialCustomerName?: string) => void;
  customer?: {
    name?: string;
    age?: number;
    gender?: string;
    phoneNumber?: string;
    address?: string;
  };
  onCustomerChange?: (customer: {
    name?: string;
    age?: number;
    gender?: string;
    phoneNumber?: string;
    address?: string;
  }) => void;
}

const MIN_QUERY_LEN = 2;
const PAGE_SIZE = 100;
const DEBOUNCE_MS = 250;

const PatientSelection: React.FC<Props> = ({
  setValue,
  register,
  patientName,
  autoFocus,
  actionElement,
  isWalkIn = false,
  onToggleWalkIn,
  customer,
  onCustomerChange,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState(patientName);

  useEffect(() => {
    if (patientName && patientName !== input && !isWalkIn) {
      setInput(patientName);
    }
  }, [patientName, isWalkIn]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [openCreate, setOpenCreate] = useState(false);



  // Auto-scroll to active item
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIdx] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [activeIdx]);

  // Close on outside click
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Debounce the input
  const [debounced, setDebounced] = useState(input);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [input]);

  // Build URL only when needed
  const listUrl = useMemo(() => {
    const u = new URL("/patients", window.location.origin);
    u.searchParams.set("limit", String(PAGE_SIZE));
    u.searchParams.set("page", "1");
    if (debounced.length >= MIN_QUERY_LEN)
      u.searchParams.set("query", debounced.split("-")[0].trim());
    return u.pathname + u.search;
  }, [debounced]);

  const { data, isLoading } = useSWR<{ data: Patient[] }>(
    // Only hit API when user typed enough or when they focus & have something
    !isWalkIn && debounced.length >= MIN_QUERY_LEN ? listUrl : null
  );
  const patients = data?.data ?? [];

  const handleSelect = useCallback(
    (p: Patient) => {
      setSelected(p);
      const displayName = `${p.name}${p.mrn ? ` - (${p.mrn})` : ""}`;
      setValue(p._id, p.allergies, displayName);
      setInput(displayName);
      setOpen(false);
    },
    [setValue]
  );



  const handleProceedAsWalkIn = useCallback(
    (nameToUse?: string) => {
      const targetName = (nameToUse !== undefined ? nameToUse : input).trim();
      onToggleWalkIn?.(true, targetName);
      onCustomerChange?.({
        ...customer,
        name: targetName,
      });
      setOpen(false);
    },
    [input, customer, onToggleWalkIn, onCustomerChange]
  );

  const hasExactMatch = useMemo(() => {
    if (!input.trim()) return false;
    return patients.some(
      (p) => p.name?.trim().toLowerCase() === input.trim().toLowerCase()
    );
  }, [patients, input]);

  // Keyboard navigation within the listbox
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    const hasFallback = onToggleWalkIn && input.trim().length > 0 && !hasExactMatch;
    const totalItems = patients.length + (hasFallback ? 1 : 0);
    const max = totalItems - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < max ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : max));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < patients.length) {
        handleSelect(patients[activeIdx]);
      } else if (activeIdx === patients.length && hasFallback) {
        handleProceedAsWalkIn(input);
      } else if (patients.length === 0 && hasFallback) {
        handleProceedAsWalkIn(input);
      }
    }
  };

  const clearInput = () => {
    setInput("");
    setOpen(false);
    setActiveIdx(-1);
    setSelected(null);
    setValue("");
  };

  return (
    <div ref={rootRef} className="relative w-full">
      {/* WALK-IN CUSTOMER FORM */}
      {isWalkIn ? (
        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3 shadow-xs animate-in fade-in-50 slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
              <span className="text-xs font-semibold text-amber-900">
                Walk-In Customer Details
              </span>
              <span className="text-[10px] text-amber-700 italic bg-amber-100/80 px-2 py-0.5 rounded-md font-medium">
                All fields optional • No patient record created
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleWalkIn?.(false)}
                className="h-7.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Switch back to Registered Patient Search"
              >
                <Search className="h-3 w-3 text-slate-500" />
                <span>Search Registered Patient</span>
              </Button>
              {actionElement}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_85px_145px_1fr] gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Customer Name</Label>
              <Input
                placeholder="Name (e.g. John Doe)"
                value={customer?.name || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\b\w/g, (char) => char.toUpperCase());
                  onCustomerChange?.({ ...customer, name: val });
                }}
                className="h-9 bg-white text-sm focus:border-amber-400 focus:ring-amber-400/20"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Age</Label>
              <Input
                type="number"
                min="0"
                max="130"
                placeholder="Years"
                value={customer?.age ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : Number(e.target.value);
                  onCustomerChange?.({ ...customer, age: val });
                }}
                className="h-9 bg-white text-sm focus:border-amber-400 focus:ring-amber-400/20 text-center"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Gender</Label>
              <Select
                value={customer?.gender || "not_specified"}
                onValueChange={(val) =>
                  onCustomerChange?.({
                    ...customer,
                    gender: val === "not_specified" ? "" : val,
                  })
                }
              >
                <SelectTrigger className="w-full h-9 bg-white text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not Specified</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600">Phone Number</Label>
              <Input
                placeholder="10-digit phone"
                value={customer?.phoneNumber || ""}
                onChange={(e) =>
                  onCustomerChange?.({ ...customer, phoneNumber: e.target.value })
                }
                className="h-9 bg-white text-sm focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">Address</Label>
            <Input
              placeholder="Location / Address"
              value={customer?.address || ""}
              onChange={(e) =>
                onCustomerChange?.({ ...customer, address: e.target.value })
              }
              className="h-9 bg-white text-sm focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>
        </div>
      ) : (
        /* REGISTERED PATIENT SEARCH - SINGLE ENTRY POINT */
        <div className="flex items-center gap-2">
          <div
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-owns="patient-listbox"
            aria-controls="patient-listbox"
            aria-label="Search and select patient"
            className="relative flex-1"
          >
            <Input
              placeholder="Search registered patient or enter walk-in name..."
              value={input}
              autoFocus={autoFocus}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                const capitalizedValue = e.target.value.replace(/\b\w/g, (char) => char.toUpperCase());
                setInput(capitalizedValue);
                if (selected) {
                  setSelected(null);
                  setValue("");
                }
              }}
              onKeyDown={onKeyDown}
              className="w-full pr-9 h-9 text-sm focus:border-indigo-400"
            />
            {input && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Secondary UI Option: Small Walk-in Customer icon button next to search bar */}
          {onToggleWalkIn && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleProceedAsWalkIn(input)}
              className="border-amber-300 bg-amber-50/60 text-amber-800 hover:bg-amber-100 hover:text-amber-900 font-semibold text-xs h-9 px-2.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer"
              title="Walk-in Customer (No Reg)"
            >
              <span className="text-sm leading-none">🏃</span>
              <span className="hidden sm:inline">Walk-In</span>
              <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                No Reg
              </span>
            </Button>
          )}

          {/* Register Patient Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpenCreate(true)}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0 h-9 w-9"
            title="Register Patient in Patient Register"
          >
            <UserPlus className="h-4 w-4" />
          </Button>

          {actionElement}
        </div>
      )}

      {/* POPUP DROPDOWN */}
      {!isWalkIn && open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden",
            "data-[hidden=true]:hidden"
          )}
          data-hidden={!open}
        >
          {debounced.length < MIN_QUERY_LEN ? (
            <div className="p-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Type at least {MIN_QUERY_LEN} characters to search registered patients…</span>
              {input.trim().length > 0 && onToggleWalkIn && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleProceedAsWalkIn(input)}
                  className="text-amber-700 hover:text-amber-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>🏃</span>
                  <span>Walk-in “{input.trim()}”</span>
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="p-4 text-xs text-slate-500 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              <span>Searching registered patients for “{input}”…</span>
            </div>
          ) : patients.length === 0 ? (
            <div>
              <div className="p-3 text-slate-500 text-xs bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                <span>No registered patient found for “{input}”</span>
                <span className="text-[10px] text-slate-400">0 results</span>
              </div>

              {/* Fallback item: Proceed as Walk-in Customer with "{searchTerm}" (No Reg) */}
              {onToggleWalkIn && input.trim() && (
                <div
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleProceedAsWalkIn(input)}
                  className="flex items-center gap-3 w-full text-left px-3.5 py-3 text-amber-900 bg-amber-50/70 hover:bg-amber-100/90 font-medium text-xs border-b border-amber-200/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-200/90 text-amber-900 text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-semibold text-amber-950">
                      1. Proceed as Walk-in Customer with “{input.trim()}” (No Reg)
                    </span>
                    <span className="text-[11px] text-amber-700 font-normal">
                      Skip patient registration • Generate bill / invoice only
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                    Walk-in
                  </span>
                </div>
              )}

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  setOpenCreate(true);
                }}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-blue-600 hover:bg-blue-50/80 font-medium text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600 shrink-0">
                  <UserPlus className="h-3.5 w-3.5" />
                </div>
                <span>➕ Add new patient “{input.trim()}” to Patient Register</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-[11px] text-slate-400 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span>Press ↑/↓ to navigate, Enter to select</span>
                <span>{patients.length} {patients.length === 1 ? 'patient' : 'patients'} found</span>
              </div>

              <ScrollArea className="max-h-72">
                <ul
                  ref={listRef}
                  id="patient-listbox"
                  role="listbox"
                  aria-label="Patients"
                  className="py-1"
                >
                  {patients.map((p, idx) => (
                    <li
                      key={p._id}
                      role="option"
                      aria-selected={selected?._id === p._id}
                      onMouseDown={(e) => e.preventDefault()} // keep input focus
                      onClick={() => handleSelect(p)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={cn(
                        "m-1.5 rounded-2xl border bg-white/90 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] cursor-pointer",
                        "transition-all duration-150 hover:shadow-sm",
                        activeIdx === idx && "ring-1 ring-primary/40",
                        selected?._id === p._id &&
                        "border-primary/40 shadow-[0_0_0_3px_rgba(8,127,119,0.08)]"
                      )}
                    >
                      <PatientCard
                        p={p}
                        isActive={activeIdx === idx}
                        isSelected={selected?._id === p._id}
                        searchQuery={debounced}
                      />
                    </li>
                  ))}
                </ul>
              </ScrollArea>

              {/* Fallback item at bottom of results when there is no exact match */}
              {onToggleWalkIn && input.trim() && !hasExactMatch && (
                <div
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleProceedAsWalkIn(input)}
                  onMouseEnter={() => setActiveIdx(patients.length)}
                  className={cn(
                    "flex items-center gap-3 w-full text-left px-3.5 py-2.5 text-amber-900 bg-amber-50/70 hover:bg-amber-100/90 font-medium text-xs border-t border-amber-200/80 cursor-pointer transition-colors",
                    activeIdx === patients.length && "ring-1 ring-amber-400 bg-amber-100/90"
                  )}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-200/90 text-amber-900 text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-xs text-amber-950">
                      1. Proceed as Walk-in Customer with “{input.trim()}” (No Reg)
                    </span>
                    <span className="text-[10px] text-amber-700 font-normal">
                      Not the registered patient above? Create OTC / walk-in order
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-200/90 text-amber-900 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    No Reg
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE PATIENT DIALOG */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-3xl!">
          <DialogHeader>
            <DialogTitle>Customer Register</DialogTitle>
          </DialogHeader>
          <RegisterPatient
            patient={{ name: input }}
            onClose={async (id?: string, name?: string, allergies?: string, mrn?: string) => {
              setOpenCreate(false);
              if (id && name) {
                // To display instantly:
                handleSelect({ _id: id, name, allergies: allergies || "", mrn: mrn || "" });
                // Attempt to fetch full data (with mrn, age, etc.)
                try {
                  const { data } = await api.get(`/patients/${id}`);
                  if (data && data.data) {
                    handleSelect(data.data);
                  }
                } catch (error) {
                  console.error("Failed to fetch full patient details", error);
                }
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientSelection;

/* ---------- Card + utils ---------- */

const getInitials = (name?: string) => {
  if (!name) return "👤";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

// Better-distributed stable hue
const hashHue = (seed?: string) => {
  if (!seed) return 210;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
  return Math.abs(h) % 360;
};

const safeAge = (dob?: string | Date) => {
  if (!dob) return "—";
  try {
    const d = typeof dob === "string" ? new Date(dob) : dob;
    if (Number.isNaN(d.getTime())) return "—";
    return `${fAge(d).formatted}`;
  } catch {
    return "—";
  }
};

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-[1px] px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const PatientCard: React.FC<{
  p: Patient;
  isActive: boolean;
  isSelected: boolean;
  searchQuery?: string;
}> = ({ p, isActive, isSelected, searchQuery = "" }) => {
  const hue = hashHue(p._id ?? p.name ?? p.mrn ?? "hue");
  const ringGradient = `bg-[conic-gradient(from_180deg,oklch(0.92_0.04_${hue})_0%,oklch(0.94_0.05_${(hue + 40) % 360
    })_50%,oklch(0.92_0.04_${(hue + 80) % 360})_100%)]`;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/70",
        "transition-all duration-200 hover:-translate-y-px hover:shadow-md",
        "dark:bg-zinc-900/70 dark:border-zinc-800"
      )}
    >
      {/* Selection glow ring */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200",
          ringGradient,
          (isSelected || isActive) && "opacity-100"
        )}
        aria-hidden
        style={{
          maskImage: "radial-gradient(transparent 38%, black 50%)",
          WebkitMaskImage: "radial-gradient(transparent 38%, black 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3 px-3.5 py-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className={cn(
              "rounded-2xl p-0.5 transition-transform duration-200",
              "group-hover:scale-[1.02]",
              isSelected ? "bg-primary/15" : "bg-zinc-100 dark:bg-zinc-800"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl font-semibold",
                "text-zinc-800 dark:text-zinc-200",
                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              )}
              style={{
                background: `linear-gradient(180deg, oklch(0.98 0 ${hue}) 0%, oklch(0.97 0 ${(hue + 30) % 360
                  }) 100%)`,
              }}
              aria-hidden
            >
              <span className="text-sm">{getInitials(p.name)}</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                  <HighlightText text={p.name} highlight={searchQuery} />
                </p>
                {p.mrn ? (
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-400">
                    (<HighlightText text={p.mrn} highlight={searchQuery} />)
                  </span>
                ) : null}
              </div>

              {/* Meta pills */}
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {safeAge(p.dateOfBirth)}
                </span>

                {/* Gender */}
                {p.gender ? (
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                    {p.gender}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Phone pill */}
            {p.phoneNumber ? (
              <a
                href={`tel:${p.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors",
                  "border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900 font-semibold",
                  "dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                )}
                aria-label={`Call ${p.name}`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="tabular-nums">
                  <HighlightText text={p.phoneNumber} highlight={searchQuery} />
                </span>
              </a>
            ) : null}
          </div>

          {/* Address */}
          {p.address ? (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="line-clamp-1">
                <HighlightText text={p.address} highlight={searchQuery} />
              </p>
            </div>
          ) : null}
        </div>

        {/* Chevron */}
        <div
          className={cn(
            "ml-1 mt-1 shrink-0 rounded-full p-1 transition-colors",
            "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200",
            (isSelected || isActive) && "text-primary"
          )}
          aria-hidden
        >
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
