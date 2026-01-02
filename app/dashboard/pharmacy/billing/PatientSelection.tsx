import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { fAge } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Phone, X } from "lucide-react";

type Patient = {
  _id: string;
  name: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  address?: string;
  mrn?: string;
};

interface Props {
  setValue: (value: string) => void;
  value: string;
  onSelectPatient?: (patient: Patient | null) => void;
  orderPatient?: {
    _id: string;
    mrn: string;
    name: string;
  } | undefined
}

const MIN_QUERY_LEN = 2;
const PAGE_SIZE = 5;
const DEBOUNCE_MS = 250;

const PatientSelection: React.FC<Props> = ({ setValue, value, orderPatient, onSelectPatient }) => {
  const [input, setInput] = useState("");
  useEffect(() => {
    if (orderPatient) {
      setInput(orderPatient?.name + " - " + "(" + orderPatient.mrn + ")");
    }
  }, [orderPatient]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  // portal style for alignment
  const [portalStyle, setPortalStyle] = useState<
    React.CSSProperties | undefined
  >(undefined);

  // debounce
  const debounceTimer = useRef<number | null>(null);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      setDebounced(input.trim());
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [input]);

  // Build SWR key only when needed
  const listKey = useMemo(() => {
    if (debounced.length < MIN_QUERY_LEN) return null;
    const u = new URL("/patients", window.location.origin);
    u.searchParams.set("limit", String(PAGE_SIZE));
    u.searchParams.set("page", "1");
    u.searchParams.set("query", debounced.split("-")[0].trim());
    return u.pathname + u.search;
  }, [debounced]);

  const { data, isLoading } = useSWR<{ data: Patient[] }>(listKey);
  const patients = data?.data ?? [];

  const handleSelect = useCallback(
    (p: Patient) => {
      setSelected(p);
      setValue(p._id);
      if (onSelectPatient) onSelectPatient(p);
      setInput(`${p.name}${p.mrn ? ` - (${p.mrn})` : ""}`);
      setOpen(false);
      setActiveIdx(-1);
    },
    [setValue, onSelectPatient]
  );

  // Reset when external form value cleared
  useEffect(() => {
    if (!value) {
      setSelected(null);
      setInput("");
      if (onSelectPatient) onSelectPatient(null);
    }
  }, [value, onSelectPatient]);

  // Positioning: compute portal style from rootRef bounding rect
  const updatePortalPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    const rect = root.getBoundingClientRect();
    setPortalStyle({
      position: "absolute",
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.bottom + window.scrollY}px`,
      width: `${rect.width}px`,
      zIndex: 99999,
    });
  }, []);

  // recompute on open, resize, scroll
  useEffect(() => {
    if (!open) return;
    updatePortalPosition();
    const onResize = () => updatePortalPosition();
    const onScroll = () => updatePortalPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, updatePortalPosition]);

  // Close on outside click / Esc (check both rootRef and portalRef)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    const max = patients.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < max ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : max));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (patients[activeIdx]) handleSelect(patients[activeIdx]);
    }
  };

  const clearInput = () => {
    setInput("");
    setOpen(false);
    setActiveIdx(-1);
    setSelected(null);
    setValue("");
  };

  // When activeIdx changes, ensure the portal renders it highlighted —
  // also scroll list item into view if needed.
  useLayoutEffect(() => {
    if (!portalRef.current) return;
    const listbox = portalRef.current.querySelector('[role="listbox"]');
    if (!listbox) return;
    const active = listbox.querySelectorAll("[role='option']")[activeIdx];
    if (
      active &&
      typeof (active as HTMLElement).scrollIntoView === "function"
    ) {
      (active as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  return (
    <div ref={rootRef} className="relative w-full z-50">
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns="patient-listbox"
        aria-controls="patient-listbox"
        aria-label="Search and select patient"
        className="relative"
      >
        <Input
          placeholder="Search or type new"
          value={input}
          onFocus={() => {
            setOpen(true);
            // ensure portal position is updated when focusing
            setTimeout(() => updatePortalPosition(), 0);
          }}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onKeyDown={onKeyDown}
          className="w-full"
        />

        {input && (
          <button
            type="button"
            aria-label="Clear"
            onClick={clearInput}
            className="absolute right-2.5 top-[calc(50%)] -translate-y-1/2 rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Portal dropdown */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={portalRef}
            // match your existing classes; portalStyle handles absolute positioning
            className={cn(
              "rounded-md border bg-white shadow-lg",
              "data-[hidden=true]:hidden"
            )}
            data-hidden={!open}
            data-portal="patient-dropdown"
            style={portalStyle}
            // use a high z-index to be extra safe; portal avoids stacking context issues anyway
            aria-hidden={!open ? "true" : undefined}
          >
            <div className="px-2 pt-2 text-sm text-zinc-500">
              {debounced.length < MIN_QUERY_LEN ? (
                <span>Type at least {MIN_QUERY_LEN} characters to search…</span>
              ) : isLoading ? (
                <span>Loading…</span>
              ) : patients.length === 0 ? (
                <div>
                  <div className="p-3 text-gray-500 text-sm border-b">
                    No results found for “{input}”
                  </div>
                </div>
              ) : (
                <span>Press ↑/↓ to navigate, Enter to select.</span>
              )}
            </div>

            <ul
              id="patient-listbox"
              role="listbox"
              aria-label="Patients"
              className="py-1 relative max-h-72 overflow-auto"
            >
              {patients?.map((p, idx) => (
                <li
                  key={p._id}
                  role="option"
                  aria-selected={selected?._id === p._id}
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => handleSelect(p)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={cn(
                    "m-1.5 rounded-2xl border bg-white/90 cursor-pointer transition-all duration-150 hover:shadow-sm",
                    activeIdx === idx && "ring-1 ring-primary/40",
                    selected?._id === p._id &&
                    "border-primary/40 shadow-[0_0_0_3px_rgba(8,127,119,0.08)]"
                  )}
                >
                  <PatientCard
                    p={p}
                    isActive={activeIdx === idx}
                    isSelected={selected?._id === p._id}
                  />
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PatientSelection;

/* ------------------ helpers & patient card ------------------ */

const getInitials = (name?: string) => {
  if (!name) return "👤";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

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
    return `${fAge(d)} yrs`;
  } catch {
    return "—";
  }
};

const PatientCard: React.FC<{
  p: Patient;
  isActive: boolean;
  isSelected: boolean;
}> = ({ p, isActive, isSelected }) => {
  const hue = hashHue(p._id ?? p.name ?? p.mrn ?? "hue");

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-white/80 supports-[backdrop-filter]:bg-white/70 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:bg-zinc-900/70 dark:border-zinc-800"
      )}
    >
      {/* Soft highlight when active/selected */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200",
          isSelected || isActive ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            isSelected || isActive
              ? `linear-gradient(90deg, rgba(99,102,241,0.06), rgba(16,185,129,0.04))`
              : "transparent",
        }}
      />

      <div className="relative z-50 flex items-start gap-3 px-3.5 py-3">
        <div className="shrink-0">
          <div
            className={cn(
              "rounded-2xl p-[2px] transition-transform duration-200 group-hover:scale-[1.02]",
              isSelected ? "bg-primary/15" : "bg-zinc-100 dark:bg-zinc-800"
            )}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl font-semibold text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              style={{
                background: `linear-gradient(180deg, hsl(${hue} 70% 96%) 0%, hsl(${(hue + 30) % 360
                  } 70% 97%) 100%)`,
              }}
              aria-hidden
            >
              {getInitials(p.name)}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                  {p.name}
                </p>
                {p.mrn ? (
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-400">
                    ({p.mrn})
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {safeAge(p.dateOfBirth)}
                </span>
                {p.gender ? (
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                    {p.gender}
                  </span>
                ) : null}

                {p.phoneNumber ? (
                  <a
                    href={`tel:${p.phoneNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-semibold dark:border-zinc-800 dark:text-zinc-300"
                    )}
                    aria-label={`Call ${p.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{p.phoneNumber}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {p.address ? (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="line-clamp-1">{p.address}</p>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "ml-1 mt-1 shrink-0 rounded-full p-1 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200",
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
