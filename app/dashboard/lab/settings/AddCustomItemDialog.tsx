import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

interface AddCustomItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (newTest: any) => void;
    defaultName?: string;
}

const UnitAutoInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const defaultOptions = ["mg/dL", "fL", "g/dL", "pg", "10^3/µL", "10^6/µL", "%"];
    const [options, setOptions] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("customUnits") || "null") || defaultOptions;
        } catch {
            return defaultOptions;
        }
    });

    const saveOption = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed) return;
        onChange(trimmed);
        if (!options.some(o => o.toLowerCase() === trimmed.toLowerCase())) {
            const newOptions = [...options, trimmed];
            setOptions(newOptions);
            localStorage.setItem("customUnits", JSON.stringify(newOptions));
        }
    };

    const filtered = options.filter(
        opt => !value || opt.toLowerCase().includes(value.toLowerCase())
    );

    const isNew = value && !options.some(opt => opt.toLowerCase() === value.toLowerCase());

    return (
        <div className="relative">
            <Input
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() =>
                    setTimeout(() => {
                        setOpen(false);
                        saveOption(value);
                    }, 150)
                }
                placeholder="e.g. mg/dL"
                className="h-9 bg-slate-50 relative z-10"
            />
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map((opt) => (
                        <div
                            key={opt}
                            className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                saveOption(opt);
                                setOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                    {isNew && (
                        <div
                            className="px-3 py-2 text-xs italic bg-sky-50 text-sky-700 cursor-pointer hover:bg-sky-100"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                saveOption(value);
                                setOpen(false);
                            }}
                        >
                            + Add custom unit: "{value}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AddCustomItemDialog({
    open,
    onOpenChange,
    onSuccess,
    defaultName = "",
}: AddCustomItemDialogProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [price, setPrice] = useState(0);
    const [method, setMethod] = useState("");
    const [specimen, setSpecimen] = useState("");
    const [type, setType] = useState<"Lab" | "Imaging">("Lab");
    const [estimatedTime, setEstimatedTime] = useState("");
    const [dataType, setDataType] = useState<"number" | "text" | "boolean" | "options">("text");
    const [unit, setUnit] = useState("");
    const [category, setCategory] = useState("");
    const [options, setOptions] = useState<string[]>([]);
    const [range, setRange] = useState<any[]>([
        {
            name: "Normal",
            min: undefined,
            max: undefined,
            fromAge: undefined,
            toAge: undefined,
            gender: "Both",
            dateType: "Year",
        },
    ]);
    const [note, setNote] = useState("");
    const [isCustomItem, setIsCustomItem] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(defaultName);
            setCode("");
            setPrice(0);
            setMethod("");
            setSpecimen("");
            setType("Lab");
            setEstimatedTime("");
            setDataType("text");
            setUnit("");
            setCategory("");
            setOptions([]);
            setRange([
                {
                    name: "Normal",
                    min: undefined,
                    max: undefined,
                    fromAge: undefined,
                    toAge: undefined,
                    gender: "Both",
                    dateType: "Year",
                },
            ]);
            setNote("");
            setIsCustomItem(true);
        }
    }, [open, defaultName]);

    const handleRangeChange = (index: number, field: string, value: any) => {
        const updatedRange = [...range];
        updatedRange[index] = { ...updatedRange[index], [field]: value };
        setRange(updatedRange);
    };

    const addRange = () => {
        setRange([
            ...range,
            { name: "", min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" },
        ]);
    };

    const removeRange = (index: number) => {
        setRange(range.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a name");
            return;
        }
        if (!type) {
            toast.error("Please select a type");
            return;
        }

        setLoading(true);
        try {
            let finalPayload: any = {
                name: name.trim(),
                code: code.trim() || undefined,
                price: Number(price) || 0,
                method: method.trim() || undefined,
                specimen: specimen.trim() || undefined,
                type,
                dataType,
                category: category.trim() || undefined,
                note: note.trim() || undefined,
                isCustomItem,
            };

            if (dataType === "number") {
                finalPayload.unit = unit.trim() || undefined;
                if (!isCustomItem) {
                    finalPayload.range = range.map(r => ({
                        ...r,
                        min: r.min !== undefined && r.min !== "" ? Number(r.min) : undefined,
                        max: r.max !== undefined && r.max !== "" ? Number(r.max) : undefined,
                        fromAge: r.fromAge !== undefined && r.fromAge !== "" ? Number(r.fromAge) : undefined,
                        toAge: r.toAge !== undefined && r.toAge !== "" ? Number(r.toAge) : undefined,
                    }));
                }
            } else if (dataType === "options") {
                if (options.length === 0) {
                    toast.error("Please add at least one option");
                    setLoading(false);
                    return;
                }
                finalPayload.options = options;
            }

            if (estimatedTime) {
                const [hoursStr, minutesStr] = estimatedTime.split(":");
                const hours = parseInt(hoursStr || "0", 10);
                const minutes = parseInt(minutesStr || "0", 10);
                finalPayload.estimatedTime = hours * 60 + minutes;
            }

            const response = await api.post("/lab/panels/create_test", finalPayload);
            const createdTest = response.data.data;

            toast.success("Test/Item created successfully");
            onSuccess(createdTest);
            onOpenChange(false);
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to create test/item";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Test or Custom Item</DialogTitle>
                    <DialogDescription>
                        Define a parameter that will appear in this panel and the test configuration.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Item/Test Name *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Complete Blood Count"
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Test Code</Label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value.slice(0, 5))}
                                placeholder="e.g. CBC"
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Price (₹)</Label>
                            <Input
                                type="number"
                                value={price || ""}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                placeholder="0"
                                min={0}
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-4 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Method</Label>
                            <Input
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                placeholder="e.g. Impedance"
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Specimen</Label>
                            <Input
                                value={specimen}
                                onChange={(e) => setSpecimen(e.target.value)}
                                placeholder="e.g. Blood"
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Type *</Label>
                            <Select
                                value={type}
                                onValueChange={(val: "Lab" | "Imaging") => {
                                    setType(val);
                                    if (val === "Imaging") {
                                        setDataType("text");
                                    }
                                }}
                            >
                                <SelectTrigger className="h-9 bg-slate-50 w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lab">Lab Test</SelectItem>
                                    <SelectItem value="Imaging">Imaging</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Estimated Duration (HH:MM)</Label>
                            <Input
                                placeholder="HH:MM"
                                value={estimatedTime}
                                type="text"
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, "");
                                    if (val.length > 4) val = val.slice(0, 4);
                                    if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                    setEstimatedTime(val);
                                }}
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Category</Label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Haematology"
                                className="h-9 bg-slate-50"
                            />
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Data Type *</Label>
                            <Select
                                value={dataType}
                                onValueChange={(val: any) => setDataType(val)}
                                disabled={type === "Imaging"}
                            >
                                <SelectTrigger className="h-9 bg-slate-50 w-full">
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="boolean">Positive/Negative</SelectItem>
                                    <SelectItem value="options">Options (Dropdown)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {dataType === "number" && (
                            <div className="col-span-3 space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Unit</Label>
                                <UnitAutoInput
                                    value={unit}
                                    onChange={setUnit}
                                />
                            </div>
                        )}

                        {dataType === "options" && (
                            <div className="col-span-6 space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Add Options</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        className="h-9 bg-slate-50 flex-1"
                                        placeholder="Enter Option"
                                        id="option-input-modal"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const value = input.value.trim();
                                                if (value) {
                                                    setOptions([...options, value]);
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const input = document.getElementById("option-input-modal") as HTMLInputElement;
                                            const value = input.value?.trim();
                                            if (value) {
                                                setOptions([...options, value]);
                                                input.value = "";
                                            }
                                        }}
                                        className="h-9 w-9 p-0 bg-slate-50 shrink-0 border border-slate-200"
                                        variant="outline"
                                    >
                                        <Plus className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                            <span>{opt}</span>
                                            <button
                                                onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                                                className="text-slate-400 hover:text-red-500 font-bold ml-1"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between border rounded-lg p-3 bg-slate-50/50 mt-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-semibold">Custom Parameter</Label>
                            <p className="text-xs text-muted-foreground">
                                Hide range and marks this as a custom panel parameter (non-test item).
                            </p>
                        </div>
                        <Switch
                            checked={isCustomItem}
                            onCheckedChange={setIsCustomItem}
                        />
                    </div>

                    {dataType === "number" && !isCustomItem && (
                        <div className="w-full mt-2 space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">Normal Ranges</Label>
                            <Table className="border">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Sl No</TableHead>
                                        <TableHead>Range Name</TableHead>
                                        <TableHead className="w-24">Min</TableHead>
                                        <TableHead className="w-24">Max</TableHead>
                                        <TableHead className="w-24">From Age</TableHead>
                                        <TableHead className="w-24">To Age</TableHead>
                                        <TableHead className="w-24">Gender</TableHead>
                                        <TableHead className="w-24">Y/M/D</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {range.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="e.g. Normal"
                                                    value={r.name}
                                                    onChange={(e) => handleRangeChange(i, "name", e.target.value)}
                                                    className="h-8 shadow-none bg-slate-50"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={r.min ?? ""}
                                                    onChange={(e) => handleRangeChange(i, "min", e.target.value)}
                                                    className="h-8 shadow-none bg-slate-50 px-2"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={r.max ?? ""}
                                                    onChange={(e) => handleRangeChange(i, "max", e.target.value)}
                                                    className="h-8 shadow-none bg-slate-50 px-2"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="Optional"
                                                    value={r.fromAge ?? ""}
                                                    onChange={(e) => handleRangeChange(i, "fromAge", e.target.value)}
                                                    className="h-8 shadow-none bg-slate-50 px-1"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="Optional"
                                                    value={r.toAge ?? ""}
                                                    onChange={(e) => handleRangeChange(i, "toAge", e.target.value)}
                                                    className="h-8 shadow-none bg-slate-50 px-1"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={r.gender}
                                                    onValueChange={(v) => handleRangeChange(i, "gender", v)}
                                                >
                                                    <SelectTrigger className="h-8 shadow-none bg-slate-50 px-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Both">Both</SelectItem>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={r.dateType}
                                                    onValueChange={(v) => handleRangeChange(i, "dateType", v)}
                                                >
                                                    <SelectTrigger className="h-8 shadow-none bg-slate-50 px-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Year">Year</SelectItem>
                                                        <SelectItem value="Month">Month</SelectItem>
                                                        <SelectItem value="Day">Day</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 items-center h-full">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeRange(i);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            addRange();
                                                        }}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {range.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addRange();
                                                    }}
                                                    className="text-slate-600"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" /> Add Range
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="col-span-full space-y-1.5 mt-2">
                        <Label className="text-xs font-medium text-slate-700">Notes</Label>
                        <Textarea
                            placeholder="Note description"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="bg-slate-50"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? "Creating..." : "Create & Add"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
