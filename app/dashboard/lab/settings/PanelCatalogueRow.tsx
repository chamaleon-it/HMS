import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from "@/lib/axios";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table'
import { formatINR } from '@/lib/fNumber';
import { Eye, Pencil, Trash2, Plus, Search, GripVertical, Check } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

function SortableTableRow({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        position: isDragging ? 'relative' as const : undefined,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(className, "cursor-grab active:cursor-grabbing", isDragging && "bg-slate-100 opacity-80 shadow-lg z-50 relative")}
        >
            <TableCell className="w-8 p-0 text-center">
                <div className="p-2 text-slate-400 hover:text-slate-600">
                    <GripVertical className="h-4 w-4" />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
}


export default function PanelCatalogueRow({
    panel,
    idx,
    tests,
    onAddTests,
    onRemoveTests,
    panelMutate,
}: {
    panel: { name: string; price: number; tests?: any[]; estimatedTime?: number; mainHeading?: string; method?: string; subheadings?: string[]; testSubheadings?: Record<string, string>; };
    idx: number;
    tests: any[];
    onAddTests: () => void;
    onRemoveTests: () => void;
    panelMutate: () => void;
}) {


    const initialPanelTests = panel.tests?.length ? panel.tests : tests.filter(t => t.panels?.some((p: any) => p.name === panel.name));


    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Modal State
    const [payload, setPayload] = useState<{
        name: string;
        price: number;
        estimatedTime: number;
        mainHeading: string;
        method: string;
        subheadings: string[];
        testSubheadings: Record<string, string>;
    }>({
        name: panel.name,
        price: panel.price,
        estimatedTime: panel.estimatedTime || 0,
        mainHeading: panel.mainHeading ?? "",
        method: panel.method ?? "",
        subheadings: panel.subheadings || [],
        testSubheadings: panel.testSubheadings || {}
    });

    const [selectedTests, setSelectedTests] = useState<any[]>(initialPanelTests);
    const [searchTestQuery, setSearchTestQuery] = useState("");
    const [addTestDropdownOpen, setAddTestDropdownOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setSelectedTests((items) => {
                const oldIndex = items.findIndex(t => t._id === active.id);
                const newIndex = items.findIndex(t => t._id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSlNoChange = (testId: string, newSlNo: string) => {
        if (!newSlNo || newSlNo.trim() === "") return;
        const index = parseInt(newSlNo) - 1;
        if (isNaN(index)) return;

        setSelectedTests((prev) => {
            const oldIndex = prev.findIndex(t => t._id === testId);
            if (oldIndex === -1) return prev;

            const targetIndex = Math.max(0, Math.min(index, prev.length - 1));
            if (oldIndex === targetIndex) return prev;

            return arrayMove(prev, oldIndex, targetIndex);
        });
    };


    // Sync Edit State when modal opens
    useEffect(() => {
        if (editOpen) {
            setSelectedTests(initialPanelTests);
            setPayload({
                name: panel.name,
                price: panel.price,
                estimatedTime: panel.estimatedTime || 0,
                mainHeading: panel.mainHeading ?? "",
                method: panel.method ?? "",
                subheadings: panel.subheadings || [],
                testSubheadings: panel.testSubheadings || {}
            });
            setSearchTestQuery("");
        }
    }, [editOpen, initialPanelTests.length, panel.name, panel.price, panel.estimatedTime, panel.mainHeading, panel.subheadings, panel.testSubheadings]);

    const updatePanel = useCallback(async () => {
        try {
            const updatePayload = {
                ...payload,
                tests: selectedTests.map(t => t._id),
                subheadings: payload.subheadings.filter(s => s.trim() !== ""),
                testSubheadings: payload.testSubheadings
            };


            await toast.promise(api.patch(`/lab/panels/${panel.name}`, updatePayload), {
                loading: "Updating panel...",
                success: "Panel updated successfully",
                error: ({ response }) => response.data.message,
            });

            panelMutate();
            setEditOpen(false);
        } catch (error) {
            console.error(error);
        }
    }, [payload, selectedTests, panel.name, panelMutate]);

    const deletePanel = useCallback(async () => {
        try {
            setIsDeleting(true);
            await toast.promise(api.delete(`/lab/panels/${panel.name}`), {
                loading: "Deleting Panel...",
                success: "Panel deleted successfully",
                error: ({ response }) => response.data.message,
            });
            panelMutate();
            setDeleteOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    }, [panel.name, panelMutate]);

    const handleAddTest = (test: any) => {
        if (!selectedTests.find(t => t._id === test._id)) {
            setSelectedTests([...selectedTests, test]);
        }
        setSearchTestQuery("");
        setAddTestDropdownOpen(false);
    }


    const formatRange = (t: any) => {

        const range = t.range as { name?: string, fromAge?: number, toAge?: number, gender?: string, min?: number, max?: number }[]
        if (!range) return "N/A"

        const ranges = range.map(r => {
            const ageStr = (r.fromAge || r.toAge) ? `${r.fromAge || 0}-${r.toAge || 0}` : ""
            const genderStr = r.gender ? r.gender === "Male" ? "M" : r.gender === "Female" ? "F" : r.gender : ""
            const nameStr = r.name ? r.name : ""
            const valStr = `${r.min || 0}-${r.max || 0}`

            return [nameStr, ageStr, genderStr, valStr].filter(Boolean).join(" ")
        })

        return ranges.length > 0 ? ranges.join(' | ') : 'N/A';
    }


    return (
        <TableRow onContextMenu={(e) => { e.preventDefault(); setViewOpen(true); }} className="cursor-context-menu">
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{panel.name}</TableCell>
            <TableCell>{formatINR(panel.price)}</TableCell>
            <TableCell>{panel.estimatedTime ? `${panel.estimatedTime} Minutes` : "N/A"}</TableCell>
            <TableCell className='uppercase'>{panel.method || "-"}</TableCell>
            <TableCell align="left">
                <div className="flex gap-1 items-center justify-end">

                    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Eye className='h-4 w-4 text-slate-500' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Panel Details: {panel.name}</DialogTitle>
                                <DialogDescription>
                                    View panel overview and included tests.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Name</Label>
                                        <p className="font-medium text-sm">{panel.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Price</Label>
                                        <p className="font-medium text-sm">{formatINR(panel.price)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-slate-500">Estimated Duration</Label>
                                        {panel?.estimatedTime ? <p className="font-medium text-sm">{panel?.estimatedTime > 0 ? `${panel?.estimatedTime} Minutes` : "N/A"}</p> : <p className="font-medium text-sm">N/A</p>}
                                    </div>
                                </div>

                                <div className="space-y-1 mt-2">
                                    <Label className="text-slate-800 font-bold mb-2 block">Included Tests ({initialPanelTests.length})</Label>
                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead>Test Name</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Reference Range</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {initialPanelTests.length > 0 ? initialPanelTests.map(t => (
                                                    <TableRow key={t._id}>
                                                        <TableCell className="font-medium text-xs">{t.name} <span className="text-slate-400 text-[10px]">({t.code})</span></TableCell>
                                                        <TableCell className="text-xs">{t.unit || 'N/A'}</TableCell>
                                                        <TableCell className="text-slate-500 text-xs">{formatRange(t)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">No tests in this panel.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center pt-4 border-t mt-4 gap-2 w-full">
                                <Button variant="destructive" size="sm" onClick={() => { setViewOpen(false); setDeleteOpen(true); }} className="w-full sm:w-auto">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setViewOpen(false)}>Close</Button>
                                    <Button size="sm" onClick={() => { setViewOpen(false); setEditOpen(true); }}>
                                        <Pencil className="w-4 h-4 mr-2" /> Edit Panel
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
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Panel: {panel.name}</DialogTitle>
                                <DialogDescription>
                                    Modify panel details and tests.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-3 items-start gap-4 p-4 bg-slate-50 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor={`panel-name-${idx}`}>Name</Label>
                                        <Input id={`panel-name-${idx}`} value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`panel-price-${idx}`}>Price (₹)</Label>
                                        <Input id={`panel-price-${idx}`} type="number" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <Label htmlFor={`panel-eta-${idx}`}>ETA (Minutes)</Label>
                                        <Input id={`panel-eta-${idx}`} type="number" value={payload.estimatedTime} onChange={(e) => setPayload({ ...payload, estimatedTime: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="add-panel-main-heading">Main Heading <span className="text-slate-500 font-normal">(Printed on report)</span></Label>
                                        <Input
                                            id={`panel-main-heading-${idx}`}
                                            placeholder="e.g. Haematology"
                                            value={payload.mainHeading}
                                            onChange={(e) => setPayload({ ...payload, mainHeading: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <Label htmlFor={`panel-method-${idx}`}>Method <span className="text-slate-500 font-normal">(Optional)</span></Label>
                                        <Input id={`panel-method-${idx}`} type="text" value={payload.method} onChange={(e) => setPayload({ ...payload, method: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-800 font-bold mb-2 block border-b pb-2">Subheadings <span className="text-slate-500 font-normal text-xs">(Ordered)</span></Label>
                                    <div className="space-y-2">
                                        {payload.subheadings.map((sh, sIdx) => (
                                            <div key={sIdx} className="flex gap-2 items-center">
                                                <Input
                                                    placeholder="e.g. RBC"
                                                    value={sh}
                                                    className="h-9 w-64"
                                                    onChange={(e) => {
                                                        const newSh = [...payload.subheadings];
                                                        newSh[sIdx] = e.target.value;
                                                        setPayload({ ...payload, subheadings: newSh });
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-2 text-red-500 hover:text-red-700"
                                                    onClick={() => {
                                                        const newSh = payload.subheadings.filter((_, i) => i !== sIdx);
                                                        setPayload({ ...payload, subheadings: newSh });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <div className="flex flex-col ml-2">
                                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" disabled={sIdx === 0} onClick={() => {
                                                        const newSh = [...payload.subheadings];
                                                        [newSh[sIdx - 1], newSh[sIdx]] = [newSh[sIdx], newSh[sIdx - 1]];
                                                        setPayload({ ...payload, subheadings: newSh });
                                                    }}>↑</Button>
                                                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" disabled={sIdx === payload.subheadings.length - 1} onClick={() => {
                                                        const newSh = [...payload.subheadings];
                                                        [newSh[sIdx + 1], newSh[sIdx]] = [newSh[sIdx], newSh[sIdx + 1]];
                                                        setPayload({ ...payload, subheadings: newSh });
                                                    }}>↓</Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPayload({ ...payload, subheadings: [...payload.subheadings, ""] })}
                                        >
                                            + Add Subheading
                                        </Button>
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <Label className="text-slate-800 font-bold mb-2 block border-b pb-2">Modify Tests in Panel</Label>
                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <div
                                            className="max-h-100 overflow-y-auto w-full"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                                            >
                                                <Table>
                                                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                                        <TableRow>
                                                            <TableHead className="w-8 p-0 bg-slate-50"></TableHead>
                                                            <TableHead className="w-20 bg-slate-50">SL No</TableHead>
                                                            <TableHead className="w-25 bg-slate-50">Code</TableHead>
                                                            <TableHead className="bg-slate-50">Test Name</TableHead>
                                                            <TableHead className="w-40 bg-slate-50">Subheading</TableHead>
                                                            <TableHead className="w-25 text-right bg-slate-50">Action</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <SortableContext
                                                            items={selectedTests.map(t => t._id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            {selectedTests.map((t, sIdx) => (
                                                                <SortableTableRow key={t._id} id={t._id}>
                                                                    <TableCell className="py-2">
                                                                        <Input
                                                                            className="h-8 w-14 text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                            type="number"
                                                                            defaultValue={sIdx + 1}
                                                                            key={`sl-${t._id}-${sIdx}-${selectedTests.length}`}
                                                                            onPointerDown={(e) => e.stopPropagation()}
                                                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleSlNoChange(t._id, (e.target as HTMLInputElement).value);
                                                                                    (e.target as HTMLInputElement).blur();
                                                                                }
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                const val = e.target.value;
                                                                                if (val && parseInt(val) !== sIdx + 1) {
                                                                                    handleSlNoChange(t._id, val);
                                                                                }
                                                                            }}
                                                                            min={1}
                                                                            max={selectedTests.length}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-slate-500">{t.code}</TableCell>
                                                                    <TableCell className="font-medium text-sm">{t.name}</TableCell>
                                                                    <TableCell>
                                                                        <Select
                                                                            value={payload.testSubheadings[t._id] || "none"}
                                                                            onValueChange={(val) => {
                                                                                const newTs = { ...payload.testSubheadings };
                                                                                if (val === "none") {
                                                                                    delete newTs[t._id];
                                                                                } else {
                                                                                    newTs[t._id] = val;
                                                                                }
                                                                                setPayload({ ...payload, testSubheadings: newTs });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="h-8 shadow-none bg-slate-50">
                                                                                <SelectValue placeholder="None" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none" className="text-slate-400 italic">None</SelectItem>
                                                                                {payload.subheadings.filter(s => s.trim() !== "").map((sh, shIdx) => (
                                                                                    <SelectItem key={shIdx} value={sh}>{sh}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="text-right py-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onPointerDown={(e) => e.stopPropagation()}
                                                                            onClick={() => setSelectedTests(selectedTests.filter(st => st._id !== t._id))}
                                                                        >
                                                                            <Trash2 className='h-4 w-4 text-red-500' />
                                                                        </Button>
                                                                    </TableCell>
                                                                </SortableTableRow>
                                                            ))}
                                                        </SortableContext>
                                                    </TableBody>
                                                </Table>
                                            </DndContext>
                                        </div>

                                        <div className="border-t bg-slate-50/30">
                                            <Table>
                                                <TableBody>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableCell className="py-2" colSpan={3}>
                                                            <Popover open={addTestDropdownOpen} onOpenChange={setAddTestDropdownOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={addTestDropdownOpen}
                                                                        className="w-full justify-start text-muted-foreground font-normal hover:bg-white bg-white h-10 shadow-sm"
                                                                    >
                                                                        <Search className="mr-2 h-4 w-4 opacity-50" />
                                                                        {selectedTests.length === tests.length
                                                                            ? "All tests added to panel..."
                                                                            : "Search and add test to panel..."}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-200 p-0" align="start">
                                                                    <Command filter={(value, search) => {
                                                                        if (!search) return 1;
                                                                        const v = value.toLowerCase();
                                                                        const s = search.toLowerCase().trim();
                                                                        const words = s.split(/\s+/);
                                                                        return words.every(w => v.includes(w)) ? 1 : 0;
                                                                    }}>
                                                                        <CommandInput placeholder="Type test name or code..." className="h-11" />
                                                                        <CommandList className="max-h-[350px]" onWheel={(e) => e.stopPropagation()}>
                                                                            <CommandEmpty>No test found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {[...tests]
                                                                                    .sort((a, b) => {
                                                                                        const aSelected = selectedTests.some(st => st._id === a._id);
                                                                                        const bSelected = selectedTests.some(st => st._id === b._id);
                                                                                        if (aSelected === bSelected) return 0;
                                                                                        return aSelected ? 1 : -1;
                                                                                    })
                                                                                    .map((t) => {
                                                                                        const isSelected = selectedTests.find(st => st._id === t._id);
                                                                                        return (
                                                                                            <CommandItem
                                                                                                key={t._id}
                                                                                                value={`${t.name} ${t.code || ''} ${t.unit || ''}`}
                                                                                                onSelect={() => {
                                                                                                    if (!isSelected) handleAddTest(t);
                                                                                                }}
                                                                                                className={cn(
                                                                                                    "flex justify-between items-center py-2.5 px-3",
                                                                                                    isSelected ? "opacity-50 cursor-default" : "cursor-pointer"
                                                                                                )}
                                                                                            >
                                                                                                <div className="flex flex-col">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span className="font-medium">{t.name}</span>
                                                                                                        {isSelected && (
                                                                                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                                                                                                <Check className="h-2.5 w-2.5" /> Added
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <span className="text-xs text-muted-foreground">{t.code} | {t.unit || 'No unit'}</span>
                                                                                                </div>
                                                                                                {!isSelected && <Plus className="h-4 w-4 text-emerald-500 opacity-70" />}
                                                                                            </CommandItem>
                                                                                        );
                                                                                    })}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 italic">Search by test name, code, or unit. Already added tests appear at the bottom.</p>
                                </div>

                            </div>
                            <DialogFooter>
                                <Button onClick={updatePanel}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <Trash2 className='h-4 w-4 text-slate-500 hover:text-red-500' />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Panel</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{panel.name}</strong>? This will not delete the associated tests.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deletePanel} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </TableCell>
        </TableRow>

    )
}
