import { AnimatePresence,motion } from 'framer-motion';
import { ChevronDown, Filter, RefreshCcw, Search } from 'lucide-react'
import React from 'react'
import { createPortal } from 'react-dom';

export default function Filters() {
  return (
    <div
        className={
          "rounded-2xl border border-slate-200 p-4 shadow-sm supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/70 bg-white dark:bg-slate-900"
        }
      >
        <div className="grid grid-cols-12 items-center gap-3">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                placeholder="Search invoice no. / patient name / ID"
                className={
                  "h-10 w-full rounded-lg border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900/50"
                }
              />
            </div>
          </div>
          <div className="col-span-6 md:col-span-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <PopSelect
              label="Status"
              value={"All"}
              onChange={()=>{}}
              options={[
                { label: "All", value: "All" },
                { label: "Paid", value: "Paid", tone: "success" },
                { label: "Partial", value: "Partial", tone: "warn" },
                { label: "Unpaid", value: "Unpaid", tone: "danger" },
              ]}
            />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PopSelect
              label="Method"
              value={"All"}
              onChange={()=>{}}
              options={[
                { label: "All", value: "All" },
                { label: "Cash", value: "Cash" },
                { label: "Card / UPI", value: "Card/UPI" },
                { label: "Insurance", value: "Insurance" },
                { label: "Mixed", value: "Mixed" },
              ]}
            />
          </div>
          <div className="col-span-12 md:col-span-1 flex items-center">
            <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <RefreshCcw className="mr-2 inline h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>
  )
}


function PopSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "All";
  onChange: (v: T | "All") => void;
  options: {
    label: string;
    value: T | "All";
    tone?: "default" | "success" | "warn" | "danger";
  }[];
}) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 6,
      left: r.left,
      width: Math.max(220, r.width + 160),
    });
  }, []);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!btnRef.current) return;
      const target = e.target as Node;
      if (!btnRef.current.parentElement?.contains(target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("click", onDoc);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  React.useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  const badgeTone =
    value === "Paid" || value === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === "Partial" || value === "warn"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : value === "Unpaid" || value === "danger"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-white text-slate-700 border-slate-200";

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${badgeTone} hover:bg-white`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-slate-500">{label}:</span>
        <span className="font-medium">{String(value)}</span>
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <AnimatePresence>
        {open &&
          pos &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="fixed z-[1000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              role="listbox"
            >
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={value === opt.value}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    value === opt.value ? "bg-slate-50 dark:bg-slate-800" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-slate-900">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </div>
  );
}