import { useAuth } from "@/auth/context/auth-context";
import { fAge } from "@/lib/fDateAndTime";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Phone, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import useSWR from "swr";

export default function SearchBar() {
  const { user } = useAuth()
  const [q, setQ] = useState<null | string>(null);

  const { data } = useSWR<{
    message: string;
    data: {
      address: string;
      allergies: string;
      blood: string;
      conditions: string[];
      createdAt: Date;
      createdBy: Date;
      dateOfBirth: Date;
      email: string;
      gender: string;
      mrn: string;
      name: string;
      notes: string;
      phoneNumber: string;
      status: string;
      updatedAt: Date;
      _id: string;
    }[];
  }>(q ? `/patients?query=${q}` : null);


  const generateLink = (id: string) => {
    if (user?.role === "Pharmacy") {
      return `/dashboard/pharmacy/customers/single?id=${id}`
    } else {
      return `/dashboard/doctor/patients/single?id=${id}`
    }
  }


  return (
    <div className="flex-1 max-w-2xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients or appointments…"
          value={q ?? ""}
          onChange={(e) => setQ(e.target.value)}
          data-testid="search-input"
          className="w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-24 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-[10px] text-slate-500">
          ⌘K
        </kbd>
        {Boolean(data?.data.length) && (
          <div className="absolute w-full top-12 border rounded-xl bg-white p-1.5 space-y-1.5">
            {data?.data.map((p) => (
              <Link href={generateLink(p._id)} className="block" key={p._id}>
                <PatientCard p={p} searchQuery={q ?? ""} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const hashHue = (seed?: string) => {
  if (!seed) return 210;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
  return Math.abs(h) % 360;
};

const PatientCard: React.FC<{
  p: {
    address: string;
    allergies: string;
    blood: string;
    conditions: string[];
    createdAt: Date;
    createdBy: Date;
    dateOfBirth: Date;
    email: string;
    gender: string;
    mrn: string;
    name: string;
    notes: string;
    phoneNumber: string;
    status: string;
    updatedAt: Date;
    _id: string;
  };
  searchQuery?: string;
}> = ({ p, searchQuery = "" }) => {
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
          "opacity-100"
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
              "rounded-2xl p-[2px] transition-transform duration-200",
              "group-hover:scale-[1.02]",
              "bg-zinc-100 dark:bg-zinc-800"
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
              <span className="text-sm">{p.name.charAt(0)}</span>
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
                  {fAge(p.dateOfBirth)} yrs
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
                <span className="tabular-nums"><HighlightText text={p.phoneNumber} highlight={searchQuery} /></span>
              </a>
            ) : null}
          </div>

          {/* Address */}
          {p.address ? (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="line-clamp-1"><HighlightText text={p.address} highlight={searchQuery} /></p>
            </div>
          ) : null}
        </div>

        {/* Chevron */}
        <div
          className={cn(
            "ml-1 mt-1 shrink-0 rounded-full p-1 transition-colors",
            "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200",
            "text-primary"
          )}
          aria-hidden
        >
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
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
