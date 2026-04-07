import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table'
import api from '@/lib/axios';
import { formatINR } from '@/lib/fNumber';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
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
        type: "Lab" | "Imaging";
        min?: number;
        max?: number;
        womenMin?: number;
        womenMax?: number;
        childMin?: number;
        childMax?: number;
        nbMin?: number;
        nbMax?: number;
        unit?: string;
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
        panel: { name: string }[];
        min: number | null | undefined;
        max: number | null | undefined;
        womenMin: number | null | undefined;
        womenMax: number | null | undefined;
        childMin: number | null | undefined;
        childMax: number | null | undefined;
        nbMin: number | null | undefined;
        nbMax: number | null | undefined;
        unit: string | null | undefined;
        estimatedTime?: string;
        _id: string;
        dataType: "number" | "text" | "boolean" | "options";
        options: string[];
    }>({
        code: test.code,
        name: test.name,
        type: test.type,
        price: test.price,
        panel: test.panels,
        min: test.min,
        max: test.max,
        womenMin: test.womenMin,
        womenMax: test.womenMax,
        childMin: test.childMin,
        childMax: test.childMax,
        nbMin: test.nbMin,
        nbMax: test.nbMax,
        unit: test.unit,
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
                panel: test.panels,
                min: test.min,
                max: test.max,
                womenMin: test.womenMin,
                womenMax: test.womenMax,
                childMin: test.childMin,
                childMax: test.childMax,
                nbMin: test.nbMin,
                nbMax: test.nbMax,
                unit: test.unit,
                estimatedTime: test.estimatedTime ? `${String(Math.floor(Number(test.estimatedTime) / 60)).padStart(2, '0')}:${String(Number(test.estimatedTime) % 60).padStart(2, '0')}` : undefined,
                _id: test._id,
                dataType: test.dataType,
                options: test.options || []
            });
        }
    }, [editOpen, test]);


    const updateTest = useCallback(
        async (data: {
            code: string;
            name: string;
            price: number;
            type: "" | "Lab" | "Imaging";
            dataType: "number" | "text" | "boolean" | "options";
            min?: number | null;
            max?: number | null;
            womenMin?: number | null;
            womenMax?: number | null;
            childMin?: number | null;
            childMax?: number | null;
            nbMin?: number | null;
            nbMax?: number | null;
            unit?: string | null;
            estimatedTime?: string;
            options?: string[];
        }) => {
            try {
                let finalPayload = { ...data };

                if (data.dataType === "options") {
                    finalPayload.min = null;
                    finalPayload.max = null;
                    finalPayload.womenMin = null;
                    finalPayload.womenMax = null;
                    finalPayload.childMin = null;
                    finalPayload.childMax = null;
                    finalPayload.nbMin = null;
                    finalPayload.nbMax = null;
                    finalPayload.unit = null;
                }

                // Defer clearing fields until save if data type is not number
                if (data.dataType !== "number") {
                    finalPayload.min = null;
                    finalPayload.max = null;
                    finalPayload.womenMin = null;
                    finalPayload.womenMax = null;
                    finalPayload.childMin = null;
                    finalPayload.childMax = null;
                    finalPayload.nbMin = null;
                    finalPayload.nbMax = null;
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
            <TableCell className="text-slate-500 text-sm">
                Normal : {test.min} {test.max && "-"} {test.max}
                <br />
                Women : {test.womenMin} - {test.womenMax}
                <br />
                Child : {test.childMin} - {test.childMax}
                <br />
                NB : {test.nbMin} - {test.nbMax}
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs">General Range</Label>
                                                <p className="font-medium text-sm">{test.min} - {test.max}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs">Women Range</Label>
                                                <p className="font-medium text-sm">{test.womenMin} - {test.womenMax}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs">Child Range</Label>
                                                <p className="font-medium text-sm">{test.childMin} - {test.childMax}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs">Newborn Range</Label>
                                                <p className="font-medium text-sm">{test.nbMin} - {test.nbMax}</p>
                                            </div>
                                        </div>
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
                        <DialogContent className="sm:max-w-200 max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Test</DialogTitle>
                                <DialogDescription>
                                    Make changes to the test here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 grid gap-4">
                                <div className="grid grid-cols-12 gap-4">

                                    <div className="col-span-4 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Test Name *</Label>
                                        <Input
                                            defaultValue={test.name}
                                            onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Test Code *</Label>
                                        <Input
                                            type="text"
                                            defaultValue={test.code}
                                            onChange={(e) => setPayload({ ...payload, code: e.target.value })}
                                            className="h-9 bg-slate-50"
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-700">Price *</Label>
                                        <Input
                                            type="number"
                                            defaultValue={test.price}
                                            onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })}
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

                                    {payload.dataType === "number" && <>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Range Min</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={payload.min ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, min: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>

                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Range Max</Label>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                value={payload.max ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, max: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>

                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Women Range Min</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={payload.womenMin ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, womenMin: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Women Range Max</Label>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                value={payload.womenMax ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, womenMax: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>

                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Child Range Min</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={payload.childMin ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, childMin: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Child Range Max</Label>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                value={payload.childMax ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, childMax: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>

                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Newborn Range Min</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={payload.nbMin ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, nbMin: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Newborn Range Max</Label>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                value={payload.nbMax ?? ""}
                                                onChange={(e) => setPayload((prev) => ({ ...prev, nbMax: e.target.value === "" ? null : Number(e.target.value) }))}
                                                className="h-9 bg-slate-50"
                                            />
                                        </div>
                                    </>}

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
