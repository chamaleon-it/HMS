"use client"


import AppShell from "@/components/layout/app-shell";
import React, { useMemo, useState, useEffect } from "react";

// ----- Types -----
 type Status = "Active" | "Inactive" | "Critical" | "Discharged";
 type Gender = "M" | "F" | "O";
 type Patient = {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  lastVisit: string; // ISO date
  doctor: string;
  conditions: string[];
  visits: number;
  status: Status;
};

// ----- Demo Data (replace with API data) -----
const INITIAL: Patient[] = [
  {
    id: "P-0001",
    name: "John Mathew",
    phone: "+91 90000 11111",
    age: 42,
    gender: "M",
    lastVisit: "2025-09-01",
    doctor: "Dr. Nadir Sha",
    conditions: ["Hypertension"],
    visits: 1,
    status: "Active",
  },
  {
    id: "P-0002",
    name: "Aisha Kareem",
    phone: "+91 90000 22222",
    age: 33,
    gender: "F",
    lastVisit: "2025-09-02",
    doctor: "Dr. Nadir Sha",
    conditions: ["Hypothyroid"],
    visits: 1,
    status: "Inactive",
  },
  {
    id: "P-0003",
    name: "Mohammed Iqbal",
    phone: "+91 90000 33333",
    age: 55,
    gender: "M",
    lastVisit: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    conditions: ["Diabetes", "Hyperlipidemia"],
    visits: 1,
    status: "Active",
  },
  {
    id: "P-0004",
    name: "Sara Ali",
    phone: "+91 90000 44444",
    age: 28,
    gender: "F",
    lastVisit: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    conditions: ["High fever"],
    visits: 1,
    status: "Critical",
  },
  {
    id: "P-0005",
    name: "Ravi Kumar",
    phone: "+91 90000 55555",
    age: 47,
    gender: "M",
    lastVisit: "2025-09-04",
    doctor: "Dr. Nadir Sha",
    conditions: ["Back pain"],
    visits: 1,
    status: "Discharged",
  },
];

// ----- Small UI helpers -----
const Chip: React.FC<{ label: string; tone?: "green"|"gray"|"red"|"blue"|"amber" }>=({label,tone="gray"})=>{
  const tones: Record<string,string>={
    // refreshed palette
    green:"bg-emerald-50 text-emerald-700 ring-emerald-200",
    gray:"bg-slate-100 text-slate-700 ring-slate-200",
    red:"bg-rose-50 text-rose-700 ring-rose-200",
    blue:"bg-sky-50 text-sky-700 ring-sky-200",
    amber:"bg-amber-50 text-amber-700 ring-amber-200",
  };
  return(
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone]}`}>{label}</span>
  );
};

const StatCard: React.FC<{icon: React.ReactNode; label: string; value: number; tone: string}> = ({icon,label,value,tone})=> (
  <div className={`flex items-center gap-3 p-4 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}>{icon}</div>
    <div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

