import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Plus,
  Trash,
  ChevronRight,
  Edit,
  X,
  AlertTriangle,
  EllipsisVertical,
  Pencil,
  Minus,
  Search,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { AppointmentType, DataType } from "./interface";
import MedicineComponent from "./Medicine";
import LabeledCombobox from "./LabeledCombobox";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Medicine {
  referralName: string;
  name: string;
  isCustom?: boolean;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
}

interface FavoriteTemplate {
  id: number;
  name: string;
  medicines: Medicine[];
}

const TemplateMedicinesList = ({ medicines }: { medicines: Medicine[] }) => {
  return (
    <div className="space-y-1.5">
      {medicines.map((med, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <span
              className="font-semibold text-slate-800 truncate text-xs"
              title={med.referralName || med.name}
            >
              {med.referralName || med.name || "Unnamed Medicine"}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-[10px]">
            {med.dosage && (
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                {med.dosage}
              </span>
            )}
            {med.frequency && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                {med.frequency}
              </span>
            )}
            {med.food && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                {med.food}
              </span>
            )}
            {med.duration && (
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-medium">
                {med.duration}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default function PrescriptionCard({
  data,
  setData,
  appointmentData,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  appointmentData: {
    message: string;
    data: AppointmentType;
  };
}) {
  const [favoritesPills, setFavoritesPills] = useState<Medicine[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("@favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
    const pills = localStorage.getItem("@favoritesPills");
    if (pills) {
      setFavoritesPills(JSON.parse(pills));
    }
  }, []);

  // Save to localStorage whenever favorites changes
  useEffect(() => {
    if (favorites.length !== 0) {
      localStorage.setItem("@favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavoritesPills = (m: Medicine) => {
    const found = favoritesPills.find((e) => e.referralName === m.referralName);
    if (found) {
      toast.error("Already pills exist");
      return;
    }
    const newPills: Medicine[] = [...favoritesPills, m];
    setFavoritesPills(newPills);
    localStorage.setItem("@favoritesPills", JSON.stringify(newPills));
  };

  const removeFavoritesPills = (referralName: string) => {
    const newPills: Medicine[] = favoritesPills.filter(
      (m) => referralName !== m.referralName
    );
    setFavoritesPills(newPills);
    localStorage.setItem("@favoritesPills", JSON.stringify(newPills));
  };

  const [favSearch, setFavSearch] = useState<string>("");

  const filteredFavorites = useMemo(() => {
    const q = favSearch.toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.medicines.some((m) =>
          Object.values(m).join(" ").toLowerCase().includes(q)
        )
    );
  }, [favSearch, favorites]);

  // --- UI state ---
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>("New Template");
  const [appendMode] = useState<boolean>(true); // NEW: allow applying multiple diseases

  // --- Edit modal state ---
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editTemplateId, setEditTemplateId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editMeds, setEditMeds] = useState<Medicine[]>([]);

  // ------------------ Handlers ------------------
  const applyTemplate = (fav: FavoriteTemplate) => {
    const copy = fav.medicines.map((m) => ({ ...m }));

    setData((prev) => {
      if (appendMode) {
        const base =
          prev.medicines.length === 1 &&
            Object.values(prev.medicines[0]).every((v) => !v)
            ? []
            : prev.medicines;

        return {
          ...prev,
          medicines: [...base, ...copy],
        };
      }

      return {
        ...prev,
        medicines: copy.length ? copy : [],
      };
    });
  };

  const addMedicineRow = () => {
    setData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          dosage: "1 tab",
          name: "",
          duration: "",
          food: "",
          frequency: "",
          quantity: 0,
          referralName: "",
          isCustom: false,
        },
      ],
    }));
  };

  const removeMedicineRow = (idx: number) => {
    setData((prev) => ({
      ...prev,
      medicines:
        prev.medicines.length === 1
          ? []
          : prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  const updateField = (
    idx: number,
    key: keyof Medicine,
    val: string | number | boolean
  ) => {
    setData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m, i) =>
        i === idx ? { ...m, [key]: val } : m
      ),
    }));
  };

  const openSaveModal = () => {
    setSaveModalOpen(true);
  };

  const saveCurrentAsFavorite = () => {
    const trimmed = templateName.trim();
    if (!trimmed) return;
    const cleaned = data.medicines.filter((m) =>
      Object.values(m).some((v) => (String(v) || "").trim() !== "")
    );
    if (!cleaned.length) return;
    const nextId = favorites.length
      ? Math.max(...favorites.map((f) => f.id)) + 1
      : 1;
    setFavorites((prev) => [
      ...prev,
      { id: nextId, name: trimmed, medicines: cleaned },
    ]);
    setSaveModalOpen(false);
    setTemplateName("");
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    localStorage.setItem(
      "@favorites",
      JSON.stringify(favorites.filter((f) => f.id !== id))
    );
  };

  const openEditModal = (id: number) => {
    const t = favorites.find((f) => f.id === id);
    if (!t) return;
    setEditTemplateId(id);
    setEditName(t.name);
    setEditMeds(t.medicines.map((m) => ({ ...m })));
    setEditModalOpen(true);
  };

  const updateEditField = (idx: number, key: keyof Medicine, val: string) =>
    setEditMeds((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [key]: val } : m))
    );
  const addEditRow = () =>
    setEditMeds((prev) => [
      ...prev,
      {
        dosage: "1 tab",
        name: "",
        duration: "",
        food: "",
        frequency: "",
        quantity: 0,
        referralName: "",
        isCustom: false,
      },
    ]);
  const removeEditRow = (idx: number) =>
    setEditMeds((prev) => prev.filter((_, i) => i !== idx));

  const saveEditTemplate = () => {
    if (editTemplateId === null) return;
    const cleaned = editMeds.filter((m) =>
      Object.values(m).some((v) => (v || "").trim() !== "")
    );
    setFavorites((prev) =>
      prev.map((f) =>
        f.id === editTemplateId
          ? { ...f, name: editName.trim() || f.name, medicines: cleaned }
          : f
      )
    );
    setEditModalOpen(false);
  };

  const [editFPill, setEditFPill] = useState(false);
  const [prescriptionKey, setPrescriptionKey] = useState(0);

  const clearAllMedicines = () => {
    setData((prev) => ({
      ...prev,
      medicines: [
        {
          dosage: "1 tab",
          name: "",
          duration: "",
          food: "",
          frequency: "",
          quantity: 0,
          referralName: "",
        },
      ],
    }));
    setPrescriptionKey((k) => k + 1);
    toast.success("Prescription table cleared");
  };

  return (
    <Card className="border-slate-200 shadow-xs rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div>
          <div className="mb-3">
            <div className="flex items-center gap-2.5 mb-2">
              <h2 className="font-semibold text-lg">Prescriptions</h2>
              {appointmentData.data.patient.allergies && (
                <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs bg-red-500/10 text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Allergies:{" "}
                  {appointmentData.data.patient.allergies}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {favoritesPills.map((f) => (
                <div className="relative inline-flex group items-center" key={f.referralName}>
                  {editFPill && (
                    <button
                      type="button"
                      className="absolute -right-1.5 -top-1.5 grid place-items-center size-4 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 focus:outline-none z-10 cursor-pointer transition-transform hover:scale-110"
                      onClick={() => removeFavoritesPills(f.referralName)}
                      title="Delete pill"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        medicines: [...prev.medicines.filter((m) => m.name !== ""), f],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs select-none transition-all duration-150 cursor-pointer font-medium border bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
                  >
                    {f.referralName}
                  </button>
                </div>
              ))}

              {
                Boolean(favoritesPills.length) &&
                <div className="relative z-20 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setEditFPill(prev => !prev)}
                          className="text-sm"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            </div>
            {/* Prescription Form */}
            <div className="border rounded-xl p-4">
              {/* Dynamic rows */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2">
                  <div className="col-span-1">Sl No</div>
                  <div className="col-span-3">Drug</div>
                  <div className="col-span-1">Dosage</div>
                  <div className="col-span-1">Frequency</div>
                  <div className="col-span-1">Food</div>
                  <div className="col-span-1">Duration</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Rows */}
                {data.medicines.map((m, i) => (
                  <div
                    key={`${prescriptionKey}-${i}`}
                    className="grid grid-cols-12 gap-2 mt-2 items-start"
                  >
                    <div className="col-span-1 flex justify-start items-center h-full">
                      {i + 1}
                    </div>
                    <div className="col-span-3">
                      <MedicineComponent
                        i={i}
                        m={m}
                        updateField={updateField}
                      />
                    </div>

                    <div className="col-span-1">
                      <LabeledCombobox
                        options={[
                          "½ tab",
                          "1 tab",
                          "2 tab",
                          "5 ml",
                          "10 ml",
                          "20 ml",
                        ]}
                        label="Dosage"
                        value={m.dosage}
                        onChange={(e) => updateField(i, "dosage", e)}
                      />
                    </div>

                    <div className="col-span-1">
                      <LabeledCombobox
                        options={[
                          "1-0-1",
                          "1-1-1",
                          "0-1-1",
                          "1-0-0",
                          "0-0-1",
                          "SOS",
                        ]}
                        label="Frequency"
                        value={m.frequency}
                        onChange={(e) => updateField(i, "frequency", e)}
                      />
                    </div>

                    <div className="col-span-1">
                      <LabeledCombobox
                        options={[
                          "After food",
                          "Before food",
                          "With food",
                          "Empty stomach",
                          "Anytime",
                        ]}
                        label="Food"
                        value={m.food}
                        onChange={(e) => updateField(i, "food", e)}
                      />
                    </div>

                    <div className="col-span-1">
                      <LabeledCombobox
                        options={[
                          "3 days",
                          "5 days",
                          "7 days",
                          "10 days",
                          "14 days",
                          "28 days",
                        ]}
                        label="Duration"
                        value={m.duration}
                        onChange={(e) => updateField(i, "duration", e)}
                      />
                    </div>

                    <div className="col-span-2">
                      <QuantityInput updateField={updateField} i={i} m={m} />
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      <Button
                        className="bg-red-600! hover:bg-red-700! text-white border-red-600!"
                        onClick={() => removeMedicineRow(i)}
                        title="Remove medicine"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                      <Button variant={"outline"} onClick={() => addFavoritesPills(data.medicines[i])}>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-3">
                  <Button
                    onClick={addMedicineRow}
                    className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) text-white rounded-md cursor-pointer"
                  >
                    + Add Medicine
                  </Button>
                  <Button
                    onClick={openSaveModal}
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-yellow-500" /> Add to Templates
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAllMedicines}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Clear all medicines from table"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </Button>
              </div>
            </div>
            <div className="mt-5 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Prescription Templates
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
                    {favorites.length}
                  </span>
                </div>

              </div>

              {favorites.length > 3 && (
                <div className="relative mb-2.5">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={favSearch}
                    onChange={(e) => setFavSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-(--color-synapse-light) focus:ring-2 focus:ring-synapse-light/10 transition-all placeholder:text-slate-400"
                  />
                  {favSearch && (
                    <button
                      onClick={() => setFavSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
                {filteredFavorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="min-w-60 max-w-68 bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group shrink-0"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6.5 h-6.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <h4
                            className="font-bold text-xs text-slate-800 truncate"
                            title={fav.name}
                          >
                            {fav.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                          {fav.medicines.length} {fav.medicines.length === 1 ? "med" : "meds"}
                        </span>
                      </div>

                      {/* Medicines compact visual tags */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {fav.medicines.slice(0, 3).map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 border border-slate-200/80 text-slate-700 px-2 py-0.8 rounded-lg truncate max-w-full"
                            title={`${m.referralName || m.name} (${m.dosage}, ${m.frequency})`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{m.referralName || m.name}</span>
                          </span>
                        ))}
                        {fav.medicines.length > 3 && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.8 rounded-lg">
                            +{fav.medicines.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => applyTemplate(fav)}
                      size="sm"
                      className="w-full h-8 bg-(--color-synapse-dark) hover:bg-emerald-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" /> Apply Template
                    </Button>
                  </div>
                ))}

                {/* Browse All Card */}
                <div
                  onClick={() => setSidebarOpen(true)}
                  className="min-w-35 rounded-2xl border-2 border-dashed border-slate-200 hover:border-(--color-synapse-light) bg-slate-50/50 hover:bg-emerald-50/20 flex flex-col items-center justify-center p-3.5 cursor-pointer transition-all group shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-slate-200 group-hover:border-(--color-synapse-light) flex items-center justify-center mb-1 text-slate-500 group-hover:text-emerald-700 transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                    Manage
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {favorites.length} {favorites.length === 1 ? "template" : "templates"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Browse / Manage All Templates */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-115 max-w-full bg-white shadow-2xl p-5 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">Manage Templates</h3>
                    <p className="text-xs text-slate-500">
                      {favorites.length} saved {favorites.length === 1 ? "template" : "templates"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={favSearch}
                    onChange={(e) => setFavSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {favSearch && (
                    <button
                      onClick={() => setFavSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                  {filteredFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span
                            className="font-bold text-sm text-slate-800 truncate"
                            title={fav.name}
                          >
                            {fav.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                            {fav.medicines.length} {fav.medicines.length === 1 ? "med" : "meds"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            onClick={() => openEditModal(fav.id)}
                            title="Edit Template"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            onClick={() => removeFavorite(fav.id)}
                            title="Delete Template"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <TemplateMedicinesList medicines={fav.medicines} />

                      <Button
                        size="sm"
                        className="w-full h-8.5 bg-(--color-synapse-dark) hover:bg-emerald-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        onClick={() => {
                          applyTemplate(fav);
                          setSidebarOpen(false);
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Apply to Prescription
                      </Button>
                    </div>
                  ))}
                  {!filteredFavorites.length && (
                    <div className="text-sm text-slate-400 text-center py-10">
                      No templates found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Template Modal */}
          {saveModalOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={() => setSaveModalOpen(false)}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-105 max-w-[95vw] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">Save as Template</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Save current {data.medicines.filter(m => m.name || m.referralName).length} medicines as a reusable template
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg text-slate-400 hover:text-slate-600"
                    onClick={() => setSaveModalOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Template Name</label>
                <input
                  autoFocus
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Typhoid – Adult Standard"
                  className="border border-slate-200 rounded-xl p-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl text-xs"
                    onClick={() => setSaveModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-(--color-synapse-dark) hover:opacity-90 text-white rounded-xl text-xs font-medium"
                    onClick={saveCurrentAsFavorite}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Template Modal */}
          {editModalOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={() => setEditModalOpen(false)}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-160 max-w-[95vw] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-slate-800">Edit Template</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Modify medicines and instructions in this template</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg text-slate-400 hover:text-slate-600"
                    onClick={() => setEditModalOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Template Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  <div className="col-span-4">Medicine</div>
                  <div className="col-span-2">Dosage</div>
                  <div className="col-span-2">Frequency</div>
                  <div className="col-span-2">Food</div>
                  <div className="col-span-2">Duration</div>
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {editMeds.map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-2 rounded-xl border border-slate-200/70"
                    >
                      <input
                        value={m.referralName || m.name}
                        onChange={(e) => {
                          updateEditField(idx, "referralName", e.target.value);
                          if (!m.name || m.isCustom) {
                            updateEditField(idx, "name", "");
                          }
                        }}
                        placeholder="Drug name"
                        className="border border-slate-200 bg-white rounded-lg p-1.5 text-xs col-span-4 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        value={m.dosage}
                        onChange={(e) =>
                          updateEditField(idx, "dosage", e.target.value)
                        }
                        placeholder="1 tab"
                        className="border border-slate-200 bg-white rounded-lg p-1.5 text-xs col-span-2 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        value={m.frequency}
                        onChange={(e) =>
                          updateEditField(idx, "frequency", e.target.value)
                        }
                        placeholder="1-0-1"
                        className="border border-slate-200 bg-white rounded-lg p-1.5 text-xs col-span-2 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        value={m.food}
                        onChange={(e) =>
                          updateEditField(idx, "food", e.target.value)
                        }
                        placeholder="After food"
                        className="border border-slate-200 bg-white rounded-lg p-1.5 text-xs col-span-2 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          value={m.duration}
                          onChange={(e) =>
                            updateEditField(idx, "duration", e.target.value)
                          }
                          placeholder="3 days"
                          className="border border-slate-200 bg-white rounded-lg p-1.5 text-xs w-full focus:outline-none focus:border-emerald-500"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                          onClick={() => removeEditRow(idx)}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className="rounded-xl text-xs flex items-center gap-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={addEditRow}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine Row
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl text-xs"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-(--color-synapse-dark) hover:opacity-90 text-white rounded-xl text-xs font-medium"
                      onClick={saveEditTemplate}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



const QuantityInput = ({ updateField, i, m }: { updateField: (idx: number, key: keyof Medicine, val: string | number) => void, i: number, m: Medicine }) => {


  const currentOptions = {
    dosage: ["½ tab", "1 tab", "2 tab"],
    duration: ["3 days", "5 days", "7 days", "10 days", "14 days", "28 days"],
    frequency: ["1-0-1", "1-1-1", "0-1-1", "1-0-0", "0-0-1"]
  }

  useEffect(() => {
    if (currentOptions.dosage.includes(m.dosage) && currentOptions.frequency.includes(m.frequency)) {
      const dosage = currentOptions.dosage[0] === m.dosage && 0.5 || currentOptions.dosage[1] === m.dosage && 1 || currentOptions.dosage[2] === m.dosage && 2 || 0
      const duration = currentOptions.duration[0] === m.duration && 3 || currentOptions.duration[1] === m.duration && 5 || currentOptions.duration[2] === m.duration && 7 || currentOptions.duration[3] === m.duration && 10 || currentOptions.duration[4] === m.duration && 14 || currentOptions.duration[5] === m.duration && 28 || Number(m.duration) || 0
      const frequency = currentOptions.frequency[0] === m.frequency && 2 || currentOptions.frequency[1] === m.frequency && 3 || currentOptions.frequency[2] === m.frequency && 2 || currentOptions.frequency[3] === m.frequency && 1 || currentOptions.frequency[4] === m.frequency && 1 || 0
      updateField(i, "quantity", Math.ceil(dosage * duration * frequency))
    } else {
      updateField(i, "quantity", 0)
    }

  }, [m.dosage, m.duration, m.frequency])


  return (
    <div className="relative w-full">
      <input
        placeholder="0"
        onChange={(e) => {
          const value = e.target.value;
          updateField(
            i,
            "quantity",
            value === "" ? 0 : Number(value)
          );
        }}
        inputMode={"numeric"}
        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
        value={m.quantity === 0 ? "" : m.quantity}
        onFocus={e => e.target.placeholder = ""}
        onBlur={e => e.target.placeholder = "0"}
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        Quantity
      </label>
    </div>
  )
}
