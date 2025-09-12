"use client"


import React, { useMemo, useState, useEffect } from "react";

// ----- Types -----
 type Gender = "M" | "F" | "O";
 type LabStatus = "Pending" | "In Progress" | "Completed" | "Flagged";
 type SampleType = "Blood" | "Urine" | "Other";
 type FacilityType = "Lab" | "Imaging";
 type LabResult = {
  id: string; // LR-XXXX
  patientId: string;
  patientName: string;
  age: number;
  gender: Gender;
  testName: string;
  sampleType: SampleType;
  collectedAt: string; // ISO date
  reportedAt: string | null; // ISO date or null if not reported
  doctor: string;
  value: string; // e.g. "6.8"
  units: string; // e.g. "mmol/L"
  reference: string; // e.g. "3.9 – 7.8"
  status: LabStatus;
  abnormal: boolean;
  facility: FacilityType; // Lab vs Imaging
  center: string; // Which lab/center performed
 };

// ----- Demo Data (replace with API data) -----
const INITIAL_RESULTS: LabResult[] = [
  {
    id: "LR-0001",
    patientId: "P-0003",
    patientName: "Mohammed Iqbal",
    age: 55,
    gender: "M",
    testName: "Fasting Blood Glucose",
    sampleType: "Blood",
    collectedAt: "2025-09-02",
    reportedAt: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    value: "128",
    units: "mg/dL",
    reference: "70 – 100",
    status: "Flagged",
    abnormal: true,
    facility: "Lab",
    center: "Central Lab",
  },
  {
    id: "LR-0002",
    patientId: "P-0001",
    patientName: "John Mathew",
    age: 42,
    gender: "M",
    testName: "Complete Blood Count",
    sampleType: "Blood",
    collectedAt: "2025-09-03",
    reportedAt: "2025-09-03",
    doctor: "Dr. Nadir Sha",
    value: "Normal",
    units: "",
    reference: "",
    status: "Completed",
    abnormal: false,
    facility: "Lab",
    center: "Central Lab",
  },
  {
    id: "LR-0003",
    patientId: "P-0004",
    patientName: "Sara Ali",
    age: 28,
    gender: "F",
    testName: "Urine Routine",
    sampleType: "Urine",
    collectedAt: "2025-09-04",
    reportedAt: null,
    doctor: "Dr. Nadir Sha",
    value: "—",
    units: "",
    reference: "",
    status: "In Progress",
    abnormal: false,
    facility: "Lab",
    center: "Apollo Diagnostics",
  },
  {
    id: "LR-0004",
    patientId: "P-0002",
    patientName: "Aisha Kareem",
    age: 33,
    gender: "F",
    testName: "TSH",
    sampleType: "Blood",
    collectedAt: "2025-09-01",
    reportedAt: "2025-09-02",
    doctor: "Dr. Nadir Sha",
    value: "5.6",
    units: "µIU/mL",
    reference: "0.4 – 4.0",
    status: "Flagged",
    abnormal: true,
    facility: "Lab",
    center: "Apollo Diagnostics",
  },
  {
    id: "LR-0005",
    patientId: "P-0005",
    patientName: "Ravi Kumar",
    age: 47,
    gender: "M",
    testName: "CRP",
    sampleType: "Blood",
    collectedAt: "2025-09-04",
    reportedAt: null,
    doctor: "Dr. Nadir Sha",
    value: "—",
    units: "mg/L",
    reference: "< 3",
    status: "Pending",
    abnormal: false,
    facility: "Lab",
    center: "Central Lab",
  },
  // Imaging example
  {
    id: "LR-0006",
    patientId: "P-0006",
    patientName: "Deepa Menon",
    age: 38,
    gender: "F",
    testName: "Chest X‑Ray",
    sampleType: "Other",
    collectedAt: "2025-09-05",
    reportedAt: "2025-09-05",
    doctor: "Dr. Nadir Sha",
    value: "No acute findings",
    units: "",
    reference: "",
    status: "Completed",
    abnormal: false,
    facility: "Imaging",
    center: "Radiology Suite A",
  },
];