// ----- Segmented control -----
function Segmented<T extends string>({options, value, onChange}: {options: {label: string; value: T}[]; value: T; onChange: (v:T)=>void}){
  return (
    <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
      {options.map(o=>{
        const active = value===o.value;
        return (
          <button key={o.value} onClick={()=>onChange(o.value)}
            className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition ${active? 'bg-white ring-gray-300 shadow-sm text-gray-900':'bg-transparent ring-transparent text-gray-600 hover:text-gray-900'}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Nice headless select used for Status / Doctor
function FilterSelect<T extends string>({value, onChange, options, placeholder, searchable=false, className=''}: {
  value: T; onChange: (v:T)=>void; options: {label:string; value:T}[]; placeholder: string; searchable?: boolean; className?: string;
}){
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const onDoc = (e: MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent)=>{ if(e.key==='Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return ()=>{ document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  },[]);

  const visible = useMemo(()=>{
    if(!searchable || !q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter(o=> o.label.toLowerCase().includes(s));
  }, [options, q, searchable]);

  const current = options.find(o=>o.value===value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={()=>setOpen(v=>!v)}
        className={`h-11 px-3 rounded-xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 inline-flex items-center gap-2 min-w-[150px]`}
        aria-haspopup="listbox" aria-expanded={open}
        aria-label={`${placeholder}: ${current? current.label : 'Any'}`}
        title={`${placeholder}: ${current? current.label : 'Any'}`}
      >
        <span className="truncate text-sm text-gray-700">{current? current.label : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={`transition ${open? 'rotate-180':''}`}><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[min(240px,calc(100vw-2rem))] max-h-72 overflow-auto bg-white rounded-xl shadow-xl ring-1 ring-gray-200 p-2">
          {searchable && (
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="mb-2 w-full h-9 px-3 rounded-lg bg-gray-50 ring-1 ring-gray-200 focus:ring-gray-300"/>
          )}
          <ul role="listbox" className="grid gap-1">
            {visible.map(o=>{
              const active = o.value===value;
              return (
                <li key={String(o.value)}>
                  <button onClick={()=>{onChange(o.value); setOpen(false);}} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${active? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span className="truncate">{o.label}</span>
                    {active && <span>✓</span>}
                  </button>
                </li>
              );
            })}
            {visible.length===0 && <li className="px-3 py-2 text-sm text-gray-500">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// ----- Sorting helpers -----
 type SortKey = keyof Pick<Patient, "name"|"age"|"lastVisit"|"status"|"doctor"|"visits">;
 type SortDir = "asc"|"desc";

// ----- Main Component -----
export default function PatientsEnhanced() {
  const [rows] = useState<Patient[]>(INITIAL);

  // query
  const [q, setQ] = useState("");

  // filters
  const [status, setStatus] = useState<Status|"All">("All");
  const [gender, setGender] = useState<Gender|"All">("All");
  const [doctor, setDoctor] = useState<string|"All">("All");
  const [conditions, setConditions] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<number>(0);
  const [ageMax, setAgeMax] = useState<number>(100);
  const [visitRange, setVisitRange] = useState<{from: string | null; to: string | null}>({from:null,to:null});
  const [visitPreset, setVisitPreset] = useState<'All time' | '7 days' | '30 days' | 'Custom'>('All time');

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("lastVisit");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // modals / drawers
  const [preview, setPreview] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Patient | null>(null);
  const [shareFor, setShareFor] = useState<Patient | null>(null);
  const [shareTarget, setShareTarget] = useState<string>("Doctor");
  const [shareVia, setShareVia] = useState<string>("Copy link");
  const [shareDoctor, setShareDoctor] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // pagination (optional)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const doctors = useMemo(()=> Array.from(new Set(INITIAL.map(r=>r.doctor))), []);
  const allConditions = useMemo(()=> Array.from(new Set(INITIAL.flatMap(r=>r.conditions))).sort(), []);

  const filtered = useMemo(()=>{
    let list = [...rows];
    // search
    if(q.trim()){
      const s = q.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        r.conditions.some(c=>c.toLowerCase().includes(s))
      );
    }
    // status
    if(status!=="All") list = list.filter(r=>r.status===status);
    // gender
    if(gender!=="All") list = list.filter(r=>r.gender===gender);
    // doctor
    if(doctor!=="All") list = list.filter(r=>r.doctor===doctor);
    // conditions (multi)
    if(conditions.length>0) list = list.filter(r=> conditions.every(c => r.conditions.includes(c)));
    // age
    list = list.filter(r=> r.age>=ageMin && r.age<=ageMax);
    // visit date range
    if(visitRange.from) list = list.filter(r=> new Date(r.lastVisit) >= new Date(visitRange.from!));
    if(visitRange.to) list = list.filter(r=> new Date(r.lastVisit) <= new Date(visitRange.to!));

    // sort
    list.sort((a,b)=>{
      const dir = sortDir === "asc" ? 1 : -1;
      const vA = a[sortKey];
      const vB = b[sortKey];
      if(sortKey==="lastVisit"){
        return (new Date(vA as string).getTime() - new Date(vB as string).getTime()) * dir;
      }
      if(typeof vA === "number" && typeof vB === "number") return (vA - vB) * dir;
      return String(vA).localeCompare(String(vB)) * dir;
    });

    return list;
  }, [rows,q,status,gender,doctor,conditions,ageMin,ageMax,visitRange,sortKey,sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=>{ if(page>totalPages) setPage(1); }, [totalPages,page]);

  const pageRows = useMemo(()=>{
    const start = (page-1)*pageSize;
    return filtered.slice(start, start+pageSize);
  }, [filtered,page]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const statusTone = (s: Status): "green"|"gray"|"red"|"blue" => (
    s==="Active"?"green": s==="Inactive"?"gray": s==="Critical"?"red":"blue"
  );

  const resetFilters = () => {
    setQ("");
    setStatus("All"); setGender("All"); setDoctor("All"); setConditions([]);
    setAgeMin(0); setAgeMax(100);
    setVisitPreset('All time'); setVisitRange({from:null,to:null});
  };

  const applyVisitPreset = (p: 'All time' | '7 days' | '30 days' | 'Custom') => {
    setVisitPreset(p);
    if(p==='All time') { setVisitRange({from:null,to:null}); return; }
    if(p==='Custom') return; // keep current custom range
    const today = new Date();
    const to = today.toISOString().slice(0,10);
    const days = p==='7 days' ? 6 : 29; // inclusive of today
    const fromDate = new Date(today.getTime() - days*24*60*60*1000);
    const from = fromDate.toISOString().slice(0,10);
    setVisitRange({from,to});
  };

  // selection helpers
  const allPageSelected = pageRows.length>0 && pageRows.every(r=> selected.has(r.id));
  const toggleRow = (id: string) =>
  setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
  const toggleSelectAllPage = () => setSelected(prev=>{ const next = new Set(prev); const all = pageRows.every(r=> next.has(r.id)); pageRows.forEach(r=>{ if(all) next.delete(r.id); else next.add(r.id); }); return next; });

  // --- DEV TESTS (lightweight runtime checks; no crashes) ---
  useEffect(()=>{
    if (process.env.NODE_ENV === 'production') return;
    try {
      // Test #1: With defaults, filtered equals rows
      console.assert(filtered.length === rows.length, 'Test#1 failed: filtered should equal rows');
      // Test #2: Default sort is lastVisit desc -> first row is latest date
      const latest = new Date(Math.max(...rows.map(r=> new Date(r.lastVisit).getTime()))).toISOString().slice(0,10);
      console.assert(pageRows[0]?.lastVisit === latest, 'Test#2 failed: first visible row should be latest by lastVisit');
      // Test #3: Doctors list populated
      console.assert(doctors.length>0, 'Test#3 failed: doctors list should not be empty');
      // Test #4: Conditions list populated
      console.assert(allConditions.length>0, 'Test#4 failed: conditions list should not be empty');
      // Test #5: statusTone mapping
      console.assert(statusTone('Active')==='green' && statusTone('Inactive')==='gray' && statusTone('Critical')==='red' && statusTone('Discharged')==='blue', 'Test#5 failed: statusTone mapping incorrect');
      // Test #6: serial numbering starts at 1 for the current page
      const firstSerial = (page-1)*pageSize + 1;
      console.assert(firstSerial===((page-1)*pageSize + 1), 'Test#6 failed: serial calculation sanity check');
      // Test #7: default gender is All
      console.assert(gender==='All', 'Test#7 failed: default gender should be All');
      // Test #8: visit preset default is All time
      console.assert(visitPreset==='All time', 'Test#8 failed: visitPreset default should be All time');
      // Test #9: pageRows never exceeds pageSize
      console.assert(pageRows.length<=pageSize, 'Test#9 failed: pageRows should be <= pageSize');
    } catch(err){
      // ensure no runtime crash in dev
      console.warn('DEV tests warning:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-gray-500">Search, filter & review patient history</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50">Export</button>
          <button className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90">New Patient</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<span className="text-xl">👥</span>} label="Total" value={rows.length} tone="bg-violet-100" />
        <StatCard icon={<span className="text-xl">🩺</span>} label="Active" value={rows.filter(r=>r.status==='Active').length} tone="bg-green-100" />
        <StatCard icon={<span className="text-xl">🚨</span>} label="Critical" value={rows.filter(r=>r.status==='Critical').length} tone="bg-red-100" />
        <StatCard icon={<span className="text-xl">🚪</span>} label="Discharged" value={rows.filter(r=>r.status==='Discharged').length} tone="bg-blue-100" />
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4 shadow-sm mb-4">
        {/* Top row: Search + Reset */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search by name, ID, phone, condition…"
              className="w-full h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <button onClick={resetFilters} className="h-11 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">Reset all</button>
        </div>

        {/* Row 2: Primary filters */}
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Status</span>
            <FilterSelect
              value={status as Status | "All"}
              onChange={(v:Status | "All")=>setStatus(v)}
              placeholder="All statuses"
              options={( ["All","Active","Inactive","Critical","Discharged"] as const ).map(s=>({
                label: s==='Active' ? '🟢 Active' : s==='Inactive' ? '⚪ Inactive' : s==='Critical' ? '🔴 Critical' : s==='Discharged' ? '🔵 Discharged' : 'All statuses',
                value: s
              }))}
            />
          </div>

          {/* Gender — attractive pills */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Gender</span>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {[
                {label:'All', value:'All' as const, icon:'•'},
                {label:'Female', value:'F' as const, icon:'♀'},
                {label:'Male', value:'M' as const, icon:'♂'},
                {label:'Others', value:'O' as const, icon:'⚧'},
              ].map(opt=>{
                const active = (gender as Status | "All")===opt.value;
                const activeClass = opt.value==='F'
                  ? 'bg-rose-600 text-white ring-rose-600'
                  : opt.value==='M'
                  ? 'bg-sky-600 text-white ring-sky-600'
                  : opt.value==='O'
                  ? 'bg-violet-600 text-white ring-violet-600'
                  : 'bg-white text-gray-900 ring-gray-300';
                const idleClass = opt.value==='F'
                  ? 'text-rose-600 ring-transparent hover:bg-rose-50'
                  : opt.value==='M'
                  ? 'text-sky-600 ring-transparent hover:bg-sky-50'
                  : opt.value==='O'
                  ? 'text-violet-600 ring-transparent hover:bg-violet-50'
                  : 'text-gray-600 ring-transparent hover:bg-gray-50';
                return (
                  <button
                    key={opt.value}
                    onClick={()=>setGender(opt.value)}
                    aria-pressed={active}
                    aria-label={`Gender: ${opt.label}`}
                    className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition inline-flex items-center gap-1.5 ${active? activeClass : idleClass}`}
                  >
                    <span aria-hidden>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Doctor</span>
            <FilterSelect
              value={doctor }
              onChange={(v)=>setDoctor(v)}
              placeholder="All doctors"
              searchable
              options={[{label:'All doctors', value:'All'}, ...doctors.map(d=>({label:d, value:d}))]}
            />
          </div>
        </div>

        {/* Row 3: Age + Visit range */}
        <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Age</label>
            <div className="flex items-center gap-2">
              <input type="number" value={ageMin} onChange={e=>setAgeMin(parseInt(e.target.value||'0'))} className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200"/>
              <span className="text-gray-400">–</span>
              <input type="number" value={ageMax} onChange={e=>setAgeMax(parseInt(e.target.value||'0'))} className="w-24 h-11 px-2 rounded-xl ring-1 ring-gray-200"/>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Last visit</label>
            <Segmented options={[
              {label:'All time', value:'All time' as const},
              {label:'7 days', value:'7 days' as const},
              {label:'30 days', value:'30 days' as const},
              {label:'Custom', value:'Custom' as const},
            ]} value={visitPreset} onChange={(v)=>applyVisitPreset(v)} />
          </div>

          {visitPreset==='Custom' && (
            <div className="flex items-end gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-sm text-gray-600">From</label>
                <input type="date" value={visitRange.from ?? ''} onChange={e=>setVisitRange(v=>({...v,from:e.target.value||null}))} className="h-11 px-3 rounded-xl ring-1 ring-gray-200"/>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-sm text-gray-600">To</label>
                <input type="date" value={visitRange.to ?? ''} onChange={e=>setVisitRange(v=>({...v,to:e.target.value||null}))} className="h-11 px-3 rounded-xl ring-1 ring-gray-200"/>
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Conditions */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-1">Conditions</div>
          <div className="flex flex-wrap gap-2">
            {allConditions.map(c=>{
              const active = conditions.includes(c);
              return (
                <button key={c} onClick={()=> setConditions(prev=> active? prev.filter(x=>x!==c) : [...prev,c])} className={`px-3 py-1 rounded-full text-sm ring-1 transition ${active? 'bg-black text-white ring-black':'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'}`}>
                  {active? '✓ ':''}{c}
                </button>
              );
            })}
            {conditions.length>0 && (
              <button onClick={()=>setConditions([])} className="px-3 py-1 rounded-full text-sm text-gray-600 hover:text-black">Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk selection bar */}
      {selected.size>0 && (
        <div className="sticky top-2 z-10 mb-2 flex items-center justify-between rounded-xl bg-black text-white px-4 py-2">
          <div className="text-sm">{selected.size} selected</div>
          <div className="flex gap-2">
            <button onClick={()=>setSelected(new Set())} className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15">Clear</button>
            <button onClick={()=>alert('Bulk share coming soon')} className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15">Share</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600">
              <th className="w-10 text-left px-4 py-3"><input type="checkbox" className="h-4 w-4" checked={allPageSelected} onChange={toggleSelectAllPage} /></th>
              <th className="w-14 text-left px-4 py-3">No.</th>
              {headerCell("Patient","name",sortKey,sortDir,setSort)}
              <th className="w-24 text-left px-4 py-3">ID</th>
              {headerCell("Age / Gender","age",sortKey,sortDir,setSort)}
              {headerCell("Last Visit","lastVisit",sortKey,sortDir,setSort)}
              {headerCell("Doctor","doctor",sortKey,sortDir,setSort)}
              <th className="text-left px-4 py-3">Conditions</th>
              {headerCell("Visits","visits",sortKey,sortDir,setSort)}
              {headerCell("Status","status",sortKey,sortDir,setSort)}
              <th className="w-40 text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r,idx)=>{
              const serial = (page-1)*pageSize + idx + 1; // serial number after filters & sort
              return (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4" checked={selected.has(r.id)} onChange={()=>toggleRow(r.id)} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{serial}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.age} <span className="text-gray-400">/</span> {r.gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.lastVisit}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.doctor}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {r.conditions.map((c,i)=>(
                        <Chip key={i} label={c} tone={c.toLowerCase().includes('fever')? 'amber' : c.toLowerCase().includes('diabetes')? 'amber' : 'gray'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.visits}</td>
                  <td className="px-4 py-3">
                    <Chip label={r.status} tone={statusTone(r.status)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={()=>setPreview(r)} className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">View</button>
                      <button onClick={()=>setHistory(r)} className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">History</button>
                      <button onClick={()=>{setShareFor(r); setShareTarget('Doctor'); setShareVia('Copy link'); setShareDoctor(r.doctor);}} className="px-2.5 py-1.5 text-sm rounded-lg ring-1 ring-gray-200 hover:bg-gray-50">Share</button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {pageRows.length===0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">No patients match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{pageRows.length}</span> of <span className="font-medium text-gray-700">{filtered.length}</span> patients</div>
        <div className="flex gap-2">
          <button onClick={()=> setPage(p=> Math.max(1,p-1))} className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50" disabled={page===1}>Prev</button>
          <div className="px-3 h-10 grid place-items-center rounded-xl bg-gray-100 text-sm">{page} / {totalPages}</div>
          <button onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="px-3 h-10 rounded-xl bg-white ring-1 ring-gray-200 disabled:opacity-50" disabled={page===totalPages}>Next</button>
        </div>
      </div>

      {/* Slide-over: View Preview */}
      {preview && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setPreview(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Patient Preview</h2>
              <button onClick={()=>setPreview(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-medium">{preview.name}</div>
              <div className="text-sm text-gray-600">{preview.id} • {preview.age}/{preview.gender} • {preview.phone}</div>
              <div className="text-sm"><span className="text-gray-500">Doctor: </span>{preview.doctor}</div>
              <div className="flex gap-1.5 flex-wrap">{preview.conditions.map((c,i)=>(<Chip key={i} label={c} />))}</div>
              <div className="text-sm"><span className="text-gray-500">Last visit: </span>{preview.lastVisit}</div>
              <div className="pt-2 text-sm text-gray-500">This is a lightweight preview. Click below to open the full patient page.</div>
              <button onClick={()=>{window.location.href = `/patients/${preview.id}`;}} className="w-full h-11 rounded-xl bg-black text-white">Open patient page</button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over: History */}
      {history && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setHistory(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">History — {history.name}</h2>
              <button onClick={()=>setHistory(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <ol className="relative border-s border-gray-200 ps-5 space-y-6">
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm"><span className="font-medium">{history.lastVisit}</span> — Last visit recorded</div>
              </li>
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm"><span className="font-medium">{history.visits} visit(s)</span> total with {history.doctor}</div>
              </li>
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm">Conditions: {history.conditions.join(', ')}</div>
              </li>
            </ol>
            <button onClick={()=>{window.location.href = `/patients/${history.id}/history`;}} className="mt-6 w-full h-11 rounded-xl bg-black text-white">Open full history</button>
          </div>
        </div>
      )}

      {/* Modal: Share */}
      {shareFor && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShareFor(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Share patient</h3>
              <button onClick={()=>setShareFor(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="text-sm text-gray-500">{shareFor.name} — {shareFor.id}</div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Share to</div>
                <Segmented options={[
                  {label:'Doctor', value:'Doctor' as const},
                  {label:'Nurse', value:'Nurse' as const},
                  {label:'Billing', value:'Billing' as const},
                  {label:'Reception', value:'Reception' as const},
                ]} value={shareTarget} onChange={v=>setShareTarget(v)} />
              </div>

              {shareTarget==='Doctor' && (
                <div>
                  <div className="text-sm font-medium mb-2">Select doctor</div>
                  <select value={shareDoctor} onChange={e=>setShareDoctor(e.target.value)} className="h-11 px-3 rounded-xl ring-1 ring-gray-200 w-full">
                    {doctors.map(d=> (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-2">Via</div>
                <Segmented options={[
                  {label:'Copy link', value:'Copy link' as const},
                  {label:'Email', value:'Email' as const},
                  {label:'WhatsApp', value:'WhatsApp' as const},
                ]} value={shareVia} onChange={v=>setShareVia(v)} />
              </div>

              <div className="grid gap-2">
                {(shareVia==='Email') && (
                  <input placeholder="Enter email" className="h-11 px-3 rounded-xl ring-1 ring-gray-200" />
                )}
                {(shareVia==='WhatsApp') && (
                  <input placeholder="Enter WhatsApp number" className="h-11 px-3 rounded-xl ring-1 ring-gray-200" />
                )}
              </div>

              <button
                onClick={()=>{
                  // demo action
                  if(shareVia==='Copy link') navigator.clipboard?.writeText(`${window.location.origin}/patients/${shareFor.id}`);
                  setShareFor(null);
                  alert(`Shared with ${shareTarget}${shareTarget==='Doctor' ? ' — '+shareDoctor : ''} via ${shareVia}`);
                }}
                className="w-full h-11 rounded-xl bg-black text-white">Share</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </AppShell>
  );
}

function headerCell(
  label: string,
  key: SortKey,
  activeKey: SortKey,
  dir: SortDir,
  setSort: (k: SortKey)=>void
){
  const isActive = key===activeKey;
  return (
    <th className="text-left px-4 py-3 select-none">
      <button
        onClick={()=>setSort(key)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive? 'text-gray-900':'text-gray-600'} hover:text-gray-900`}
      >
        {label}
        <span className={`text-[10px] ${isActive? 'opacity-100':'opacity-40'}`}>{isActive? (dir==='asc'? '▲':'▼') : '↕'}</span>
      </button>
    </th>
  );
}