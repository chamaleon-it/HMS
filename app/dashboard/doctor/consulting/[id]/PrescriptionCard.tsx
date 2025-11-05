import React, { useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { AppointmentType, DataType } from "./interface";
import Medicine from "./Medicine";

// ------------------ Types ------------------
interface Medicine {
  name: string;
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
  // --- Favorites (templates) ---
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([
    {
      id: 1,
      name: "Typhoid – Adult",
      medicines: [
        {
          name: "Amoxicillin 500mg",
          dosage: "1 tab",
          frequency: "1-0-1",
          food: "After Food",
          duration: "7 days",
          quantity: 14,
        },
        {
          name: "Paracetamol 650mg",
          dosage: "1 tab",
          frequency: "1-1-1",
          food: "After Food",
          duration: "5 days",
          quantity: 15,
        },
      ],
    },
    {
      id: 2,
      name: "Dengue – Standard",
      medicines: [
        {
          name: "Paracetamol 650mg",
          dosage: "1 tab",
          frequency: "1-1-1",
          food: "After Food",
          duration: "5 days",
          quantity: 15,
        },
      ],
    },
  ]);
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
  const [templateName, setTemplateName] = useState<string>("");
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
          dosage: "",
          name: "",
          duration: "",
          food: "",
          frequency: "",
          quantity: 0,
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
    val: string | number
  ) => {
    setData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m, i) =>
        i === idx ? { ...m, [key]: val } : m
      ),
    }));
  };

  const openSaveModal = () => {
    const title = data.medicines[0]?.name
      ? `${data.medicines[0].name} – Template`
      : "New Template";
    setTemplateName(title);
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

  const removeFavorite = (id: number) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

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
  const addEditRow = () => setEditMeds((prev) => [...prev]);
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

  // ------------------ JSX ------------------
  return (
    <Card>
      <CardContent>
        <div className="">
          {/* Favorites Section */}

          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h2 className="font-semibold text-lg">Prescriptions</h2>
              {appointmentData.data.patient.allergies && (
                <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs bg-red-500/10 text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Allergies:{" "}
                  {appointmentData.data.patient.allergies}
                </div>
              )}
            </div>
            <input
              value={favSearch}
              onChange={(e) => setFavSearch(e.target.value)}
              placeholder="Search templates..."
              className="border rounded-md p-2 text-sm w-full mb-3"
            />
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredFavorites.map((fav) => (
                <Card
                  key={fav.id}
                  className="min-w-[280px] rounded-xl shadow-sm border"
                >
                  <CardContent className="p-3">
                    <div
                      className="font-medium text-sm mb-2 truncate"
                      title={fav.name}
                    >
                      {fav.name}
                    </div>
                    <div className="flex flex-col gap-1 text-xs mb-3 max-h-24 overflow-y-auto pr-1">
                      {fav.medicines.map((med, idx) => (
                        <div key={idx} className="flex flex-wrap gap-1">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                            {med.name}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                            {med.frequency}
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                            {med.food}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            {med.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => applyTemplate(fav)}
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                    >
                      Apply
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {/* Browse All Button */}
              <Card
                onClick={() => setSidebarOpen(true)}
                className="min-w-[160px] rounded-xl border-dashed border-2 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-600">
                    Browse All <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Prescription Form */}
          <div className="border rounded-xl p-4">
            {/* Dynamic rows */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wide text-slate-500 mt-2">
                <div className="col-span-2">Drug</div>
                <div className="col-span-2">Dosage</div>
                <div className="col-span-2">Frequency</div>
                <div className="col-span-2">Food</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-1">Quantity</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              {data.medicines.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 mt-2 items-start"
                >
                  <div className="col-span-2">
                    <Medicine i={i} m={m} updateField={updateField} />
                  </div>

                  <div className="col-span-2">
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

                  <div className="col-span-2">
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

                  <div className="col-span-2">
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

                  <div className="col-span-2">
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

                  <div className="col-span-1">
                    <div className="relative w-full">
                      <input
                        placeholder="quantity"
                        type="number"
                        onChange={(e) =>
                          updateField(
                            i,
                            "quantity",
                            parseInt(e.target.value) ?? 0
                          )
                        }
                        inputMode={"numeric"}
                        className={`peer w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
                      />
                      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
                        Quantity
                      </label>
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-end gap-2">
                    <Button
                      className="!bg-emerald-600 hover:!bg-emerald-700 text-white !border-emerald-600"
                      onClick={addMedicineRow}
                      title="Add medicine"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      className="!bg-red-600 hover:!bg-red-700 text-white !border-red-600"
                      onClick={() => removeMedicineRow(i)}
                      title="Remove medicine"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={addMedicineRow}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
              >
                + Add Medicine
              </Button>
              <Button
                onClick={openSaveModal}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Star className="w-4 h-4 text-yellow-500" /> Add to Favorites
              </Button>
            </div>
          </div>
          {/* Sidebar: Browse / Manage All Templates */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40">
              <div
                className="absolute inset-0 bg-black/20"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Manage Favorites</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <input
                  value={favSearch}
                  onChange={(e) => setFavSearch(e.target.value)}
                  placeholder="Search favorites..."
                  className="border rounded-md p-2 text-sm w-full mb-3"
                />
                <div className="flex flex-col gap-3">
                  {filteredFavorites.map((fav) => (
                    <Card key={fav.id} className="rounded-lg border shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="font-medium text-sm truncate"
                            title={fav.name}
                          >
                            {fav.name}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal(fav.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFavorite(fav.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 text-xs mb-3 max-h-24 overflow-y-auto pr-1">
                          {fav.medicines.map((med, idx) => (
                            <div key={idx} className="flex flex-wrap gap-1">
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                                {med.name}
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                                {med.dosage}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                                {med.frequency}
                              </span>
                              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                                {med.food}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                                {med.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => applyTemplate(fav)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!filteredFavorites.length && (
                    <div className="text-sm text-gray-500 text-center py-6">
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
                className="absolute inset-0 bg-black/30"
                onClick={() => setSaveModalOpen(false)}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[420px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Save as Favorite</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSaveModalOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <label className="text-sm text-gray-600">Template name</label>
                <input
                  autoFocus
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Typhoid – Adult Standard"
                  className="border rounded-md p-2 text-sm w-full mt-1 mb-4"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSaveModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={saveCurrentAsFavorite}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Edit Template Modal */}
          {editModalOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setEditModalOpen(false)}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[560px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Edit Template</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditModalOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <label className="text-sm text-gray-600">Template name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border rounded-md p-2 text-sm w-full mt-1 mb-4"
                />
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {editMeds.map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        value={m.name}
                        onChange={(e) =>
                          updateEditField(idx, "name", e.target.value)
                        }
                        placeholder="Drug"
                        className="border rounded-md p-2 text-xs col-span-3"
                      />
                      <input
                        value={m.dosage}
                        onChange={(e) =>
                          updateEditField(idx, "dosage", e.target.value)
                        }
                        placeholder="Dosage"
                        className="border rounded-md p-2 text-xs col-span-2"
                      />
                      <input
                        value={m.frequency}
                        onChange={(e) =>
                          updateEditField(idx, "frequency", e.target.value)
                        }
                        placeholder="Frequency"
                        className="border rounded-md p-2 text-xs col-span-2"
                      />
                      <input
                        value={m.food}
                        onChange={(e) =>
                          updateEditField(idx, "food", e.target.value)
                        }
                        placeholder="Food"
                        className="border rounded-md p-2 text-xs col-span-2"
                      />
                      <input
                        value={m.duration}
                        onChange={(e) =>
                          updateEditField(idx, "duration", e.target.value)
                        }
                        placeholder="Duration"
                        className="border rounded-md p-2 text-xs col-span-2"
                      />
                      <div className="col-span-1 flex justify-end">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeEditRow(idx)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3">
                  <Button variant="outline" onClick={addEditRow}>
                    <Plus className="w-4 h-4 mr-1" /> Add Medicine
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

type LabeledComboboxProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  digitsOnly?: boolean; // e.g., for duration
};

function LabeledCombobox({
  label,
  value,
  onChange,
  options,
  digitsOnly,
}: LabeledComboboxProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const handleChange = (raw: string) => {
    const v = digitsOnly ? raw.replace(/[^0-9]/g, "") : raw;
    setText(v);
    onChange(v);
    setOpen(true);
  };

  const commit = (val: string) => {
    setText(val);
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder=" "
        className="peer w-full rounded-xl border border-slate-200 bg-transparent px-3 pt-5 pb-2 text-sm outline-none placeholder-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 z-20 relative"
      />
      <label className="absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-emerald-600">
        {label}
      </label>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </span>

      {open && options.length > 0 && (
        <div className="absolute left-0 right-0  z-30 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto p-1">
          {options.map((opt: string) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-2 py-1.5 rounded-lg text-sm bg-white hover:bg-emerald-50 hover:text-emerald-700"
              onMouseDown={(e) => {
                e.preventDefault();
                commit(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