// ----- Small UI helpers -----
const Chip: React.FC<{ label: string; tone?: "green"|"gray"|"red"|"blue"|"amber" }>=({label,tone="gray"})=>{
  const tones: Record<string,string>={
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

// Nice headless select used for Status / Doctor / Test / Center
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
 type SortKey = keyof Pick<LabResult, "patientName"|"testName"|"sampleType"|"facility"|"center"|"collectedAt"|"reportedAt"|"doctor"|"status">;
 type SortDir = "asc"|"desc";

// ----- Main Component -----
export default function LabResultsPage() {
  const [rows] = useState<LabResult[]>(INITIAL_RESULTS);

  // query
  const [q, setQ] = useState("");

  // filters
  const [status, setStatus] = useState<LabStatus|"All">("All");
  const [doctor, setDoctor] = useState<string|"All">("All");
  const [sample, setSample] = useState<SampleType|"All">("All");
  const [facility, setFacility] = useState<FacilityType|"All">("All");
  const [center, setCenter] = useState<string|"All">("All");
  const [dateField, setDateField] = useState<'Reported'|'Collected'>('Reported');
  const [datePreset, setDatePreset] = useState<'All time' | '7 days' | '30 days' | 'Custom'>('All time');
  const [dateRange, setDateRange] = useState<{from: string | null; to: string | null}>({from:null,to:null});

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("reportedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // modals / drawers
  const [preview, setPreview] = useState<LabResult | null>(null);
  const [history, setHistory] = useState<LabResult | null>(null);
  const [shareFor, setShareFor] = useState<LabResult | null>(null);
  const [shareTarget, setShareTarget] = useState<string>("Doctor");
  const [shareVia, setShareVia] = useState<string>("Copy link");
  const [shareDoctor, setShareDoctor] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const doctors = useMemo(()=> Array.from(new Set(rows.map(r=>r.doctor))), [rows]);
  const tests = useMemo(()=> Array.from(new Set(rows.map(r=>r.testName))).sort(), [rows]);
  const centers = useMemo(()=> Array.from(new Set(rows.map(r=>r.center))).sort(), [rows]);

  const statusTone = (s: LabStatus): "green"|"gray"|"red"|"blue"|"amber" => (
    s==="Completed"?"green": s==="Pending"?"gray": s==="In Progress"?"amber":"red"
  );

  const resetFilters = () => {
    setQ(""); setStatus("All"); setDoctor("All"); setSample("All");
    setFacility("All"); setCenter("All");
    setDateField('Reported'); setDatePreset('All time'); setDateRange({from:null,to:null});
  };

  const applyDatePreset = (p: 'All time' | '7 days' | '30 days' | 'Custom') => {
    setDatePreset(p);
    if(p==='All time') { setDateRange({from:null,to:null}); return; }
    if(p==='Custom') return;
    const today = new Date();
    const to = today.toISOString().slice(0,10);
    const days = p==='7 days' ? 6 : 29;
    const fromDate = new Date(today.getTime() - days*24*60*60*1000);
    const from = fromDate.toISOString().slice(0,10);
    setDateRange({from,to});
  };

  const filtered = useMemo(()=>{
    let list = [...rows];
    if(q.trim()){
      const s = q.toLowerCase();
      list = list.filter(r =>
        r.patientName.toLowerCase().includes(s) ||
        r.patientId.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s) ||
        r.testName.toLowerCase().includes(s) ||
        r.center.toLowerCase().includes(s)
      );
    }
    if(status!=="All") list = list.filter(r=>r.status===status);
    if(doctor!=="All") list = list.filter(r=>r.doctor===doctor);
    if(sample!=="All") list = list.filter(r=>r.sampleType===sample);
    if(facility!=="All") list = list.filter(r=>r.facility===facility);
    if(center!=="All") list = list.filter(r=>r.center===center);

    if(dateRange.from){
      list = list.filter(r=> new Date((dateField==='Reported'? (r.reportedAt ?? r.collectedAt) : r.collectedAt)) >= new Date(dateRange.from!));
    }
    if(dateRange.to){
      list = list.filter(r=> new Date((dateField==='Reported'? (r.reportedAt ?? r.collectedAt) : r.collectedAt)) <= new Date(dateRange.to!));
    }

    list.sort((a,b)=>{
      const dir = sortDir === "asc" ? 1 : -1;
      const vA = a[sortKey];
      const vB = b[sortKey];
      if(sortKey==="reportedAt" || sortKey==="collectedAt"){
        const da = new Date((vA as string) || 0).getTime();
        const db = new Date((vB as string) || 0).getTime();
        return (da - db) * dir;
      }
      return String(vA ?? '').localeCompare(String(vB ?? '')) * dir;
    });

    return list;
  }, [rows,q,status,doctor,sample,facility,center,dateField,dateRange,sortKey,sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(()=>{ if(page>totalPages) setPage(1); }, [totalPages]);

  const pageRows = useMemo(()=>{
    const start = (page-1)*pageSize;
    return filtered.slice(start, start+pageSize);
  }, [filtered,page]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
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
      // Test #1: defaults
      console.assert(datePreset==='All time', 'Test#1: datePreset default');
      console.assert(sortKey==='reportedAt' && sortDir==='desc', 'Test#1b: default sort');
      // Test #2: doctors, tests & centers populated
      console.assert(doctors.length>0 && tests.length>0 && centers.length>0, 'Test#2: doctors/tests/centers populated');
      // Test #3: pageRows <= pageSize
      console.assert(pageRows.length<=10, 'Test#3: pagination size');
      // Test #4: statusTone mapping
      console.assert(statusTone('Completed')==='green' && statusTone('Pending')==='gray' && statusTone('In Progress')==='amber' && statusTone('Flagged')==='red', 'Test#4: status tones');
      // Test #5: facility default All
      console.assert(facility==='All' && center==='All', 'Test#5: facility/center defaults');
    } catch(err){ console.warn('DEV tests warning:', err); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-white to-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lab Results</h1>
          <p className="text-sm text-gray-500">Track, filter & review lab and imaging results</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50">Export</button>
          <button className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90">New Result</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<span className="text-xl">🧪</span>} label="Total" value={rows.length} tone="bg-violet-100" />
        <StatCard icon={<span className="text-xl">🏥</span>} label="Lab" value={rows.filter(r=>r.facility==='Lab').length} tone="bg-slate-100" />
        <StatCard icon={<span className="text-xl">🩻</span>} label="Imaging" value={rows.filter(r=>r.facility==='Imaging').length} tone="bg-slate-100" />
        <StatCard icon={<span className="text-xl">✅</span>} label="Completed" value={rows.filter(r=>r.status==='Completed').length} tone="bg-green-100" />
        <StatCard icon={<span className="text-xl">🚩</span>} label="Flagged" value={rows.filter(r=>r.status==='Flagged').length} tone="bg-amber-100" />
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4 shadow-sm mb-4">
        {/* Top row: Search + Reset */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search by patient, lab ID, test, center…"
              className="w-full h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <button onClick={resetFilters} className="h-11 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">Reset all</button>
        </div>

        {/* Row 2: Primary filters */}
        <div className="mt-3 grid md:grid-cols-4 gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Status</span>
            <FilterSelect
              value={status }
              onChange={(v)=>setStatus(v)}
              placeholder="All statuses"
              options={( ["All","Pending","In Progress","Completed","Flagged"] as const ).map(s=>({
                label: s==='Pending' ? '⏳ Pending' : s==='In Progress' ? '🔧 In Progress' : s==='Completed' ? '✅ Completed' : s==='Flagged' ? '🚩 Flagged' : 'All statuses',
                value: s 
              })) }
            />
          </div>

          {/* Facility — Lab vs Imaging */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Facility</span>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {[
                {label:'All', value:'All' as const, icon:'•', activeClass:'bg-white text-gray-900 ring-gray-300', idleClass:'text-gray-600 ring-transparent hover:bg-gray-50'},
                {label:'Lab', value:'Lab' as const, icon:'🧪', activeClass:'bg-emerald-600 text-white ring-emerald-600', idleClass:'text-emerald-600 ring-transparent hover:bg-emerald-50'},
                {label:'Imaging', value:'Imaging' as const, icon:'🩻', activeClass:'bg-indigo-600 text-white ring-indigo-600', idleClass:'text-indigo-600 ring-transparent hover:bg-indigo-50'},
              ].map(opt=>{
                const active = (facility )===opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={()=>setFacility(opt.value )}
                    aria-pressed={active}
                    aria-label={`Facility: ${opt.label}`}
                    className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition inline-flex items-center gap-1.5 ${active? opt.activeClass : opt.idleClass}`}
                  >
                    <span aria-hidden>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Type — attractive pills */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Sample Type</span>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {[
                {label:'All', value:'All' as const, icon:'•', activeClass:'bg-white text-gray-900 ring-gray-300', idleClass:'text-gray-600 ring-transparent hover:bg-gray-50'},
                {label:'Blood', value:'Blood' as const, icon:'🩸', activeClass:'bg-rose-600 text-white ring-rose-600', idleClass:'text-rose-600 ring-transparent hover:bg-rose-50'},
                {label:'Urine', value:'Urine' as const, icon:'💧', activeClass:'bg-amber-600 text-white ring-amber-600', idleClass:'text-amber-600 ring-transparent hover:bg-amber-50'},
                {label:'Other', value:'Other' as const, icon:'🔬', activeClass:'bg-violet-600 text-white ring-violet-600', idleClass:'text-violet-600 ring-transparent hover:bg-violet-50'},
              ].map(opt=>{
                const active = (sample)===opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={()=>setSample(opt.value)}
                    aria-pressed={active}
                    aria-label={`Sample Type: ${opt.label}`}
                    className={`px-3 h-9 rounded-lg text-sm whitespace-nowrap ring-1 transition inline-flex items-center gap-1.5 ${active? opt.activeClass : opt.idleClass}`}
                  >
                    {opt.value !== "All" && <span aria-hidden>{opt.icon}</span>}
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
              value={doctor}
              onChange={(v)=>setDoctor(v)}
              placeholder="All doctors"
              searchable
              options={[{label:'All doctors', value:'All'}, ...doctors.map(d=>({label:d, value:d}))]}
            />
          </div>
        </div>

        {/* Row 2b: Center/Lab name */}
        <div className="mt-3 grid md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Center / Lab</span>
            <FilterSelect
              value={center}
              onChange={(v)=>setCenter(v)}
              placeholder="All centers"
              searchable
              options={[{label:'All centers', value:'All'}, ...centers.map(c=>({label:c, value:c}))]}
            />
          </div>
        </div>

        {/* Row 3: Date field + presets */}
        <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Date field</span>
            <Segmented options={[
              {label:'Reported', value:'Reported' as const},
              {label:'Collected', value:'Collected' as const},
            ]} value={dateField} onChange={(v)=>setDateField(v)} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 px-1">Date range</span>
            <Segmented options={[
              {label:'All time', value:'All time' as const},
              {label:'7 days', value:'7 days' as const},
              {label:'30 days', value:'30 days' as const},
              {label:'Custom', value:'Custom' as const},
            ]} value={datePreset} onChange={(v)=>applyDatePreset(v)} />
          </div>

          {datePreset==='Custom' && (
            <div className="flex items-end gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-sm text-gray-600">From</label>
                <input type="date" value={dateRange.from ?? ''} onChange={e=>setDateRange(v=>({...v,from:e.target.value||null}))} className="h-11 px-3 rounded-xl ring-1 ring-gray-200"/>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-sm text-gray-600">To</label>
                <input type="date" value={dateRange.to ?? ''} onChange={e=>setDateRange(v=>({...v,to:e.target.value||null}))} className="h-11 px-3 rounded-xl ring-1 ring-gray-200"/>
              </div>
            </div>
          )}
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
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600">
              <th className="w-10 text-left px-4 py-3"><input type="checkbox" className="h-4 w-4" checked={allPageSelected} onChange={toggleSelectAllPage} /></th>
              <th className="w-14 text-left px-4 py-3">No.</th>
              {headerCell("Patient","patientName",sortKey,sortDir,setSort)}
              <th className="w-24 text-left px-4 py-3">Lab ID</th>
              {headerCell("Test","testName",sortKey,sortDir,setSort)}
              {headerCell("Sample","sampleType",sortKey,sortDir,setSort)}
              {headerCell("Facility","facility",sortKey,sortDir,setSort)}
              {headerCell("Center","center",sortKey,sortDir,setSort)}
              {headerCell("Collected","collectedAt",sortKey,sortDir,setSort)}
              {headerCell("Reported","reportedAt",sortKey,sortDir,setSort)}
              {headerCell("Doctor","doctor",sortKey,sortDir,setSort)}
              <th className="text-left px-4 py-3">Value</th>
              {headerCell("Status","status",sortKey,sortDir,setSort)}
              <th className="w-40 text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r,idx)=>{
              const serial = (page-1)*pageSize + idx + 1;
              const dateDisplay = (iso: string | null) => iso ? iso : '—';
              return (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-2 py-3"><input type="checkbox" className="h-4 w-4" checked={selected.has(r.id)} onChange={()=>toggleRow(r.id)} /></td>
                  <td className="px-2 py-3 text-sm text-gray-500">{serial}</td>
                  <td className="px-2 py-3">
                    <div className="font-medium text-gray-900">{r.patientName}</div>
                    <div className="text-xs text-gray-500">{r.patientId} • {r.age}/{r.gender}</div>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-600">{r.id}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{r.testName}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{r.sampleType}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{r.facility === 'Lab' ? '🧪 Lab' : '🩻 Imaging'}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{r.center}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{dateDisplay(r.collectedAt)}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{dateDisplay(r.reportedAt)}</td>
                  <td className="px-2 py-3 text-sm text-gray-700">{r.doctor}</td>
                  <td className="px-2 py-3">
                    {r.value && (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{r.value}</span>{r.units? ` ${r.units}`:''}
                      </div>
                    )}
                    {r.reference && (
                      <div className="text-xs text-gray-500">Ref: {r.reference}</div>
                    )}
                    {r.abnormal && (
                      <div className="mt-1"><Chip label="Abnormal" tone="amber" /></div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <Chip label={r.status} tone={statusTone(r.status)} />
                  </td>
                  <td className="px-2 py-3 text-right">
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
                <td colSpan={14} className="px-4 py-12 text-center text-sm text-gray-500">No lab results match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{pageRows.length}</span> of <span className="font-medium text-gray-700">{filtered.length}</span> results</div>
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
              <h2 className="text-xl font-semibold">Lab/Imaging Result Preview</h2>
              <button onClick={()=>setPreview(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-medium">{preview.testName}</div>
              <div className="text-sm text-gray-600">{preview.id} • {preview.patientName} ({preview.patientId})</div>
              <div className="text-sm"><span className="text-gray-500">Facility: </span>{preview.facility === 'Lab' ? '🧪 Lab' : '🩻 Imaging'}</div>
              <div className="text-sm"><span className="text-gray-500">Center: </span>{preview.center}</div>
              <div className="text-sm"><span className="text-gray-500">Doctor: </span>{preview.doctor}</div>
              <div className="text-sm"><span className="text-gray-500">Sample: </span>{preview.sampleType}</div>
              <div className="text-sm"><span className="text-gray-500">Collected: </span>{preview.collectedAt}</div>
              <div className="text-sm"><span className="text-gray-500">Reported: </span>{preview.reportedAt ?? '—'}</div>
              <div className="pt-2 text-sm text-gray-900">Value: <span className="font-medium">{preview.value}{preview.units? ` ${preview.units}`: ''}</span> {preview.reference? <span className="text-gray-500">(Ref {preview.reference})</span>: null}</div>
              <div><Chip label={preview.status} tone={statusTone(preview.status)} /></div>
              <div className="pt-2 text-sm text-gray-500">This is a lightweight preview. Click below to open the full result page.</div>
              <button onClick={()=>{window.location.href = `/lab/${preview.id}`;}} className="w-full h-11 rounded-xl bg-black text-white">Open result page</button>
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
              <h2 className="text-xl font-semibold">History — {history.id}</h2>
              <button onClick={()=>setHistory(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <ol className="relative border-s border-gray-200 ps-5 space-y-6">
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm"><span className="font-medium">{history.collectedAt}</span> — {history.facility==='Lab' ? 'Sample collected' : 'Imaging performed'}</div>
              </li>
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm">Processing started</div>
              </li>
              <li>
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
                <div className="text-sm"><span className="font-medium">{history.reportedAt ?? '—'}</span> — Report {history.reportedAt? 'generated' : 'pending'}</div>
              </li>
            </ol>
            <button onClick={()=>{window.location.href = `/lab/${history.id}/history`;}} className="mt-6 w-full h-11 rounded-xl bg-black text-white">Open full history</button>
          </div>
        </div>
      )}

      {/* Modal: Share */}
      {shareFor && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShareFor(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Share result</h3>
              <button onClick={()=>setShareFor(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="text-sm text-gray-500">{shareFor.testName} — {shareFor.id}</div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Share to</div>
                <Segmented options={[
                  {label:'Doctor', value:'Doctor' as const},
                  {label:'Patient', value:'Patient' as const},
                  {label:'External', value:'External' as const},
                ]} value={shareTarget} onChange={v=>setShareTarget(v)} />
              </div>

              {shareTarget==='Doctor' && (
                <div>
                  <div className="text-sm font-medium mb-2">Select doctor</div>
                  {/* <select value={shareDoctor} onChange={e=>setShareDoctor(e.target.value)} className="h-11 px-3 rounded-xl ring-1 ring-gray-200 w-full">
                    {doctors.map(d=> (<option key={d} value={d}>{d}</option>))}
                  </select> */}
                  <FilterSelect
              value={shareDoctor}
              onChange={(v)=>setShareDoctor(v)}
              placeholder="Select doctor"
              searchable
              options={[{label:'All doctors', value:'All'}, ...doctors.map(c=>({label:c, value:c}))]}
            />
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
                  if(shareVia==='Copy link') navigator.clipboard?.writeText(`${window.location.origin}/lab/${shareFor.id}`);
                  setShareFor(null);
                  alert(`Shared with ${shareTarget}${shareTarget==='Doctor' ? ' — '+shareDoctor : ''} via ${shareVia}`);
                }}
                className="w-full h-11 rounded-xl bg-black text-white">Share</button>
            </div>
          </div>
        </div>
      )}

   
    </div>
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
    <th className="text-left px-2 py-3 select-none">
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