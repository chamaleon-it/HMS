import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus, Trash, ChevronRight, Edit, X, ChevronDown } from "lucide-react";

// Small helper
const emptyMed = () => ({ drug: "", dosage: "", frequency: "", food: "", duration: "" });

// Suggestion lists
const DOSAGE_OPTS = ["125mg","250mg","500mg","650mg","1g","5ml","10ml","15ml","1 tab","2 tab"];
const FREQ_OPTS = ["1-0-0","0-1-0","0-0-1","1-1-0","1-0-1","0-1-1","1-1-1","2-0-2","2-1-2","0-0-0 (SOS)"];
const FOOD_OPTS = ["After Food","Before Food","With Food","Regardless of Food"];
const DURATION_OPTS = ["3 days","5 days","7 days","10 days","14 days","21 days","1 month"];

// Custom dropdown component (styled)
function SuggestInput({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative col-span-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border rounded-md p-2 text-sm pr-8"
      />
      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="px-3 py-1.5 text-sm hover:bg-emerald-100 cursor-pointer"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrescriptionUI() {
  // --- Favorites (templates) ---
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "Typhoid – Adult",
      medicines: [
        { drug: "Amoxicillin", dosage: "500mg", frequency: "1-0-1", food: "After Food", duration: "7 days" },
        { drug: "Paracetamol", dosage: "650mg", frequency: "1-1-1", food: "After Food", duration: "5 days" },
      ],
    },
    {
      id: 2,
      name: "Dengue – Standard",
      medicines: [
        { drug: "Paracetamol", dosage: "650mg", frequency: "1-1-1", food: "After Food", duration: "5 days" },
      ],
    },
  ]);
  const [favSearch, setFavSearch] = useState("");
  const filteredFavorites = useMemo(() => {
    const q = favSearch.toLowerCase();
    if (!q) return favorites;
    return favorites.filter((f) =>
      f.name.toLowerCase().includes(q) || f.medicines.some((m) => Object.values(m).join(" ").toLowerCase().includes(q))
    );
  }, [favSearch, favorites]);

  // --- Current prescription form (multiple medicines) ---
  const [medicines, setMedicines] = useState([emptyMed()]);

  // --- UI state ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [appendMode, setAppendMode] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMeds, setEditMeds] = useState([]);

  // Handlers
  const applyTemplate = (fav) => {
    const copy = fav.medicines.map((m) => ({ ...emptyMed(), ...m }));
    setMedicines((prev) => {
      if (appendMode) {
        const base = prev.length === 1 && Object.values(prev[0]).every((v) => !v) ? [] : prev;
        return [...base, ...copy];
      }
      return copy.length ? copy : [emptyMed()];
    });
  };

  const addMedicineRow = () => setMedicines((prev) => [...prev, emptyMed()]);
  const removeMedicineRow = (idx) =>
    setMedicines((prev) => (prev.length === 1 ? [emptyMed()] : prev.filter((_, i) => i !== idx)));
  const updateField = (idx, key, val) =>
    setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: val } : m)));

  return (
    <div className="p-6">
      {/* Favorites Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">⭐ Favorite Prescriptions</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="accent-emerald-600" checked={appendMode} onChange={(e) => setAppendMode(e.target.checked)} />
            Append on Apply
          </label>
        </div>
        <input
          value={favSearch}
          onChange={(e) => setFavSearch(e.target.value)}
          placeholder="Search templates..."
          className="border rounded-md p-2 text-sm w-full mb-3"
        />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredFavorites.map((fav) => (
            <Card key={fav.id} className="min-w-[280px] rounded-xl shadow-sm border">
              <CardContent className="p-3">
                <div className="font-medium text-sm mb-2 truncate" title={fav.name}>{fav.name}</div>
                <div className="flex flex-col gap-1 text-xs mb-3 max-h-24 overflow-y-auto pr-1">
                  {fav.medicines.map((med, idx) => (
                    <div key={idx} className="flex flex-wrap gap-1">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{med.drug}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{med.dosage}</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">{med.frequency}</span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">{med.food}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">{med.duration}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => applyTemplate(fav)} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                  Apply
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Prescription Form */}
      <div className="border rounded-xl p-4">
        <h2 className="font-bold text-lg mb-3">Prescriptions</h2>

        <div className="flex flex-col gap-3">
          {medicines.map((m, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-center">
              <input value={m.drug} onChange={(e) => updateField(idx, "drug", e.target.value)} placeholder="Drug" className="border rounded-md p-2 text-sm col-span-3" />
              <SuggestInput value={m.dosage} onChange={(val) => updateField(idx, "dosage", val)} options={DOSAGE_OPTS} placeholder="Dosage" />
              <SuggestInput value={m.frequency} onChange={(val) => updateField(idx, "frequency", val)} options={FREQ_OPTS} placeholder="Frequency (e.g., 1-0-1)" />
              <SuggestInput value={m.food} onChange={(val) => updateField(idx, "food", val)} options={FOOD_OPTS} placeholder="Food" />
              <SuggestInput value={m.duration} onChange={(val) => updateField(idx, "duration", val)} options={DURATION_OPTS} placeholder="Duration" />

              <div className="flex gap-2 col-span-1 justify-end">
                <Button onClick={() => addMedicineRow()} size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button onClick={() => removeMedicineRow(idx)} size="icon" variant="destructive" className="rounded-full">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={addMedicineRow} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
            + Add Medicine
          </Button>
          <Button onClick={() => setSaveModalOpen(true)} variant="outline" className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" /> Add to Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}