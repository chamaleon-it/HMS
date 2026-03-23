import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table'
import api from '@/lib/axios';
import { formatINR } from '@/lib/fNumber';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast';
import configuration from '@/config/configuration';

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
    testMutate,
}: {
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
        dataType: "number" | "text" | "boolean"
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
        dataType: "number" | "text" | "boolean"
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
        dataType: test.dataType
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
                dataType: test.dataType
            });
        }
    }, [editOpen, test]);


    const updateTest = useCallback(
        async (data: {
            code: string;
            name: string;
            price: number;
            type: "" | "Lab" | "Imaging";
            dataType: "number" | "text" | "boolean";
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
        }) => {
            try {
                let finalPayload = { ...data };

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
                    error: "Failed to Update Test"
                })
                setEditOpen(false)
                testMutate()
            } catch (error) {
                toast.error(`Failed to Update Test : ${error}`)
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
        <TableRow>
            <TableCell className="font-medium">{test.code}</TableCell>
            <TableCell>{test.name}</TableCell>
            <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${test.type === 'Lab' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {test.type}
                </span>
            </TableCell>
            <TableCell>{formatINR(test.price)}</TableCell>
            <TableCell>{test.estimatedTime || ""}</TableCell>
            <TableCell>{test.panels.map((panel) => panel.name).join(", ")}</TableCell>
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
            <TableCell>
                <div className="flex gap-2 items-center justify-end">
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
                                        <Label className="text-slate-500">Code</Label>
                                        <p className="font-medium text-sm">{test.code}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Name</Label>
                                        <p className="font-medium text-sm">{test.name}</p>
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
                        </DialogContent>
                    </Dialog>

                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Pencil className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25 lg:max-w-125">
                            <DialogHeader>
                                <DialogTitle>Edit Test</DialogTitle>
                                <DialogDescription>
                                    Make changes to the test here. Click save when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`code-${test._id}`} className="text-right col-span-2">Code</Label>
                                    <Input id={`code-${test._id}`} defaultValue={test.code} className="col-span-4" disabled />
                                </div>
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`name-${test._id}`} className="text-right col-span-2">Name</Label>
                                    <Input id={`name-${test._id}`} defaultValue={test.name} className="col-span-4" onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`type-${test._id}`} className="text-right col-span-2">Type</Label>
                                    <Select defaultValue={test.type} onValueChange={(value: "Lab" | "Imaging") => setPayload({ ...payload, type: value })}>
                                        <SelectTrigger id={`type-${test._id}`} className="col-span-4 w-full">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Lab">Lab</SelectItem>
                                            <SelectItem value="Imaging">Imaging</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`price-${test._id}`} className="text-right col-span-2">Price</Label>
                                    <Input id={`price-${test._id}`} type="number" defaultValue={test.price} className="col-span-4" onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} />
                                </div>

                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`dataType-${test._id}`} className="text-right col-span-2">Data Type</Label>
                                    <Select value={payload.dataType} onValueChange={(value: "number" | "text" | "boolean") => {
                                        setPayload({ ...payload, dataType: value });
                                    }}>
                                        <SelectTrigger id={`dataType-${test._id}`} className="col-span-4 w-full">
                                            <SelectValue placeholder="Select a data type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="boolean">Positive/Negative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {payload.dataType === "number" && (
                                    <>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`min-${test._id}`} className="text-right col-span-2">Min Value</Label>
                                            <Input id={`min-${test._id}`} type="number" value={payload.min ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, min: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`max-${test._id}`} className="text-right col-span-2">Max Value</Label>
                                            <Input id={`max-${test._id}`} type="number" value={payload.max ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, max: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`womenMin-${test._id}`} className="text-right col-span-2">Women Min</Label>
                                            <Input id={`womenMin-${test._id}`} type="number" value={payload.womenMin ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, womenMin: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`womenMax-${test._id}`} className="text-right col-span-2">Women Max</Label>
                                            <Input id={`womenMax-${test._id}`} type="number" value={payload.womenMax ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, womenMax: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`childMin-${test._id}`} className="text-right col-span-2">Child Min</Label>
                                            <Input id={`childMin-${test._id}`} type="number" value={payload.childMin ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, childMin: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`childMax-${test._id}`} className="text-right col-span-2">Child Max</Label>
                                            <Input id={`childMax-${test._id}`} type="number" value={payload.childMax ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, childMax: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`nbMin-${test._id}`} className="text-right col-span-2">Newborn Min</Label>
                                            <Input id={`nbMin-${test._id}`} type="number" value={payload.nbMin ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, nbMin: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                        <div className="grid grid-cols-6 items-center gap-4">
                                            <Label htmlFor={`nbMax-${test._id}`} className="text-right col-span-2">Newborn Max</Label>
                                            <Input id={`nbMax-${test._id}`} type="number" value={payload.nbMax ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, nbMax: e.target.value === "" ? null : Number(e.target.value) })} />
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`unit-${test._id}`} className="text-right col-span-2">Unit</Label>
                                    <Input id={`unit-${test._id}`} value={payload.unit ?? ""} className="col-span-4" onChange={(e) => setPayload({ ...payload, unit: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <Label htmlFor={`estimatedTime-${test._id}`} className="text-right col-span-2">Estimated Duration (HH:MM)</Label>
                                    <Input id={`estimatedTime-${test._id}`} type="text" placeholder="HH:MM" value={payload.estimatedTime || ""} className="col-span-4" onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, "");
                                        if (val.length > 4) val = val.slice(0, 4);
                                        if (val.length >= 3) val = `${val.slice(0, 2)}:${val.slice(2)}`;
                                        setPayload({ ...payload, estimatedTime: val });
                                    }} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    updateTest(payload);
                                    setEditOpen(false);
                                }}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    { <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
                    </AlertDialog> }
                </div>
            </TableCell>
        </TableRow>
    )
}
