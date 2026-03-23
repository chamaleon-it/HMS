import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fAge } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Phone, X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";

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
  setValue: (id: string) => void;
  register: () => void;
  input?: string;
  setInput?: (val: string) => void;
}

const MIN_QUERY_LEN = 2;
const PAGE_SIZE = 5;
const DEBOUNCE_MS = 250;

const PatientSelection: React.FC<Props> = ({
  setValue,
  register,
  input: externalInput,
  setInput: setExternalInput,
}) => {
  const [internalInput, setInternalInput] = useState("");
  const input = externalInput !== undefined ? externalInput : internalInput;
  const setInput = setExternalInput || setInternalInput;

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [selected, setSelected] = useState<Patient | null>(null);

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
    debounced.length >= MIN_QUERY_LEN ? listUrl : null
  );
  const patients = data?.data ?? [];




  const handleSelect = useCallback(
    (p: Patient) => {
      setSelected(p);
      setValue(p._id);
      setInput(`${p.name}${p.mrn ? ` - (${p.mrn})` : ""}`);
      setOpen(false);
    },
    [setValue]
  );

  // Keyboard navigation within the listbox
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



  return (
    <div ref={rootRef} className="relative w-full max-w-125">
      <Label className="block">Patient Name</Label>

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
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onKeyDown={onKeyDown}
          className="w-full mt-2.5 pr-9"
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

      {/* POPUP */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg",
            "data-[hidden=true]:hidden"
          )}
          data-hidden={!open}
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
                <button
                  onClick={() => {
                    register?.()
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 font-medium"
                >
                  <span className="text-lg">➕</span> Add new Patient
                </button>
              </div>
            ) : (
              <span>Press ↑/↓ to navigate, Enter to select.</span>
            )}
          </div>

          <ScrollArea className="">
            <ul
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
        </div>
      )}
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
    return `${fAge(d)} yrs`;
  } catch {
    return "—";
  }
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

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim() || !text) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-yellow-200 text-slate-900 rounded-[1px] px-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};
