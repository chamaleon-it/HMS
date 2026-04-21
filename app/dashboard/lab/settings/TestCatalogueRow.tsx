import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/axios';
import { formatINR } from '@/lib/fNumber';
import { Plus, Save, Trash2, Eye, Pencil, Search, GripVertical, Check, Mars, Venus, Baby, Smile } from "lucide-react";
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TestCatalogueRow({
    test,
    idx,
    testMutate,
}: {
    idx: number;
    test: {
        _id: string
        code: string;
        name: string;
        price: number;
        method: string;
        specimen: string;
        type: "Lab" | "Imaging";
        unit?: string;
        range?: {
            name: string;
            min: number | null | undefined;
            max: number | null | undefined;
            fromAge: number | null | undefined;
            toAge: number | null | undefined;
            gender: string;
            dateType: "Year" | "Month" | "Day",
        }[];
        note?: string;
        estimatedTime?: string;
        panels: { name: string }[]
        dataType: "number" | "text" | "boolean" | "options";
        options: string[];
    };
    testMutate: () => void
}) {


    const [editOpen, setEditOpen] = React.useState(false);
    const [viewOpen, setViewOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [payload, setPayload] = useState<{
        code: string;
        name: string;
        type: "Lab" | "Imaging";
        price: number;
        method: string
        specimen: string
        panel: { name: string }[];
        unit: string | null | undefined;
        range: {
            name: string;
            min: number | null | undefined;
            max: number | null | undefined;
            fromAge: number | null | undefined;
            toAge: number | null | undefined;
            gender: string;
            dateType: "Year" | "Month" | "Day",
        }[];
        note: string;
        estimatedTime?: string;
        _id: string;
        dataType: "number" | "text" | "boolean" | "options";
        options: string[];
    }>({
        code: test.code,
        name: test.name,
        type: test.type,
        price: test.price,
        method: test.method,
        specimen: test.specimen,
        panel: test.panels,
        unit: test.unit,
        range: test.range?.length ? test.range : [{
            name: "Normal",
            min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year"
        }],
        note: test.note || "",
        estimatedTime: test.estimatedTime ? `${String(Math.floor(Number(test.estimatedTime) / 60)).padStart(2, '0')}:${String(Number(test.estimatedTime) % 60).padStart(2, '0')}` : undefined,
        _id: test._id,
        dataType: test.dataType,
        options: test.options || []
    })

    // Reset payload when modal opens to avoid state persistence bug
    React.useEffect(() => {
        if (editOpen) {
            setPayload({
                code: test.code,
                name: test.name,
                type: test.type,
                price: test.price,
                method: test.method,
                specimen: test.specimen,
                panel: test.panels,
                unit: test.unit,
                range: test.range?.length ? test.range : [{
                    name: "Normal",
                    min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year"
                }],
                note: test.note || "",
                estimatedTime: test.estimatedTime ? `${String(Math.floor(Number(test.estimatedTime) / 60)).padStart(2, '0')}:${String(Number(test.estimatedTime) % 60).padStart(2, '0')}` : undefined,
                _id: test._id,
                dataType: test.dataType,
                options: test.options || []
            });
        }
    }, [editOpen, test]);

    const handleRangeChange = (index: number, field: string, value: any) => {
        setPayload((prev) => {
            const updatedRange = [...(prev.range || [])];
            updatedRange[index] = { ...updatedRange[index], [field]: value };
            return { ...prev, range: updatedRange };
        });
    };

    const addRange = () => {
        setPayload((prev) => ({
            ...prev,
            range: [
                ...(prev.range || []),
                { name: "", min: undefined, max: undefined, fromAge: undefined, toAge: undefined, gender: "Both", dateType: "Year" }
            ]
        }));
    };

    const removeRange = (index: number) => {
        setPayload((prev) => ({
            ...prev,
            range: (prev.range || []).filter((_, i) => i !== index)
        }));
    };

    const updateTest = useCallback(
        async (data: {
            code: string;
            name: string;
            price: number;
            type: "" | "Lab" | "Imaging";
            dataType: "number" | "text" | "boolean" | "options";
            unit?: string | null;
            range?: any[];
            note?: string;
            estimatedTime?: string;
            options?: string[];
        }) => {
            try {
                let finalPayload = { ...data };

                if (data.dataType === "options") {
                    finalPayload.range = [];
                    finalPayload.note = "";
                    finalPayload.unit = null;
                }

                // Defer clearing fields until save if data type is not number
                if (data.dataType !== "number") {
                    finalPayload.range = [];
                    finalPayload.note = "";
                    if (data.dataType === "boolean") {
                        finalPayload.unit = null;
                    }
                }

                if (data.estimatedTime && typeof data.estimatedTime === 'string') {
                    const [hoursStr, minutesStr] = data.estimatedTime.split(':');
                    const hours = parseInt(hoursStr || '0', 10);
                    const minutes = parseInt(minutesStr || '0', 10);
                    finalPayload.estimatedTime = (hours * 60 + minutes) as any;
                }

                await toast.promise(api.patch(`/lab/panels/test/${payload._id}`, finalPayload), {
                    loading: "Updating Test",
                    success: "Test Updated Successfully",
                    error: (err) => err?.response?.data?.message || "Failed to Update Test"
                })
                setEditOpen(false)
                testMutate()
            } catch (error) {

            }
        },
        [testMutate, payload._id],
    )

    const deleteTest = useCallback(
        async () => {
            try {
                setIsDeleting(true);
                await toast.promise(api.delete(`/lab/panels/test/${test._id}`), {
                    loading: "Deleting Test...",
                    success: "Test Deleted Successfully",
                    error: (err) => err?.response?.data?.message || "Failed to Delete Test"
                });

                setDeleteOpen(false);
                testMutate();
            } catch (error) {
                console.error("Delete error:", error);
            } finally {
                setIsDeleting(false);
            }
        },
        [test._id, testMutate],
    )



    return (
        <TableRow onContextMenu={(e) => { e.preventDefault(); setViewOpen(true); }} className="cursor-context-menu">
            <TableCell>{idx + 1}</TableCell>
            <TableCell className='whitespace-break-spaces max-w-52'>{test.name}</TableCell>
            <TableCell className="font-medium max-w-36"> <p className='whitespace-break-spaces'>{test.code}</p></TableCell>
            <TableCell className="text-slate-500 text-sm max-w-48 whitespace-break-spaces">
                {(test.range && test.range.length > 0) ? (
                    test.range.map((r, i) => (
                        <div key={i} className="mb-1 last:mb-0">
                            <strong>{r.name || "Default"}:</strong> {r.min ?? "-"} to {r.max ?? "-"}
                        </div>
                    ))
                ) : (
                    "No range"
                )}
            </TableCell>
            <TableCell className="text-slate-500">{test.unit}</TableCell>
            <TableCell>{formatINR(test.price)}</TableCell>
            <TableCell>{test.estimatedTime || ""}</TableCell>
            <TableCell>{test.panels.map((panel) => panel.name).join(", ")}</TableCell>
            <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${test.type === 'Lab' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {test.type}
                </span>
            </TableCell>
            <TableCell className="text-slate-500 text-sm max-w-48 whitespace-break-spaces">
                {test.method ?? "-"}
            </TableCell>
            <TableCell className="text-slate-500 text-sm max-w-48 whitespace-break-spaces">
                {test.specimen ?? "-"}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex flex-row items-center justify-end">
                    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Eye className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25 lg:max-w-125">
                            <DialogHeader>
                                <DialogTitle>Test Details</DialogTitle>
                                <DialogDescription>
                                    Details for {test.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4">

                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Name</Label>
                                        <p className="font-medium text-sm">{test.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Code</Label>
                                        <p className="font-medium text-sm">{test.code}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Type</Label>
                                        <p className="font-medium text-sm">{test.type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Price</Label>
                                        <p className="font-medium text-sm">{formatINR(test.price)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Data Type</Label>
                                        <p className="font-medium text-sm">{test.dataType}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Unit</Label>
                                        <p className="font-medium text-sm">{test.unit || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Estimated Duration</Label>
                                        <p className="font-medium text-sm">{test.estimatedTime ? `${test.estimatedTime} Minutes` : "N/A"}</p>
                                    </div>
                                </div>

                                {test.dataType === 'options' && (
                                    <>
                                        <div className="my-2 border-t border-slate-200" />
                                        <h4 className="font-semibold text-sm">Predefined Options</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {test.options?.length > 0 ? (
                                                test.options.map((option, idx) => (
                                                    <span
                                                        key={option}
                                                        className="bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200"
                                                    >
                                                        {option}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-500 italic">No options defined.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {test.dataType === 'number' && (
                                    <>
                                        <div className="my-2 border-t border-slate-200" />
                                        <h4 className="font-semibold text-sm">Reference Ranges</h4>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            {(test.range || []).map((r, i) => (
                                                <div key={i} className="bg-slate-50 p-2 rounded-md border border-slate-200 text-sm flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">{r.name || "Default"}</span>
                                                        <span className="text-slate-500 ml-2">
                                                            {r.min ?? "Any"} min - {r.max ?? "Any"} max
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {r.gender} • {r.fromAge ?? "0"} to {r.toAge ?? "Any"} {r.dateType}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!test.range || test.range.length === 0) && (
                                                <p className="text-xs text-slate-500 italic">No ranges defined.</p>
                                            )}
                                        </div>
                                        {test.note && (
                                            <div className="mt-3 space-y-1">
                                                <Label className="text-slate-500 text-xs">Notes</Label>
                                                <p className="text-sm whitespace-break-spaces border p-2 rounded bg-slate-50 text-slate-700">{test.note}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center pt-4 border-t mt-4 gap-2 w-full">
                                <Button variant="destructive" size="sm" onClick={() => { setViewOpen(false); setDeleteOpen(true); }} className="w-full sm:w-auto">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setViewOpen(false)}>Close</Button>
                                    <Button size="sm" onClick={() => { setViewOpen(false); setEditOpen(true); }}>
                                        <Pencil className="w-4 h-4 mr-2" /> Edit Test
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Pencil className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Test</DialogTitle>
                                <DialogDescription>
                                    Make changes to the test here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 grid gap-4">
                                <div className="grid grid-cols-12 gap-4">

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Test Name *</Label>
                                        <Input
                                            defaultValue={test.name}
                                            onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Test Code *</Label>
                                        <Input
                                            type="text"
                                            defaultValue={test.code}
                                            onChange={(e) => setPayload({ ...payload, code: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Price *</Label>
                                        <Input
                                            type="number"
                                            defaultValue={test.price}
                                            onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Method</Label>
                                        <Input
                                            placeholder='e.g. Impedance'
                                            type="text"
                                            defaultValue={test.method}
                                            onChange={(e) => setPayload({ ...payload, method: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Specimen</Label>
                                        <Input
                                            type="text"
                                            placeholder='e.g. Blood'
                                            defaultValue={test.specimen}
                                            onChange={(e) => setPayload({ ...payload, specimen: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Type *</Label>
                                        <Select
                                            value={payload.type}
                                            onValueChange={(val: "Lab" | "Imaging") => setPayload(prev => ({ ...prev, type: val, dataType: val === "Lab" ? "number" : "text" }))}
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
                                            value={payload.estimatedTime || ""}
                                            type="text"
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, "");
                                                if (val.length > 4) val = val.slice(0, 4);
                                                if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                                setPayload((prev) => ({ ...prev, estimatedTime: val }));
                                            }}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Unit</Label>
                                        <Input
                                            placeholder="e.g. mg/dL"
                                            value={payload.unit ?? ""}
                                            onChange={(e) => setPayload((prev) => ({ ...prev, unit: e.target.value }))}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Data Type *</Label>
                                        <Select
                                            value={payload.dataType}
                                            onValueChange={(val: "number" | "text" | "boolean" | "options") => {
                                                setPayload((prev) => ({ ...prev, dataType: val }));
                                            }}
                                        >
                                            <SelectTrigger className="h-9 bg-slate-50 w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="boolean">Positive/Negative</SelectItem>
                                                <SelectItem value="options">Options</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {payload.dataType === "options" && <>
                                        <div className="col-span-4 space-y-1.5 ">
                                            <Label className="text-xs font-medium text-slate-700">Add Options</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    className="h-9 bg-slate-50 flex-1"
                                                    placeholder="Enter Option"
                                                    id={`edit-option-input-${test._id}`}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.currentTarget;
                                                            const value = input.value.trim();
                                                            if (value) {
                                                                setPayload(prev => ({ ...prev, options: [...prev.options, value] }));
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const input = document.getElementById(`edit-option-input-${test._id}`) as HTMLInputElement;
                                                        const value = input.value.trim();
                                                        if (value) {
                                                            setPayload(prev => ({ ...prev, options: [...prev.options, value] }));
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="h-9 w-9 p-0 bg-slate-50 shrink-0"
                                                >
                                                    <Plus className="h-4 w-4" color="grey" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {payload.options.map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                                        <span>{opt}</span>
                                                        <button
                                                            onClick={() => setPayload(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))}
                                                            className="text-slate-400 hover:text-red-500"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>}

                                    {payload.dataType === "number" && <div className="col-span-full w-full">
                                        <Table className="">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">Sl No</TableHead>
                                                    <TableHead>Range Name</TableHead>
                                                    <TableHead className="w-26">Min</TableHead>
                                                    <TableHead className="w-26">Max</TableHead>
                                                    <TableHead className="w-20">From Age <br /> <span className="font-normal text-xs text-slate-500">(Optional)</span></TableHead>
                                                    <TableHead className="w-20">To Age <br /> <span className="font-normal text-xs text-slate-500">(Optional)</span></TableHead>
                                                    <TableHead className="w-20">Gender</TableHead>
                                                    <TableHead className="w-20">Y/M/D</TableHead>
                                                    <TableHead className="w-20">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(payload.range || []).map((r, i) => (
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
                                                                onChange={(e) => handleRangeChange(i, "min", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="Max"
                                                                value={r.max ?? ""}
                                                                onChange={(e) => handleRangeChange(i, "max", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="From"
                                                                value={r.fromAge ?? ""}
                                                                onChange={(e) => handleRangeChange(i, "fromAge", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="To"
                                                                value={r.toAge ?? ""}
                                                                onChange={(e) => handleRangeChange(i, "toAge", e.target.value ? Number(e.target.value) : undefined)}
                                                                className="h-8 shadow-none bg-slate-50 px-2"
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
                                                {(!payload.range || payload.range.length === 0) && (
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
                                        <div className="space-y-2 mt-3">
                                            <Label className="font-medium text-slate-700">Alert</Label>
                                            <p className="text-sm text-slate-500">When only a minimum value is specified, all values greater than that are considered normal. When only a maximum value is specified, all values less than that are considered normal. If no value is specified or only a note is given, then the system will not highlight abnormal values automatically.
                                                <br /> <br />
                                                When only a from age is specified, all ages greater than that are considered. When only a top age is specified, all ages less than that are considered normal. If no age is specified, then the system will consider all ages.
                                            </p>
                                        </div>
                                    </div>}

                                    <div className="col-span-full space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Notes</Label>
                                        <Textarea
                                            placeholder="Note"
                                            value={payload.note || ""}
                                            onChange={(e) =>
                                                setPayload((prev) => ({ ...prev, note: e.target.value }))
                                            }
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-12 gap-4 col-span-full mt-4">
                                        <div className="col-span-full flex justify-end items-end w-full gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setEditOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => {
                                                    updateTest(payload as any);
                                                }}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Trash2 className='h-4 w-4 text-slate-500 hover:text-red-500' />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Test</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{test.name}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deleteTest} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>}
                </div>
            </TableCell>
        </TableRow>

    )
}
